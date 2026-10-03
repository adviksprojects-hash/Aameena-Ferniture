"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Fetch products from database with optional filters
 */
export async function getProducts(filters = {}) {
  try {
    const { category, woodType, searchQuery } = filters;

    const where = {};

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
 * Create a new product in the catalog
 */
export async function createProduct(productData) {
  try {
    const {
      title,
      categorySlug = "living",
      woodType = "Grade-A Sagwan Teak",
      price,
      compareAtPrice,
      stock = 5,
      dimensions,
      description = "",
      images = [],
      finishType = "Natural Teak Honey Polish",
    } = productData;

    if (!title || !price) {
      return { success: false, error: "Title and price are required." };
    }

    // Ensure category exists
    let category = await db.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) + " Room",
          slug: categorySlug,
        },
      });
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    const created = await db.product.create({
      data: {
        title,
        slug,
        categoryId: category.id,
        woodType,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : parseFloat(price) * 1.25,
        stock: parseInt(stock, 10),
        dimensions: dimensions || "Standard Dimensions",
        description,
        finishType,
        images:
          images.length > 0
            ? images
            : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update product fields
 */
export async function updateProduct(id, updateData) {
  try {
    const updated = await db.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id) {
  try {
    await db.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
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

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling stock:", error);
    return { success: false, error: error.message };
  }
}
