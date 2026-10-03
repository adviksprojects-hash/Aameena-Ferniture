"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

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

export const DEFAULT_CATEGORY_PDFS = [
  {
    id: "cat-pdf-living",
    title: "Living Room, Sofas & Recliners Rate Card",
    category: "Living Room",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfName: "Living_Room_Sofas_Catalog.pdf",
    fileSize: "3.2 MB",
    updatedAt: "2026-10-03",
  },
  {
    id: "cat-pdf-dining",
    title: "Sagwan Teak Dining Suites & Chairs",
    category: "Dining Sets",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfName: "Teak_Dining_Rate_Card.pdf",
    fileSize: "2.5 MB",
    updatedAt: "2026-10-03",
  },
  {
    id: "cat-pdf-bedroom",
    title: "Solid Wood Beds & Storage Wardrobes",
    category: "Bedroom",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfName: "Bedroom_Suites_Catalog.pdf",
    fileSize: "2.8 MB",
    updatedAt: "2026-10-03",
  },
  {
    id: "cat-pdf-fabrics",
    title: "Factory Loose Cloth & Sofa Upholstery Textiles Rate Card",
    category: "Loose Cloth & Fabrics",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfName: "Factory_Loose_Fabrics_Rate_Card.pdf",
    fileSize: "1.8 MB",
    updatedAt: "2026-10-03",
  },
];

const DEFAULT_CALCULATOR = {
  "1bhk": { teak: 145000, sheesham: 115000 },
  "2bhk": { teak: 235000, sheesham: 185000 },
  "3bhk": { teak: 360000, sheesham: 285000 },
  "villa": { teak: 580000, sheesham: 460000 },
  categoryPdfs: DEFAULT_CATEGORY_PDFS,
};

/**
const fetchPricingDataFromDb = async () => {
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
        catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
        catalogPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        calculatorData: DEFAULT_CALCULATOR,
      },
    });
  } else {
    // Ensure categoryPdfs exist in calculatorData
    const calcData = settings.calculatorData || {};
    if (!calcData.categoryPdfs || !Array.isArray(calcData.categoryPdfs) || calcData.categoryPdfs.length === 0) {
      calcData.categoryPdfs = DEFAULT_CATEGORY_PDFS;
      settings = await db.pricingSettings.update({
        where: { id: "default-pricing-settings" },
        data: { calculatorData: calcData },
      });
    }
  }

  return {
    packages,
    settings,
    categoryPdfs: settings.calculatorData?.categoryPdfs || DEFAULT_CATEGORY_PDFS,
  };
};

const getCachedPricing = unstable_cache(
  fetchPricingDataFromDb,
  ["pricing-data-cache"],
  {
    revalidate: 60,
    tags: ["pricing"],
  }
);

/**
 * Fetch all pricing packages and settings (seeded if empty)
 */
export async function getPricingData() {
  try {
    const data = await getCachedPricing();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    return {
      success: false,
      error: error.message,
      data: {
        packages: DEFAULT_PACKAGES,
        settings: {
          catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
          catalogPdfUrl: null,
          calculatorData: DEFAULT_CALCULATOR,
        },
        categoryPdfs: DEFAULT_CATEGORY_PDFS,
      },
    };
  }
}

function purgePricingCache() {
  try {
    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");
    revalidateTag("pricing");
  } catch (e) {}
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

    purgePricingCache();

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

    purgePricingCache();

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

    purgePricingCache();

    return { success: true };
  } catch (error) {
    console.error("Error deleting pricing package:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update master pricing settings (Single Catalog PDF for all furniture)
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
        catalogPdfName: catalogPdfName || "Aameena_Furniture_Master_Catalog.pdf",
        calculatorData: calculatorData || DEFAULT_CALCULATOR,
      },
    });

    purgePricingCache();

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Add a new category-specific PDF
 */
export async function addCategoryPdf(pdfData) {
  try {
    const { title, category, pdfUrl, pdfName, fileSize = "2.5 MB" } = pdfData;
    if (!title || !category || !pdfUrl) {
      return { success: false, error: "Title, category, and PDF file/URL are required." };
    }

    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    const calcData = (settings && settings.calculatorData) ? { ...settings.calculatorData } : { ...DEFAULT_CALCULATOR };
    const currentList = Array.isArray(calcData.categoryPdfs) ? calcData.categoryPdfs : [...DEFAULT_CATEGORY_PDFS];

    const newPdf = {
      id: "pdf-" + Date.now(),
      title: title.trim(),
      category: category.trim(),
      pdfUrl: pdfUrl.trim(),
      pdfName: pdfName ? pdfName.trim() : `${title.trim().replace(/\s+/g, "_")}.pdf`,
      fileSize: fileSize.trim(),
      updatedAt: new Date().toISOString().split("T")[0],
    };

    calcData.categoryPdfs = [newPdf, ...currentList];

    await db.pricingSettings.upsert({
      where: { id: "default-pricing-settings" },
      update: { calculatorData: calcData },
      create: {
        id: "default-pricing-settings",
        catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
        calculatorData: calcData,
      },
    });

    purgePricingCache();

    return { success: true, pdf: newPdf, categoryPdfs: calcData.categoryPdfs };
  } catch (error) {
    console.error("Error in addCategoryPdf:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Update an existing category-specific PDF
 */
export async function updateCategoryPdf(id, pdfData) {
  try {
    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    const calcData = (settings && settings.calculatorData) ? { ...settings.calculatorData } : { ...DEFAULT_CALCULATOR };
    const currentList = Array.isArray(calcData.categoryPdfs) ? calcData.categoryPdfs : [...DEFAULT_CATEGORY_PDFS];

    calcData.categoryPdfs = currentList.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          title: pdfData.title !== undefined ? pdfData.title.trim() : p.title,
          category: pdfData.category !== undefined ? pdfData.category.trim() : p.category,
          pdfUrl: pdfData.pdfUrl !== undefined ? pdfData.pdfUrl.trim() : p.pdfUrl,
          pdfName: pdfData.pdfName !== undefined ? pdfData.pdfName.trim() : p.pdfName,
          fileSize: pdfData.fileSize !== undefined ? pdfData.fileSize.trim() : p.fileSize,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    });

    await db.pricingSettings.update({
      where: { id: "default-pricing-settings" },
      data: { calculatorData: calcData },
    });

    purgePricingCache();

    return { success: true, categoryPdfs: calcData.categoryPdfs };
  } catch (error) {
    console.error("Error in updateCategoryPdf:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Delete a category-specific PDF
 */
export async function deleteCategoryPdf(id) {
  try {
    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    const calcData = (settings && settings.calculatorData) ? { ...settings.calculatorData } : { ...DEFAULT_CALCULATOR };
    const currentList = Array.isArray(calcData.categoryPdfs) ? calcData.categoryPdfs : [...DEFAULT_CATEGORY_PDFS];

    calcData.categoryPdfs = currentList.filter((p) => p.id !== id);

    await db.pricingSettings.update({
      where: { id: "default-pricing-settings" },
      data: { calculatorData: calcData },
    });

    purgePricingCache();

    return { success: true, categoryPdfs: calcData.categoryPdfs };
  } catch (error) {
    console.error("Error in deleteCategoryPdf:", error);
    return { success: false, error: error.message };
  }
}
