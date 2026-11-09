import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 30;
const COLOMBO_OFFSET_MS = 330 * 60 * 1000;
const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/collection": "Collection",
  "/about": "About Lustria",
};

function productCode(productNo: number): string {
  return `LUS-${String(productNo).padStart(5, "0")}`;
}

function parseProductNumber(path: string): number | null {
  const match = /^\/product\/(LUS-\d{5,})$/.exec(path);
  if (!match) return null;
  const number = Number(match[1].slice(4));
  if (!Number.isSafeInteger(number) || number < 1) return null;
  // Accept old six-digit deep links as well as the new five-digit format.
  const oldCode = `LUS-${String(number).padStart(6, "0")}`;
  return match[1] === productCode(number) || match[1] === oldCode ? number : null;
}

// Only real public pages are recorded. Admin, missing products and all 404
// routes are ignored even if a client calls this mutation directly.
export const recordPageView = mutation({
  args: { path: v.string(), sessionId: v.string() },
  handler: async (ctx, { path, sessionId }) => {
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(sessionId)) return;
    const isStatic = Object.prototype.hasOwnProperty.call(PAGE_NAMES, path);
    let canonicalPath = path;
    if (!isStatic) {
      const number = parseProductNumber(path);
      if (number === null) return;
      let product = await ctx.db.query("products")
        .withIndex("by_productNo", q => q.eq("productNo", number))
        .unique();
      if (!product && number < 50) {
        const alias = await ctx.db.query("productCodeAliases")
          .withIndex("by_oldProductNo", q => q.eq("oldProductNo", number))
          .unique();
        product = alias ? await ctx.db.get(alias.productId) : null;
      }
      if (!product?.available || product.productNo === undefined) return;
      canonicalPath = `/product/${productCode(product.productNo)}`;
    }

    const now = Date.now();
    const recent = await ctx.db.query("sitePageViews")
      .withIndex("by_session_path_time", q =>
        q.eq("sessionId", sessionId).eq("path", canonicalPath).gte("timestamp", now - 1500)
      ).first();
    if (recent) return;
    await ctx.db.insert("sitePageViews", { path: canonicalPath, sessionId, timestamp: now });
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required.");
    const admin = await ctx.db.query("admins")
      .withIndex("by_userId", q => q.eq("userId", userId)).unique();
    if (!admin) throw new Error("Admin access required.");

    const now = Date.now();
    const todayStart = Math.floor((now + COLOMBO_OFFSET_MS) / DAY_MS)
      * DAY_MS - COLOMBO_OFFSET_MS;
    const start = todayStart - (DAYS - 1) * DAY_MS;

    const products = await ctx.db.query("products").collect();
    const aliases = await ctx.db.query("productCodeAliases").collect();
    const productByNo = new Map<number, typeof products[number]>();
    const productById = new Map(products.map(product => [product._id, product]));
    for (const product of products) {
      if (product.productNo !== undefined) productByNo.set(product.productNo, product);
    }
    const aliasByNo = new Map(aliases.map(alias => [alias.oldProductNo, alias.productId]));

    // Historic old-code events are attributed to the product's CURRENT code.
    // Its analytics history is not lost when IDs below 50 are moved up.
    const canonicalize = (path: string): string | null => {
      if (Object.prototype.hasOwnProperty.call(PAGE_NAMES, path)) return path;
      const number = parseProductNumber(path);
      if (number === null) return null;
      const product = productByNo.get(number)
        ?? (aliasByNo.has(number) ? productById.get(aliasByNo.get(number)!) : undefined);
      if (!product || product.productNo === undefined) return null;
      return `/product/${productCode(product.productNo)}`;
    };

    const events = await ctx.db.query("sitePageViews")
      .withIndex("by_timestamp", q => q.gte("timestamp", start))
      .order("desc")
      .take(10001);
    const truncated = events.length > 10000;
    const days = Array.from({ length: DAYS }, (_, index) => ({
      day: start + index * DAY_MS,
      views: 0,
    }));
    type Counts = { today: number; week: number; views: number };
    const byPage: Record<string, Counts> = {};
    const sessions = new Set<string>();
    let todayViews = 0;
    let weekViews = 0;
    let totalViews = 0;

    for (const event of events.slice(0, 10000)) {
      const path = canonicalize(event.path);
      if (path === null) continue;
      totalViews++;
      sessions.add(event.sessionId);
      const index = Math.floor((event.timestamp - start) / DAY_MS);
      if (index >= 0 && index < DAYS) days[index].views++;
      const counts = byPage[path] ??= { today: 0, week: 0, views: 0 };
      counts.views++;
      if (event.timestamp >= todayStart) {
        todayViews++;
        counts.today++;
      }
      if (event.timestamp >= todayStart - 6 * DAY_MS) {
        weekViews++;
        counts.week++;
      }
    }

    for (const path of Object.keys(PAGE_NAMES)) {
      byPage[path] ??= { today: 0, week: 0, views: 0 };
    }
    const names = new Map<string, string>();
    for (const product of products) {
      if (product.productNo === undefined) continue;
      const path = `/product/${productCode(product.productNo)}`;
      names.set(path, product.name);
      byPage[path] ??= { today: 0, week: 0, views: 0 };
    }

    return {
      totalViews,
      todayViews,
      weekViews,
      uniqueSessions: sessions.size,
      truncated,
      daily: days.map(({ day, views }) => ({
        date: new Date(day + COLOMBO_OFFSET_MS).toISOString().slice(0, 10),
        views,
      })),
      pages: Object.entries(byPage).map(([path, counts]) => ({
        path,
        label: PAGE_NAMES[path] || names.get(path) || `Product ${path.slice(9)}`,
        ...counts,
        type: path.startsWith("/product/") ? "product" : "page",
      })).sort((a, b) => b.views - a.views || a.label.localeCompare(b.label)),
    };
  },
});
