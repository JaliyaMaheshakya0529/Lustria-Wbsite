
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// ============================================
// LUSTRIA PRODUCT MANAGEMENT
// Convex backend
// ============================================

type DatabaseCtx = QueryCtx | MutationCtx;

// Public product numbering begins at LUS-00050. Existing numbers below 50
// are moved once during the authorized admin migration, with legacy aliases.
const FIRST_PRODUCT_NO = 50;

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

// Permanent product numbers must only be allocated on the server.
// Convex mutations are atomic/serializable: concurrent batch creates cannot
// commit the same counter value. Deleted product numbers are never recycled.
async function allocateProductNo(ctx: MutationCtx): Promise<number> {
  // The counter is a single Convex document. Reading and incrementing it in
  // a mutation is transactional, including concurrent batch uploads.
  const counter = await ctx.db.query("productCounters")
    .withIndex("by_key", (q) => q.eq("key", "products"))
    .unique();

  // Self-heal if a counter was created before legacy numbers were migrated,
  // or a previous deployment advanced productNo ahead of the counter.
  // The indexed descending query is efficient; no full table scan is needed.
  const highestNumbered = await ctx.db.query("products")
    .withIndex("by_productNo")
    .order("desc")
    .first();
  const highest = highestNumbered?.productNo ?? 0;
  const next = Math.max(FIRST_PRODUCT_NO, counter?.nextNumber ?? FIRST_PRODUCT_NO, highest + 1);
  if (!Number.isSafeInteger(next) || next >= Number.MAX_SAFE_INTEGER) {
    throw new Error("Product number range exhausted. Contact the administrator.");
  }

  if (counter) {
    await ctx.db.patch(counter._id, { nextNumber: next + 1 });
  } else {
    await ctx.db.insert("productCounters", {
      key: "products",
      nextNumber: next + 1,
    });
  }
  return next;
}

// Reuses the existing products table and image URL behavior.
export const getByNumber = query({
  args: { productNo: v.number() },
  handler: async (ctx, { productNo }) => {
    if (!Number.isSafeInteger(productNo) || productNo < 1) return null;
    let item = await ctx.db.query("products")
      .withIndex("by_productNo", q => q.eq("productNo", productNo)).unique();
    // Old LUS-000001 etc. links remain valid after the one-time migration.
    if (!item && productNo < FIRST_PRODUCT_NO) {
      const alias = await ctx.db.query("productCodeAliases")
        .withIndex("by_oldProductNo", q => q.eq("oldProductNo", productNo))
        .unique();
      item = alias ? await ctx.db.get(alias.productId) : null;
    }
    if (!item || !item.available) return null;
    return { ...item, imageUrl: await ctx.storage.getUrl(item.imageId) };
  },
});

// Direct lookup for previously shared URLs containing the internal Convex ID.
// Once the item has a number, ProductDetails replaces that old URL with the
// permanent human-readable URL, without creating a second product.
export const getByLegacyId = query({
  args: { legacyId: v.string() },
  handler: async (ctx, { legacyId }) => {
    const id = ctx.db.normalizeId("products", legacyId);
    if (!id) return null;
    const item = await ctx.db.get(id);
    if (!item || !item.available) return null;
    return {
      ...item,
      imageUrl: await ctx.storage.getUrl(item.imageId),
    };
  },
});

// Backfill older products and, ONCE, move legacy numbers below 50 into the
// new sequence. Preserve aliases for old URLs and previously logged visits.
// It never changes an already assigned number >= 50.
export const assignLegacyNumbers = mutation({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    const items = await ctx.db.query("products").collect();
    const seenNumbers = new Set<number>();
    for (const item of items) {
      if (item.productNo === undefined) continue;
      if (!Number.isSafeInteger(item.productNo) || item.productNo < 1 || seenNumbers.has(item.productNo)) {
        throw new Error("Invalid or duplicate existing product number. Resolve this before migration.");
      }
      seenNumbers.add(item.productNo);
    }
    const needsMigration = items.filter(p => p.productNo === undefined || p.productNo < FIRST_PRODUCT_NO)
      .sort((a, b) => {
        // Migrate already-numbered items before assigning brand-new numbers.
        const aPriority = a.productNo === undefined ? 1 : 0;
        const bPriority = b.productNo === undefined ? 1 : 0;
        return aPriority - bPriority || a.createdAt - b.createdAt || a._id.localeCompare(b._id);
      });
    const batch = needsMigration.slice(0, 50);
    for (const item of batch) {
      const newNo = await allocateProductNo(ctx);
      if (item.productNo !== undefined && item.productNo < FIRST_PRODUCT_NO) {
        const existingAlias = await ctx.db.query("productCodeAliases")
          .withIndex("by_oldProductNo", q => q.eq("oldProductNo", item.productNo!)).unique();
        if (existingAlias && existingAlias.productId !== item._id) {
          throw new Error("A legacy code alias is already assigned to another product.");
        }
        if (!existingAlias) await ctx.db.insert("productCodeAliases", {
          oldProductNo: item.productNo,
          productId: item._id,
        });
      }
      await ctx.db.patch(item._id, { productNo: newNo });
    }
    return { assigned: batch.length, remaining: needsMigration.length - batch.length };
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

    const productNo = await allocateProductNo(ctx);
    const productId = await ctx.db.insert(
      "products",
      {
        productNo,
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
