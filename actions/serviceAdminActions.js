"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Fetch all services for admin management
 */
export async function getAdminServices() {
  try {
    const services = await db.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: services };
  } catch (error) {
    console.error("Error fetching admin services:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Fetch active services for public storefront
 */
export async function getPublicServices() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: services };
  } catch (error) {
    console.error("Error fetching public services:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Create a new service
 */
export async function createService(serviceData) {
  try {
    const {
      title,
      description,
      features = [],
      tag = "Most Requested",
      imageUrl,
      isActive = true,
    } = serviceData;

    if (!title || !description) {
      return { success: false, error: "Service title and description are required." };
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    const created = await db.service.create({
      data: {
        title,
        slug,
        description,
        features: Array.isArray(features) ? features : features.split("\n").filter((f) => f.trim().length > 0),
        tag,
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        isActive,
      },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing service
 */
export async function updateService(id, updateData) {
  try {
    const dataToUpdate = { ...updateData };
    if (typeof dataToUpdate.features === "string") {
      dataToUpdate.features = dataToUpdate.features.split("\n").filter((f) => f.trim().length > 0);
    }

    const updated = await db.service.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a service
 */
export async function deleteService(id) {
  try {
    await db.service.delete({
      where: { id },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle service active visibility status
 */
export async function toggleServiceStatus(id) {
  try {
    const service = await db.service.findUnique({ where: { id } });
    if (!service) return { success: false, error: "Service not found." };

    const updated = await db.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling service status:", error);
    return { success: false, error: error.message };
  }
}
