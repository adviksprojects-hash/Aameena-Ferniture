"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath, revalidateTag } from "next/cache";
import { seedTailoredProductReviews } from "@/lib/reviews/productReviewGenerator";

function purgeProductCache(productId = null, slug = null) {
  try {
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");
    revalidatePath("/manager");
    revalidatePath("/");
    if (productId) revalidatePath(`/products/${productId}`);
    if (slug) revalidatePath(`/products/${slug}`);
    revalidateTag("products");
  } catch (e) {}
}

/**
 * Fetch products from database with optional filters
 */
export async function getProducts(filters = {}) {
  try {
    const { category, woodType, searchQuery, includeArchived = false, archivedOnly = false } = filters;

    const where = {};

    if (archivedOnly) {
      where.isArchived = true;
    } else if (!includeArchived) {
      where.isArchived = false;
    }

    if (category && category !== "all") {
      where.Category = { slug: category };
    }

    if (woodType && woodType !== "all") {
      where.woodType = { contains: woodType, mode: "insensitive" };
    }

    if (searchQuery && searchQuery.trim() !== "") {
      where.OR = [
        { title: { contains: searchQuery.trim(), mode: "insensitive" } },
        { description: { contains: searchQuery.trim(), mode: "insensitive" } },
        { woodType: { contains: searchQuery.trim(), mode: "insensitive" } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: {
        Category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Error in getProducts:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Create a new product in the catalog with 1-3 images
 */
export async function createProduct(productData) {
  try {
    const {
      title,
      categorySlug,
      woodType,
      price,
      compareAtPrice,
      stock = 5,
      dimensions,
      description = "",
      images = [],
      finishType,
      materialPurity,
      model3dUrl,
      showInquiryBtn = true,
      showDetailsBtn = true,
    } = productData;

    if (!title || !price) {
      return { success: false, error: "Title and price are required." };
    }

    if (!categorySlug || !categorySlug.trim()) {
      return { success: false, error: "Please select a product category." };
    }

    if (!woodType || !woodType.trim()) {
      return { success: false, error: "Please select a wood or material type." };
    }

    // Ensure category exists
    let category = await db.category.findUnique({
      where: { slug: categorySlug.trim() },
    });

    if (!category) {
      const cleanSlug = categorySlug.trim();
      category = await db.category.create({
        data: {
          name: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1) + " Room",
          slug: cleanSlug,
        },
      });
    }

    // Generate randomized 16-digit unique product ID
    let random16Digits = Math.floor(1 + Math.random() * 9).toString();
    for (let i = 0; i < 15; i++) {
      random16Digits += Math.floor(Math.random() * 10).toString();
    }
    const slug = random16Digits;

    const safeImages = Array.isArray(images) && images.length > 0
      ? images.slice(0, 3)
      : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"];

    const cleanPurity = materialPurity && typeof materialPurity === "string" && materialPurity.trim()
      ? materialPurity.trim()
      : null;

    const cleanFinish = finishType && typeof finishType === "string" && finishType.trim()
      ? finishType.trim()
      : null;

    const cleanDimensions = dimensions && typeof dimensions === "string" && dimensions.trim()
      ? dimensions.trim()
      : null;

    const cleanDesc = description && typeof description === "string"
      ? description.trim()
      : "";

    const cleanModel3d = model3dUrl && typeof model3dUrl === "string" && model3dUrl.trim()
      ? model3dUrl.trim()
      : null;

    const cleanCompareAt = compareAtPrice !== undefined && compareAtPrice !== null && String(compareAtPrice).trim() !== ""
      ? parseFloat(compareAtPrice)
      : null;

    const created = await db.product.create({
      data: {
        title: title.trim(),
        slug,
        categoryId: category.id,
        woodType: woodType.trim(),
        materialPurity: cleanPurity,
        price: parseFloat(price),
        compareAtPrice: cleanCompareAt,
        stock: parseInt(stock, 10) || 0,
        dimensions: cleanDimensions,
        description: cleanDesc,
        finishType: cleanFinish,
        model3dUrl: cleanModel3d,
        images: safeImages,
        showInquiryBtn: Boolean(showInquiryBtn),
        showDetailsBtn: Boolean(showDetailsBtn),
        isArchived: false,
      },
    });

    purgeProductCache();

    // Auto-seed tailored customer reviews aligned with this product's timber and specs
    try {
      await seedTailoredProductReviews(created);
    } catch (err) {
      console.warn("Could not auto-seed reviews for newly created product:", err.message);
    }

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update product fields (including 1-3 images & display toggles)
 */
export async function updateProduct(id, updateData) {
  try {
    if (!id) {
      return { success: false, error: "Product ID is required for update." };
    }

    const cleanData = {};

    if (updateData.title !== undefined) cleanData.title = String(updateData.title).trim();
    if (updateData.description !== undefined) cleanData.description = String(updateData.description || "").trim();
    if (updateData.woodType !== undefined) cleanData.woodType = String(updateData.woodType).trim();
    
    if (updateData.materialPurity !== undefined) {
      cleanData.materialPurity = updateData.materialPurity && String(updateData.materialPurity).trim()
        ? String(updateData.materialPurity).trim()
        : null;
    }
    if (updateData.finishType !== undefined) {
      cleanData.finishType = updateData.finishType && String(updateData.finishType).trim()
        ? String(updateData.finishType).trim()
        : null;
    }
    if (updateData.dimensions !== undefined) {
      cleanData.dimensions = updateData.dimensions && String(updateData.dimensions).trim()
        ? String(updateData.dimensions).trim()
        : null;
    }
    if (updateData.price !== undefined && updateData.price !== null && String(updateData.price).trim() !== "") {
      cleanData.price = parseFloat(updateData.price);
    }
    if (updateData.compareAtPrice !== undefined) {
      cleanData.compareAtPrice = updateData.compareAtPrice !== null && String(updateData.compareAtPrice).trim() !== ""
        ? parseFloat(updateData.compareAtPrice)
        : null;
    }
    if (updateData.costPrice !== undefined) {
      cleanData.costPrice = updateData.costPrice !== null && String(updateData.costPrice).trim() !== ""
        ? parseFloat(updateData.costPrice)
        : null;
    }
    if (updateData.stock !== undefined) {
      cleanData.stock = parseInt(updateData.stock, 10) || 0;
    }
    if (updateData.warehouseLocation !== undefined) {
      cleanData.warehouseLocation = String(updateData.warehouseLocation || "").trim() || "Solapur Central Facility";
    }
    if (updateData.showInquiryBtn !== undefined) {
      cleanData.showInquiryBtn = Boolean(updateData.showInquiryBtn);
    }
    if (updateData.showDetailsBtn !== undefined) {
      cleanData.showDetailsBtn = Boolean(updateData.showDetailsBtn);
    }
    if (updateData.isFeatured !== undefined) {
      cleanData.isFeatured = Boolean(updateData.isFeatured);
    }
    if (updateData.isArchived !== undefined) {
      cleanData.isArchived = Boolean(updateData.isArchived);
    }
    if (updateData.model3dUrl !== undefined) {
      cleanData.model3dUrl = updateData.model3dUrl && String(updateData.model3dUrl).trim()
        ? String(updateData.model3dUrl).trim()
        : null;
    }
    if (Array.isArray(updateData.images)) {
      cleanData.images = updateData.images.slice(0, 3);
    }

    // Resolve category if categorySlug is provided
    if (updateData.categorySlug && typeof updateData.categorySlug === "string" && updateData.categorySlug.trim()) {
      const cleanSlug = updateData.categorySlug.trim();
      let category = await db.category.findUnique({
        where: { slug: cleanSlug },
      });
      if (!category) {
        category = await db.category.create({
          data: {
            name: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1) + " Room",
            slug: cleanSlug,
          },
        });
      }
      cleanData.categoryId = category.id;
    } else if (updateData.categoryId) {
      cleanData.categoryId = updateData.categoryId;
    }

    const updated = await db.product.update({
      where: { id },
      data: cleanData,
    });

    purgeProductCache(id, updated.slug);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Archive a product (hides from customer storefront)
 */
export async function archiveProduct(id) {
  try {
    const updated = await db.product.update({
      where: { id },
      data: { isArchived: true },
    });

    purgeProductCache();

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error archiving product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore an archived product
 */
export async function restoreProduct(id) {
  try {
    const updated = await db.product.update({
      where: { id },
      data: { isArchived: false },
    });

    purgeProductCache();

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error restoring product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle stock status (used by Managers and Admins)
 */
export async function toggleStockStatus(id, forceStock = null) {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Product not found" };

    const newStock = forceStock !== null ? forceStock : product.stock > 0 ? 0 : 5;

    const updated = await db.product.update({
      where: { id },
      data: { stock: newStock },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");
    revalidatePath("/manager");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling stock:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a product permanently
 */
export async function deleteProduct(id) {
  try {
    await db.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");
    revalidatePath("/manager");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update storefront button display options for a product
 */
export async function updateProductDisplayOptions(id, { showInquiryBtn, showDetailsBtn }) {
  try {
    const dataToUpdate = {};
    if (showInquiryBtn !== undefined) dataToUpdate.showInquiryBtn = showInquiryBtn;
    if (showDetailsBtn !== undefined) dataToUpdate.showDetailsBtn = showDetailsBtn;

    const updated = await db.product.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");
    revalidatePath("/manager");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating product display options:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single product by ID or slug with Category and related products
 */
export async function getProductById(idOrSlug) {
  try {
    if (!idOrSlug) return { success: false, error: "Product identifier is required." };

    const product = await db.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        Category: true,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isArchived: false,
      },
      take: 4,
      include: {
        Category: true,
      },
    });

    return { success: true, data: product, relatedProducts };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Increment or decrement product stock count directly (+1 / -1)
 */
export async function adjustProductStock(id, delta) {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Product not found" };

    const newStock = Math.max(0, (product.stock || 0) + Number(delta));

    const updated = await db.product.update({
      where: { id },
      data: { stock: newStock },
    });

    purgeProductCache();

    return { success: true, data: updated, newStock };
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle product storefront visibility (show on product page or hide)
 */
export async function toggleProductVisibility(id) {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Product not found" };

    const updated = await db.product.update({
      where: { id },
      data: { isArchived: !product.isArchived },
    });

    purgeProductCache();

    return { success: true, data: updated, isArchived: updated.isArchived };
  } catch (error) {
    console.error("Error toggling product visibility:", error);
    return { success: false, error: error.message };
  }
}
