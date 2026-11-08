
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  admins: defineTable({
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  products: defineTable({
    name: v.string(),
    category: v.string(),
    gemstone: v.string(),
    metal: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    available: v.boolean(),
    featured: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),
});
