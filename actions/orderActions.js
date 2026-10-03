"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";
import { checkUser } from "../lib/checkUser.js";

/**
 * Get orders belonging strictly to the currently logged-in customer
 */
export async function getMyOrders() {
  try {
    const user = await checkUser();
    if (!user) {
      return { success: true, data: [], requiresLogin: true, user: null };
    }

    const whereConditions = [
      { userId: user.id },
    ];
    if (user.email) {
      whereConditions.push({ customerEmail: { equals: user.email, mode: "insensitive" } });
    }
    if (user.phone) {
      whereConditions.push({ customerPhone: { equals: user.phone, mode: "insensitive" } });
    }

    const orders = await db.order.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders,
      requiresLogin: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get all customer orders with items and optional archive filtering
 */
export async function getOrders(filters = {}) {
  try {
    const { includeArchived = false, archivedOnly = false } = filters;
    const where = {};

    if (archivedOnly) {
      where.isArchived = true;
    } else if (!includeArchived) {
      where.isArchived = false;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
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
 * Archive an order (for DELIVERED or CANCELLED orders)
 */
export async function archiveOrder(id) {
  try {
    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.status !== "DELIVERED" && order.status !== "CANCELLED") {
      return {
        success: false,
        error: "Only orders that are DELIVERED or CANCELLED can be moved to archive.",
      };
    }

    const updated = await db.order.update({
      where: { id },
      data: { isArchived: true },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error archiving order:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore an archived order
 */
export async function restoreOrder(id) {
  try {
    const updated = await db.order.update({
      where: { id },
      data: { isArchived: false },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error restoring order:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new direct customer order (walk-in or direct client consultation at manufacturer)
 * Supports both Catalog Products and Bespoke Custom Furniture.
 */
export async function createDirectOrder(orderData) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail = "direct.customer@aameenafurniture.com",
      shippingAddress,
      city = "Mumbai",
      postalCode = "400050",
      totalAmount,
      productionStage = "TIMBER_SELECTION",
      customerNotes = "",
      isCustomFurniture = false,
      item = {},
    } = orderData;

    if (!customerName || !customerPhone || !shippingAddress || !totalAmount) {
      return { success: false, error: "Customer name, phone, address, and total amount are required." };
    }

    const orderNumber = `AF-ORD-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `AF-MFG-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdOrder = await db.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        totalAmount: parseFloat(totalAmount),
        status: "IN_PRODUCTION",
        productionStage,
        trackingNumber,
        customerNotes: customerNotes
          ? isCustomFurniture
            ? `[Bespoke Custom Furniture] ${customerNotes.trim()}`
            : customerNotes.trim()
          : isCustomFurniture
          ? "[Bespoke Custom Furniture Order]"
          : "",
        OrderItem: {
          create: [
            {
              title: item.title || (isCustomFurniture ? "Custom Bespoke Furniture Piece" : "Handcrafted Solid Teak Furniture"),
              price: parseFloat(totalAmount),
              quantity: parseInt(item.quantity || 1, 10),
              woodType: item.woodType || "Grade-A Sagwan Teak",
              finishType: item.finishType || "Natural Teak Honey Polish",
              productId: isCustomFurniture ? null : item.productId || null,
              imageUrl:
                item.imageUrl ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            },
          ],
        },
      },
      include: {
        OrderItem: true,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");

    return { success: true, data: createdOrder };
  } catch (error) {
    console.error("Error creating direct order:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update full order details (customer details, address, amount, notes, tracking, stage)
 */
export async function updateOrderDetails(orderId, updateData) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      postalCode,
      totalAmount,
      productionStage,
      status,
      customerNotes,
      trackingNumber,
    } = updateData;

    const dataToUpdate = {};
    if (customerName !== undefined) dataToUpdate.customerName = customerName;
    if (customerPhone !== undefined) dataToUpdate.customerPhone = customerPhone;
    if (customerEmail !== undefined) dataToUpdate.customerEmail = customerEmail;
    if (shippingAddress !== undefined) dataToUpdate.shippingAddress = shippingAddress;
    if (city !== undefined) dataToUpdate.city = city;
    if (postalCode !== undefined) dataToUpdate.postalCode = postalCode;
    if (totalAmount !== undefined) dataToUpdate.totalAmount = parseFloat(totalAmount);
    if (productionStage !== undefined) dataToUpdate.productionStage = productionStage;
    if (status !== undefined) dataToUpdate.status = status;
    if (customerNotes !== undefined) dataToUpdate.customerNotes = customerNotes;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;

    const updated = await db.order.update({
      where: { id: orderId },
      data: dataToUpdate,
      include: {
        OrderItem: true,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating order details:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update order production stage and status with automatic stock deduction on DELIVERY
 */
export async function updateOrderStage(orderId, { stage, status }) {
  try {
    const existing = await db.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });
    if (!existing) return { success: false, error: "Order not found" };

    const dataToUpdate = {};
    if (stage) dataToUpdate.productionStage = stage;
    if (status) dataToUpdate.status = status;

    const targetStatus = status || (stage === "DELIVERED" ? "DELIVERED" : existing.status);
    if (stage === "DELIVERED" && !status) {
      dataToUpdate.status = "DELIVERED";
    }

    // Auto-reduce stock when order is DELIVERED
    if (targetStatus === "DELIVERED" && existing.status !== "DELIVERED") {
      for (const item of existing.OrderItem) {
        if (item.productId) {
          try {
            const prod = await db.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              const newStock = Math.max(0, prod.stock - (item.quantity || 1));
              await db.product.update({
                where: { id: item.productId },
                data: { stock: newStock },
              });
            }
          } catch (stockErr) {
            console.error("Error reducing stock for product:", item.productId, stockErr);
          }
        }
      }
    }

    // Auto-restore stock if previously DELIVERED order is cancelled or reverted
    if (existing.status === "DELIVERED" && targetStatus === "CANCELLED") {
      for (const item of existing.OrderItem) {
        if (item.productId) {
          try {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity || 1 } },
            });
          } catch (stockErr) {
            console.error("Error restoring stock for product:", item.productId, stockErr);
          }
        }
      }
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/manager/products");

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

/**
 * Customer self-service order cancellation (allowed if order is pending/in production and not dispatched)
 */
export async function cancelCustomerOrder(orderId, cancelReason = "Cancelled by customer") {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.status === "DELIVERED") {
      return {
        success: false,
        error: "This order has already been delivered and cannot be cancelled directly. Please contact our support team for return assistance.",
      };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "This order is already cancelled." };
    }

    if (order.productionStage === "DISPATCHED_WHITE_GLOVE" || order.status === "SHIPPED") {
      return {
        success: false,
        error: "Order is currently out for delivery / dispatched. Please contact our showroom manager on WhatsApp for urgent assistance.",
      };
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        productionStage: "CANCELLED",
        customerNotes: order.customerNotes
          ? `${order.customerNotes} | Cancellation Reason: ${cancelReason}`
          : `Cancellation Reason: ${cancelReason}`,
      },
    });

    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get comprehensive real-time sales and business intelligence analytics
 */
export async function getSalesAnalytics() {
  try {
    const orders = await db.order.findMany({
      include: {
        OrderItem: {
          include: {
            Product: {
              include: { Category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = await db.product.findMany({
      include: { Category: true },
    });

    const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");
    const inProductionOrders = orders.filter(
      (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
    );

    const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const realizedRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pipelineRevenue = inProductionOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

    // Wood Type Analytics
    const woodCounts = {};
    // Category Analytics
    const categoryRevenue = {};

    orders.forEach((o) => {
      o.OrderItem.forEach((item) => {
        const wood = item.Product?.woodType || "Grade-A Sagwan Teak";
        woodCounts[wood] = (woodCounts[wood] || 0) + (item.price || 0);

        const catName = item.Product?.Category?.name || "Bespoke Custom Furniture";
        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + (item.price || 0);
      });
    });

    return {
      success: true,
      data: {
        totalRevenue,
        realizedRevenue,
        pipelineRevenue,
        avgOrderValue,
        totalOrdersCount: orders.length,
        deliveredCount: deliveredOrders.length,
        inProductionCount: inProductionOrders.length,
        cancelledCount: cancelledOrders.length,
        woodAnalytics: Object.entries(woodCounts).map(([wood, amount]) => ({ wood, amount })),
        categoryAnalytics: Object.entries(categoryRevenue).map(([category, amount]) => ({ category, amount })),
        recentOrders: orders.slice(0, 8),
        totalCatalogItems: products.length,
        totalCatalogStock: products.reduce((acc, p) => acc + (p.stock || 0), 0),
      },
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return { success: false, error: error.message };
  }
}

const STAGES_SEQUENCE = [
  "INQUIRY_RECEIVED",
  "TIMBER_SELECTION",
  "CARVING_JOINERY",
  "SEVEN_STEP_POLISHING",
  "QUALITY_INSPECTION",
  "DISPATCHED_WHITE_GLOVE",
  "DELIVERED",
];

/**
 * Direct 1-Click Advance Order to Next Stage
 */
export async function advanceOrderToNextStage(orderId) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });
    if (!order) return { success: false, error: "Order not found" };

    const currentStage = order.productionStage || "INQUIRY_RECEIVED";
    const currentIndex = STAGES_SEQUENCE.indexOf(currentStage);

    if (currentIndex === -1) {
      // Default to second stage if current is unknown
      var nextStage = "TIMBER_SELECTION";
    } else if (currentIndex >= STAGES_SEQUENCE.length - 1) {
      return { success: false, error: "Order has already reached the final stage (Delivered & Installed)." };
    } else {
      var nextStage = STAGES_SEQUENCE[currentIndex + 1];
    }

    const newStatus =
      nextStage === "DELIVERED"
        ? "DELIVERED"
        : nextStage === "DISPATCHED_WHITE_GLOVE"
        ? "SHIPPED"
        : "IN_PRODUCTION";

    // Auto-deduct stock if advancing to DELIVERED
    if (nextStage === "DELIVERED" && order.status !== "DELIVERED") {
      for (const item of order.OrderItem) {
        if (item.productId) {
          try {
            const prod = await db.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              await db.product.update({
                where: { id: item.productId },
                data: { stock: Math.max(0, prod.stock - (item.quantity || 1)) },
              });
            }
          } catch (e) {
            console.error("Error auto-deducting stock on advance:", e);
          }
        }
      }
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        productionStage: nextStage,
        status: newStatus,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");
    revalidatePath("/products");

    return { success: true, data: updated, nextStage, newStatus };
  } catch (error) {
    console.error("Error advancing order stage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel an order with mandatory reason (for Manager / Admin)
 */
export async function cancelOrderByManager(orderId, reason = "Cancelled by store manager") {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });
    if (!order) return { success: false, error: "Order not found" };

    if (order.status === "DELIVERED") {
      return { success: false, error: "Cannot cancel an order that has already been delivered." };
    }

    const cancellationNote = `[CANCELLED: ${reason.trim() || "No reason specified"}]`;
    const updatedNotes = order.customerNotes ? `${order.customerNotes} | ${cancellationNote}` : cancellationNote;

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        productionStage: "CANCELLED",
        customerNotes: updatedNotes,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/manager/orders");
    revalidatePath("/manager");
    revalidatePath("/orders");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message };
  }
}



