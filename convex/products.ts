
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const fields = {
  name: v.string(),
  category: v.string(),
  gemstone: v.string(),
  metal: v.string(),
  description: v.string(),
  price: v.number(),
  imageId: v.optional(v.id("_storage")),
  available: v.boolean(),
  featured: v.boolean(),
};

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error("Please sign in.");
  }

  const admin = await ctx.db
    .query("admins")
    .withIndex("by_user", (q: any) =>
      q.eq("userId", userId)
    )
    .unique();

  if (!admin) {
    throw new Error("Administrator access required.");
  }

  return userId;
}

async function withImage(ctx: any, product: any) {
  return {
    ...product,
    imageUrl: product.imageId
      ? await ctx.storage.getUrl(product.imageId)
      : null,
  };
}

// Public collection
export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .collect();

    return Promise.all(
      products
        .filter((p) => p.available)
        .map((p) => withImage(ctx, p))
    );
  },
});

// Admin access check
export const adminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) =>
        q.eq("userId", userId)
      )
      .unique();

    return !!admin;
  },
});

// Admin can see unavailable products too
export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const products = await ctx.db
      .query("products")
      .collect();

    return Promise.all(
      products.map((p) => withImage(ctx, p))
    );
  },
});

// Upload permission
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Create product
export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (!args.name.trim() ||
        !Number.isFinite(args.price) ||
        args.price < 0) {
      throw new Error("Invalid product details.");
    }

    if (!args.imageId) {
      throw new Error("Please upload a product image.");
    }

    return await ctx.db.insert("products", {
      ...args,
      name: args.name.trim(),
      createdAt: Date.now(),
    });
  },
});

// Update product
export const update = mutation({
  args: {
    id: v.id("products"),
    ...fields,
  },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);

    if (!data.name.trim() ||
        !Number.isFinite(data.price) ||
        data.price < 0) {
      throw new Error("Invalid product details.");
    }

    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found.");

    await ctx.db.patch(id, {
      ...data,
      name: data.name.trim(),
    });
  },
});

// Delete product
export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(id);
    if (!product) return;

    await ctx.db.delete(id);

    // Remove the image only if no other product uses it.
    if (product.imageId) {
      const remaining = await ctx.db
        .query("products")
        .collect();

      const inUse = remaining.some(
        (p) => p.imageId === product.imageId
      );

      if (!inUse) {
        await ctx.storage.delete(product.imageId);
      }
    }
  },
});
