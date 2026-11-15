
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Archived imports; homepage reviews are now static.
  reviews: defineTable({
    author: v.string(), quote: v.string(), rating: v.optional(v.number()),
    source: v.string(), featured: v.boolean(), createdAt: v.number(),
  }).index("by_featured", ["featured"]),
  customOrders: defineTable({
    requestId: v.optional(v.string()), name: v.string(), phone: v.string(), address: v.string(),
    ringSize: v.string(), description: v.string(), budget: v.string(),
    image: v.optional(v.string()), createdAt: v.number(),
    notification: v.optional(v.string()), messageId: v.optional(v.string()),
    // Orders from the previous form retain their original details and attachment.
    orderCode: v.optional(v.string()),
    jewelryType: v.optional(v.string()),
    gemstone: v.optional(v.string()),
    metal: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
    whatsappStatus: v.optional(v.string()),
    whatsappError: v.optional(v.string()),
  }).index("by_request", ["requestId"]).index("by_created", ["createdAt"]),

  admins: defineTable({
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  sitePageViews: defineTable({
    path: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
    productLabel: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"])
    .index("by_session_time", ["sessionId", "timestamp"])
    .index("by_session_path_time", ["sessionId", "path", "timestamp"]),

  // Old codes (LUS-000001 etc.) remain resolvable after the one-time move
  // to codes beginning at 50. Aliases are never reused or reallocated.
  productCodeAliases: defineTable({
    oldProductNo: v.number(),
    productId: v.id("products"),
    currentProductNo: v.optional(v.number()),
  }).index("by_oldProductNo", ["oldProductNo"])
    .index("by_productId", ["productId"]),

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
    revision: v.optional(v.number()),
    creationRequestId: v.optional(v.string()),
  }).index("by_productNo", ["productNo"])
    .index("by_available_created", ["available", "createdAt"])
    .index("by_available_price", ["available", "price"])
    .index("by_available_featured_created", ["available", "featured", "createdAt"])
    .index("by_featured_available_created", ["featured", "available", "createdAt"])
    .index("by_image", ["imageId"])
    .index("by_creationRequestId", ["creationRequestId"]),

  stagedProductImages: defineTable({
    imageId: v.id("_storage"),
    cleanupId: v.id("_scheduled_functions"),
  }).index("by_image", ["imageId"]),
});
