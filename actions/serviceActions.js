"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Generate a prefilled WhatsApp inquiry link
 */
export async function generateWhatsAppLink({
  clientName = "Client",
  serviceType = "Bespoke Custom Furniture",
  woodChoice = "Grade-A Sagwan Teak",
  dimensions = "Standard",
}) {
  const phone = "919730392917"; // Official showroom WhatsApp business number
  const message = `Hello Aameena Furniture, my name is ${clientName}. I would like to book a consultation for "${serviceType}". 
Preferred Wood: ${woodChoice}
Dimensions / Scope: ${dimensions}. 
Please connect me with a master craftsman.`;

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

/**
 * Submit a bespoke service consultation inquiry
 */
export async function createServiceInquiry(data) {
  try {
    const {
      clientName,
      clientPhone,
      clientEmail,
      serviceType = "Bespoke Custom Furniture Crafting",
      woodChoice = "Grade-A Sagwan Teak",
      dimensions = "Standard Living Room",
      roomType = "Living Room",
      estimatedCost = 0,
      notes = "",
    } = data;

    if (!clientName || !clientPhone) {
      return { success: false, error: "Name and phone number are required." };
    }

    const inquiry = await db.serviceInquiry.create({
      data: {
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        serviceType,
        woodChoice,
        dimensions,
        roomType,
        estimatedCost: parseFloat(estimatedCost) || null,
        notes,
        status: "PENDING",
      },
    });

    const whatsappUrl = await generateWhatsAppLink({
      clientName,
      serviceType,
      woodChoice,
      dimensions,
    });

    revalidatePath("/admin");
    revalidatePath("/services");

    return {
      success: true,
      data: inquiry,
      whatsappUrl,
    };
  } catch (error) {
    console.error("Error creating service inquiry:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all service inquiries
 */
export async function getInquiries(status = null) {
  try {
    const where = status && status !== "ALL" ? { status } : {};
    const inquiries = await db.serviceInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: inquiries };
  } catch (error) {
    console.error("Error getting inquiries:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update inquiry status
 */
export async function updateInquiryStatus(id, status) {
  try {
    const updated = await db.serviceInquiry.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/services");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit a customer inquiry from Contact Page
 */
export async function createContactInquiry(data) {
  try {
    const { name, phone, email, interest = "General Consultation", message = "" } = data;

    if (!name || !phone) {
      return { success: false, error: "Name and phone number are required." };
    }

    const inquiry = await db.serviceInquiry.create({
      data: {
        clientName: name,
        clientPhone: phone,
        clientEmail: email || null,
        serviceType: `Contact: ${interest}`,
        woodChoice: "General Contact Inquiry",
        dimensions: "N/A",
        roomType: "Contact Page",
        notes: message,
        status: "PENDING",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/services");
    revalidatePath("/contact");

    return {
      success: true,
      data: inquiry,
    };
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete inquiry
 */
export async function deleteServiceInquiry(id) {
  try {
    await db.serviceInquiry.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return { success: false, error: error.message };
  }
}

