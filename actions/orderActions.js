"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Get all customer orders with items
 */
export async function getOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        OrderItem: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update order production stage and status
 */
export async function updateOrderStage(orderId, { stage, status }) {
  try {
    const dataToUpdate = {};
    if (stage) dataToUpdate.productionStage = stage;
    if (status) dataToUpdate.status = status;

    const updated = await db.order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/orders");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating order stage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Track an order by orderNumber or trackingNumber
 */
export async function trackOrderByToken(query) {
  try {
    if (!query || query.trim() === "") {
      return { success: false, error: "Please enter an Order ID or Tracking Number." };
    }

    const trimmed = query.trim();

    const order = await db.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: trimmed, mode: "insensitive" } },
          { trackingNumber: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      include: {
        OrderItem: true,
      },
    });

    if (!order) {
      return { success: false, error: `No active order found with identifier "${trimmed}".` };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error tracking order:", error);
    return { success: false, error: error.message };
  }
}
