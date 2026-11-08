
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// ============================================
// LUSTRIA PRODUCT MANAGEMENT
// Convex backend
// ============================================

type DatabaseCtx = QueryCtx | MutationCtx;

// ============================================
// ADMIN AUTHORIZATION
// ============================================

async function checkAdmin(ctx: DatabaseCtx) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error("You must sign in first.");
  }

  const admin = await ctx.db
    .query("admins")
    .withIndex("by_userId", (q) =>
      q.eq("userId", userId)
    )
    .unique();

  if (!admin) {
    throw new Error(
      "Access denied. You are not an approved administrator."
    );
  }

  return userId;
}

// ============================================
// GET CURRENT USER ID
// ============================================

export const currentUserId = query({
  args: {},

  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

// ============================================
// CHECK ADMIN STATUS
// ============================================

export const adminStatus = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return false;
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) =>
        q.eq("userId", userId)
      )
      .unique();

    return admin !== null;
  },
});

// ============================================
// PUBLIC PRODUCT LIST
// ============================================

export const list = query({
  args: {},

  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .collect();

    const availableProducts = products.filter(
      (product) => product.available
    ).sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      availableProducts.map(async (product) => ({
        ...product,

        imageUrl: product.imageId
          ? await ctx.storage.getUrl(product.imageId)
          : null,
      }))
    );
  },
});

// ============================================
// ADMIN PRODUCT LIST
// ============================================

export const listAdmin = query({
  args: {},

  handler: async (ctx) => {
    await checkAdmin(ctx);

    const products = await ctx.db
      .query("products")
      .collect();

    return await Promise.all(
      products.map(async (product) => ({
        ...product,

        imageUrl: product.imageId
          ? await ctx.storage.getUrl(product.imageId)
          : null,
      }))
    );
  },
});

// ============================================
// GENERATE IMAGE UPLOAD URL
// ============================================

export const generateUploadUrl = mutation({
  args: {},

  handler: async (ctx) => {
    await checkAdmin(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});

// ============================================
// SHARED PRODUCT VALIDATION
// ============================================

const productFields = {
  name: v.string(),
  category: v.string(),
  gemstone: v.string(),
  metal: v.string(),
  description: v.string(),
  price: v.number(),
  imageId: v.id("_storage"),
  available: v.boolean(),
  featured: v.boolean(),
};

function validateProduct(
  product: {
    name: string;
    price: number;
    category: string;
    gemstone: string;
    metal: string;
  }
) {
  if (!product.name.trim()) {
    throw new Error("Product name is required.");
  }

  if (
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    throw new Error("Enter a valid product price.");
  }

  if (!product.category.trim()) {
    throw new Error("Product category is required.");
  }

  if (!product.gemstone.trim()) {
    throw new Error("Gemstone is required.");
  }

  if (!product.metal.trim()) {
    throw new Error("Metal is required.");
  }
}

// ============================================
// CREATE PRODUCT
// ============================================

export const create = mutation({
  args: productFields,

  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    validateProduct(args);

    const imageUrl = await ctx.storage.getUrl(
      args.imageId
    );

    if (!imageUrl) {
      throw new Error("Uploaded image was not found.");
    }

    const productId = await ctx.db.insert(
      "products",
      {
        name: args.name.trim(),
        category: args.category,
        gemstone: args.gemstone,
        metal: args.metal,
        description: args.description,
        price: args.price,
        imageId: args.imageId,
        available: args.available,
        featured: args.featured,
        createdAt: Date.now(),
      }
    );

    return productId;
  },
});

// ============================================
// UPDATE PRODUCT
// ============================================

export const update = mutation({
  args: {
    id: v.id("products"),
    ...productFields,
  },

  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const existingProduct = await ctx.db.get(args.id);

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    validateProduct(args);

    const imageUrl = await ctx.storage.getUrl(
      args.imageId
    );

    if (!imageUrl) {
      throw new Error("Uploaded image was not found.");
    }

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      category: args.category,
      gemstone: args.gemstone,
      metal: args.metal,
      description: args.description,
      price: args.price,
      imageId: args.imageId,
      available: args.available,
      featured: args.featured,
    });

    return args.id;
  },
});

// ============================================
// DELETE PRODUCT
// ============================================

export const remove = mutation({
  args: {
    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found.");
    }

    await ctx.db.delete(args.id);

    // Remove image if no other product uses it.
    const otherProducts = await ctx.db
      .query("products")
      .collect();

    const imageInUse = otherProducts.some(
      (item) => item.imageId === product.imageId
    );

    if (!imageInUse) {
      await ctx.storage.delete(product.imageId);
    }

    return {
      success: true,
    };
  },
});
