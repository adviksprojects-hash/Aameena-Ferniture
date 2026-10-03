"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

const DEFAULT_PACKAGES = [
  {
    name: "Standard Home Furnishing",
    subtitle: "Essential Solid Wood Essentials",
    price: "₹1,45,000",
    description: "Includes Queen Bed + Storage, 5-Seater Sofa Set, 4-Seater Dining Table, and Center Table.",
    features: [
      "100% Solid Wood Structure",
      "5-Year Structural Warranty",
      "Free Doorstep Delivery",
      "Standard Teak Polish",
    ],
    popular: false,
    order: 1,
  },
  {
    name: "Royal Premium Package",
    subtitle: "Complete Luxury Living & Bedroom Suite",
    price: "₹2,35,000",
    description: "Includes King Bed + Hydraulic Storage, 7-Seater Royal Sofa Set, 6-Seater Dining Suite, Wardrobe & Console.",
    features: [
      "100% Grade-A Sagwan Teak Wood",
      "Lifetime Wood Guarantee",
      "Custom Velvet Upholstery",
      "3D Design & Space Consultation",
      "Free Assembly & Installation",
    ],
    popular: true,
    order: 2,
  },
  {
    name: "Bespoke Villa / Interior Project",
    subtitle: "End-to-End Customized Home Furnishing",
    price: "Custom Quote",
    description: "Tailor-made for luxury villas, penthouses, and large bungalows with dedicated interior designer oversight.",
    features: [
      "Custom Carved Hardwood Masterpieces",
      "Dedicated Project Manager",
      "Unlimited Customization & Fabric Choices",
      "Priority Workshop Production",
    ],
    popular: false,
    order: 3,
  },
];

const DEFAULT_CALCULATOR = {
  "1bhk": { teak: 145000, sheesham: 115000 },
  "2bhk": { teak: 235000, sheesham: 185000 },
  "3bhk": { teak: 360000, sheesham: 285000 },
  "villa": { teak: 580000, sheesham: 460000 },
};

/**
 * Fetch all pricing packages and settings (seeded if empty)
 */
export async function getPricingData() {
  try {
    let packages = await db.pricingPackage.findMany({
      orderBy: { order: "asc" },
    });

    if (packages.length === 0) {
      for (const pkg of DEFAULT_PACKAGES) {
        await db.pricingPackage.create({ data: pkg });
      }
      packages = await db.pricingPackage.findMany({ orderBy: { order: "asc" } });
    }

    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    if (!settings) {
      settings = await db.pricingSettings.create({
        data: {
          id: "default-pricing-settings",
          catalogPdfName: "Aameena_Furniture_Rate_Card.pdf",
          catalogPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          calculatorData: DEFAULT_CALCULATOR,
        },
      });
    }

    return {
      success: true,
      data: {
        packages,
        settings,
      },
    };
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    return {
      success: false,
      error: error.message,
      data: {
        packages: DEFAULT_PACKAGES,
        settings: {
          catalogPdfName: "Aameena_Furniture_Rate_Card.pdf",
          catalogPdfUrl: null,
          calculatorData: DEFAULT_CALCULATOR,
        },
      },
    };
  }
}

/**
 * Create a new pricing tier package
 */
export async function createPricingPackage(packageData) {
  try {
    const { name, subtitle = "", price, description = "", features = [], popular = false } = packageData;
    if (!name || !price) {
      return { success: false, error: "Package name and price are required." };
    }

    const count = await db.pricingPackage.count();
    const created = await db.pricingPackage.create({
      data: {
        name: name.trim(),
        subtitle: subtitle.trim(),
        price: price.trim(),
        description: description.trim(),
        features: Array.isArray(features) ? features : features.split(",").map((f) => f.trim()),
        popular: Boolean(popular),
        order: count + 1,
      },
    });

    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating pricing package:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing pricing tier package
 */
export async function updatePricingPackage(id, packageData) {
  try {
    const { name, subtitle, price, description, features, popular } = packageData;
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (subtitle !== undefined) dataToUpdate.subtitle = subtitle.trim();
    if (price) dataToUpdate.price = price.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (features !== undefined) {
      dataToUpdate.features = Array.isArray(features)
        ? features
        : features.split("\n").map((f) => f.trim()).filter(Boolean);
    }
    if (popular !== undefined) dataToUpdate.popular = Boolean(popular);

    const updated = await db.pricingPackage.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating pricing package:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a pricing tier package
 */
export async function deletePricingPackage(id) {
  try {
    await db.pricingPackage.delete({ where: { id } });

    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");

    return { success: true };
  } catch (error) {
    console.error("Error deleting pricing package:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update pricing settings (Catalog PDF URL/Data, PDF Name, and Calculator Data)
 */
export async function updatePricingSettings(settingsData) {
  try {
    const { catalogPdfUrl, catalogPdfName, calculatorData } = settingsData;
    const dataToUpdate = {};
    if (catalogPdfUrl !== undefined) dataToUpdate.catalogPdfUrl = catalogPdfUrl;
    if (catalogPdfName !== undefined) dataToUpdate.catalogPdfName = catalogPdfName;
    if (calculatorData !== undefined) dataToUpdate.calculatorData = calculatorData;

    const updated = await db.pricingSettings.upsert({
      where: { id: "default-pricing-settings" },
      update: dataToUpdate,
      create: {
        id: "default-pricing-settings",
        catalogPdfUrl: catalogPdfUrl || null,
        catalogPdfName: catalogPdfName || "Aameena_Furniture_Rate_Card.pdf",
        calculatorData: calculatorData || DEFAULT_CALCULATOR,
      },
    });

    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    return { success: false, error: error.message };
  }
}
