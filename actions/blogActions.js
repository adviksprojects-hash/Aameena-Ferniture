"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath, unstable_cache } from "next/cache";

/**
 * Fetch list of blog posts with optional filtering
 */
export async function getBlogPosts(options = {}) {
  try {
    const { category, search, onlyPublished = true, limit = 50 } = options;
    const where = {};

    if (onlyPublished) {
      where.isPublished = true;
    }

    if (category && category !== "All" && category.trim()) {
      where.category = category.trim();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
      ],
      take: limit,
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error("Error in getBlogPosts:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Fetch a single blog post by its unique slug
 */
export async function getBlogPostBySlug(slug) {
  try {
    if (!slug) return { success: false, error: "Slug is required" };

    const post = await db.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return { success: false, error: "Blog article not found" };
    }

    // Increment view count asynchronously
    try {
      await db.blogPost.update({
        where: { id: post.id },
        data: { viewsCount: { increment: 1 } },
      });
    } catch (_) {}

    return { success: true, data: post };
  } catch (error) {
    console.error("Error in getBlogPostBySlug:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new Blog Post (Admin or Manager)
 */
export async function createBlogPost(data) {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category = "Woodcraft & Design",
      tags = [],
      authorName = "Aameena Furniture Artisans",
      authorRole = "Master Craftsman",
      readTimeMinutes = 4,
      isFeatured = false,
      isPublished = true,
      seoTitle,
      seoDesc,
      seoKeywords,
      relatedProductIds = [],
    } = data;

    if (!title || !title.trim()) {
      return { success: false, error: "Blog title is required." };
    }
    if (!content || !content.trim()) {
      return { success: false, error: "Article content is required." };
    }

    // Generate or sanitize slug
    let slug = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Ensure slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const calculatedReadTime = Math.max(
      1,
      Math.ceil((content.trim().split(/\s+/).length || 200) / 180)
    );

    const created = await db.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt ? excerpt.trim() : content.slice(0, 160).trim() + "...",
        content: content.trim(),
        coverImage: coverImage ? coverImage.trim() : null,
        category: category.trim(),
        tags: Array.isArray(tags) ? tags : [],
        authorName: authorName.trim(),
        authorRole: authorRole.trim(),
        readTimeMinutes: parseInt(readTimeMinutes, 10) || calculatedReadTime,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
        seoTitle: seoTitle ? seoTitle.trim() : title.trim(),
        seoDesc: seoDesc ? seoDesc.trim() : (excerpt ? excerpt.trim() : ""),
        seoKeywords: seoKeywords ? seoKeywords.trim() : null,
        relatedProductIds: Array.isArray(relatedProductIds) ? relatedProductIds : [],
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/blogs");
    revalidatePath("/manager/blogs");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing Blog Post
 */
export async function updateBlogPost(id, data) {
  try {
    if (!id) return { success: false, error: "Blog post ID is required." };

    const cleanData = {};

    if (data.title !== undefined) cleanData.title = data.title.trim();
    if (data.slug !== undefined) {
      cleanData.slug = data.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (data.excerpt !== undefined) cleanData.excerpt = data.excerpt.trim();
    if (data.content !== undefined) cleanData.content = data.content.trim();
    if (data.coverImage !== undefined) cleanData.coverImage = data.coverImage ? data.coverImage.trim() : null;
    if (data.category !== undefined) cleanData.category = data.category.trim();
    if (Array.isArray(data.tags)) cleanData.tags = data.tags;
    if (data.authorName !== undefined) cleanData.authorName = data.authorName.trim();
    if (data.authorRole !== undefined) cleanData.authorRole = data.authorRole.trim();
    if (data.readTimeMinutes !== undefined) cleanData.readTimeMinutes = parseInt(data.readTimeMinutes, 10) || 4;
    if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
    if (data.isPublished !== undefined) cleanData.isPublished = Boolean(data.isPublished);
    if (data.seoTitle !== undefined) cleanData.seoTitle = data.seoTitle ? data.seoTitle.trim() : null;
    if (data.seoDesc !== undefined) cleanData.seoDesc = data.seoDesc ? data.seoDesc.trim() : null;
    if (data.seoKeywords !== undefined) cleanData.seoKeywords = data.seoKeywords ? data.seoKeywords.trim() : null;
    if (Array.isArray(data.relatedProductIds)) cleanData.relatedProductIds = data.relatedProductIds;

    const updated = await db.blogPost.update({
      where: { id },
      data: cleanData,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/admin/blogs");
    revalidatePath("/manager/blogs");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a Blog Post
 */
export async function deleteBlogPost(id) {
  try {
    if (!id) return { success: false, error: "Blog post ID is required." };

    const deleted = await db.blogPost.delete({
      where: { id },
    });

    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    revalidatePath("/manager/blogs");

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle published/draft status
 */
export async function togglePublishBlogPost(id) {
  try {
    const post = await db.blogPost.findUnique({ where: { id } });
    if (!post) return { success: false, error: "Blog post not found." };

    const updated = await db.blogPost.update({
      where: { id },
      data: { isPublished: !post.isPublished },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/admin/blogs");
    revalidatePath("/manager/blogs");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling blog status:", error);
    return { success: false, error: error.message };
  }
}
