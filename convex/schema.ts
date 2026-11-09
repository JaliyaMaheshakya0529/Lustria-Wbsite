
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  admins: defineTable({
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  sitePageViews: defineTable({
    path: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_session_path_time", ["sessionId", "path", "timestamp"]),

  // Old codes (LUS-000001 etc.) remain resolvable after the one-time move
  // to codes beginning at 50. Aliases are never reused or reallocated.
  productCodeAliases: defineTable({
    oldProductNo: v.number(),
    productId: v.id("products"),
  }).index("by_oldProductNo", ["oldProductNo"]),

  // A single counter document; updated atomically with product creation.
  productCounters: defineTable({
    key: v.string(),
    nextNumber: v.number(),
  }).index("by_key", ["key"]),

  products: defineTable({
    // Optional only to support existing products while they are migrated.
    productNo: v.optional(v.number()),
    name: v.string(),
    category: v.string(),
    gemstone: v.string(),
    metal: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.id("_storage"),
    available: v.boolean(),
    featured: v.boolean(),
    createdAt: v.number(),
  }).index("by_productNo", ["productNo"]),
});
