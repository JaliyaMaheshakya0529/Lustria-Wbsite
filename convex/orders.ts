import { ConvexError, v } from "convex/values";
import { mutation, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const submit = mutation({
  args: {
    requestId: v.string(), name: v.string(), phone: v.string(), address: v.string(),
    ringSize: v.string(), description: v.string(), budget: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!/^[a-f0-9-]{36}$/.test(args.requestId)) throw new ConvexError("Please reload and try again.");
    const existing = await ctx.db.query("customOrders").withIndex("by_request", q => q.eq("requestId", args.requestId)).unique();
    if (existing) return existing._id;
    for (const field of ["name", "phone", "address", "ringSize", "description"] as const) {
      if (!args[field].trim() || args[field].length > 600) throw new ConvexError("Please check your contact and design details.");
    }
    const phoneDigits = args.phone.replace(/\D/g, "");
    if (!/^\+?[\d ().-]{7,30}$/.test(args.phone) || !/^\d{7,15}$/.test(phoneDigits)) {
      throw new ConvexError("Enter a WhatsApp number with 7 to 15 digits.");
    }
    if (args.budget.length > 60) throw new ConvexError("Please enter a shorter budget.");
    if (args.image && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(args.image)) throw new ConvexError("Choose a JPG, PNG or WebP image.");
    if ((args.image?.length ?? 0) > 350000) throw new ConvexError("Please choose a smaller reference image.");
    const recent = await ctx.db.query("customOrders").withIndex("by_created", q => q.gte("createdAt", Date.now() - 60000)).take(10);
    if (recent.length >= 10) throw new ConvexError("Please wait a minute before submitting.");
    const id = await ctx.db.insert("customOrders", { ...args, createdAt: Date.now(), notification: "queued" });
    await ctx.scheduler.runAfter(0, internal.orders.notify, { id });
    return id;
  },
});

export const claim = internalMutation({
  args: { id: v.id("customOrders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order || order.notification !== "queued") return null;
    await ctx.db.patch(id, { notification: "sending" });
    return order;
  },
});

export const finish = internalMutation({
  args: { id: v.id("customOrders"), notification: v.string(), messageId: v.optional(v.string()) },
  handler: async (ctx, { id, ...update }) => { await ctx.db.patch(id, update); },
});

export const notify = internalAction({
  args: { id: v.id("customOrders") },
  handler: async (ctx, { id }): Promise<void> => {
    const order = await ctx.runMutation(internal.orders.claim, { id });
    if (!order) return;
    const {
      WHATSAPP_TOKEN: token,
      WHATSAPP_SENDER_ID: sender,
      WHATSAPP_RECIPIENT: recipient,
      WHATSAPP_API_VERSION: version = "v25.0",
      WHATSAPP_TEMPLATE_LANGUAGE: language = "en",
      WHATSAPP_TEMPLATE: textTemplate = "lustria_order_alert",
      WHATSAPP_IMAGE_TEMPLATE: imageTemplate = "lustria_order_alert_image",
    } = process.env;
    if (!token || !sender || !recipient) {
      await ctx.runMutation(internal.orders.finish, { id, notification: "configuration_required" });
      return;
    }
    try {
      const parameters = [String(id), order.name, order.phone, order.address, order.ringSize, order.description, order.budget || "Unspecified"]
        .map(text => ({ type: "text", text: text.replace(/\s+/g, " ").trim() }));

      const components: object[] = [{ type: "body", parameters }];
      const templateName = order.image ? imageTemplate : textTemplate;
      if (order.image) {
        const bytes = Uint8Array.from(atob(order.image.split(",")[1]), char => char.charCodeAt(0));
        const form = new FormData();
        form.set("messaging_product", "whatsapp");
        form.set("file", new Blob([bytes], { type: "image/jpeg" }), "design.jpg");
        const upload = await fetch("https://graph.facebook.com/" + version + "/" + sender + "/media", {
          method: "POST", headers: { Authorization: "Bearer " + token }, body: form,
        });
        const media = await upload.json();
        if (!upload.ok || !media.id) throw new Error("Image upload failed");
        components.unshift({ type: "header", parameters: [{ type: "image", image: { id: media.id } }] });
      }
      const response = await fetch("https://graph.facebook.com/" + version + "/" + sender + "/messages", {
        method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: recipient, type: "template",
          template: { name: templateName, language: { code: language }, components } }),
      });
      const result = await response.json();
      await ctx.runMutation(internal.orders.finish, {
        id, notification: response.ok && result.messages?.[0]?.id ? "accepted" : "rejected",
        ...(result.messages?.[0]?.id ? { messageId: result.messages[0].id } : {}),
      });
    } catch {
      await ctx.runMutation(internal.orders.finish, { id, notification: "needs_review" });
    }
  },
});
