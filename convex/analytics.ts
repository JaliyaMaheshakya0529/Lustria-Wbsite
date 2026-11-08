import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const DAYS = 30;
const DAY_MS = 86400000;
const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/collection": "Collection",
};

// Anonymous first-party page-view tracking. Never store email, IP or user agent.
export const recordPageView = mutation({
  args: { path: v.string(), sessionId: v.string() },
  handler: async (ctx, { path, sessionId }) => {
    if (!(path in PAGE_NAMES) || !/^[a-zA-Z0-9_-]{12,80}$/.test(sessionId)) return;
    const now = Date.now();
    // Prevent repeat counts caused by strict-mode remounts or quick navigation.
    const recent = await ctx.db.query("sitePageViews")
      .withIndex("by_session_path_time", q => q.eq("sessionId", sessionId).eq("path", path).gte("timestamp", now - 30000))
      .first();
    if (recent) return;
    await ctx.db.insert("sitePageViews", { path, sessionId, timestamp: now });
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
    const todayStart = Math.floor(now / DAY_MS) * DAY_MS;
    const start = todayStart - (DAYS - 1) * DAY_MS;
    // Read newest first so traffic from today remains represented even
    // after the 10,000-event reporting cap is reached.
    const events = await ctx.db.query("sitePageViews")
      .withIndex("by_timestamp", q => q.gte("timestamp", start))
      .order("desc")
      .take(10001);
    const truncated = events.length > 10000;
    const views = events.slice(0, 10000);
    const days = Array.from({ length: DAYS }, (_, i) => {
      const day = start + i * DAY_MS;
      return { date: new Date(day).toISOString().slice(0, 10), day, views: 0, sessions: new Set<string>() };
    });
    const byPage: Record<string, number> = {};
    const sessions = new Set<string>();
    let today = 0;
    let last7 = 0;
    for (const event of views) {
      const idx = Math.floor((event.timestamp - start) / DAY_MS);
      if (idx >= 0 && idx < DAYS) {
        days[idx].views++;
        days[idx].sessions.add(event.sessionId);
      }
      sessions.add(event.sessionId);
      byPage[event.path] = (byPage[event.path] || 0) + 1;
      if (event.timestamp >= todayStart) today++;
      if (event.timestamp >= todayStart - 6 * DAY_MS) last7++;
    }
    return {
      totalViews: views.length,
      todayViews: today,
      weekViews: last7,
      uniqueSessions: sessions.size,
      truncated,
      daily: days.map(({ date, views, sessions }) => ({ date, views, sessions: sessions.size })),
      pages: Object.entries(byPage).map(([path, views]) => ({
        path, label: PAGE_NAMES[path] || path, views,
      })).sort((a, b) => b.views - a.views),
    };
  },
});
