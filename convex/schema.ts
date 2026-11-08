
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  admins: defineTable({
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  products: defineTable({
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
  }),
});
