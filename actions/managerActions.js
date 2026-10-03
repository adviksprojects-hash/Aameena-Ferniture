"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Get all managers and available showroom branches
 */
export async function getManagers() {
  try {
    const managers = await db.manager.findMany({
      include: {
        user: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const branches = await db.branch.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, managers, branches };
  } catch (error) {
    console.error("Error fetching managers:", error);
    return { success: false, error: error.message, managers: [], branches: [] };
  }
}

/**
 * Add a new manager and assign to a branch
 */
export async function createManager(data) {
  try {
    const { name, email, phone, branchId } = data;

    if (!name || !email || !branchId) {
      return { success: false, error: "Name, email, and showroom branch are required." };
    }

    // Find or create User with MANAGER role
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkUserId: "manual_mgr_" + Date.now(),
          email,
          name,
          phone,
          role: "MANAGER",
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { role: "MANAGER", name, phone },
      });
    }

    // Create or update Manager record
    const manager = await db.manager.upsert({
      where: { userId: user.id },
      update: { branchId, phone, status: "ACTIVE" },
      create: {
        userId: user.id,
        branchId,
        phone,
        status: "ACTIVE",
      },
      include: {
        user: true,
        branch: true,
      },
    });

    revalidatePath("/admin/managers");
    return { success: true, data: manager };
  } catch (error) {
    console.error("Error creating manager:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Reassign manager to a different branch
 */
export async function updateManagerBranch(managerId, branchId) {
  try {
    const updated = await db.manager.update({
      where: { id: managerId },
      data: { branchId },
      include: { branch: true },
    });

    revalidatePath("/admin/managers");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating manager branch:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle manager status (ACTIVE / INACTIVE)
 */
export async function toggleManagerStatus(managerId, currentStatus) {
  try {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = await db.manager.update({
      where: { id: managerId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/managers");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling manager status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a manager account (Admin)
 */
export async function deleteManager(managerId) {
  try {
    const manager = await db.manager.findUnique({
      where: { id: managerId },
      include: { user: true },
    });

    if (!manager) {
      return { success: false, error: "Manager not found" };
    }

    // Delete manager record
    await db.manager.delete({
      where: { id: managerId },
    });

    // Reset user role to USER if user exists
    if (manager.userId) {
      await db.user.update({
        where: { id: manager.userId },
        data: { role: "USER" },
      });
    }

    revalidatePath("/admin/managers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting manager:", error);
    return { success: false, error: error.message };
  }
}

