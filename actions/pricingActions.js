"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import {
  DEFAULT_PACKAGE_CATEGORIES,
  DEFAULT_CALCULATOR_SETTINGS,
  TIER_SPECIFICATIONS,
} from "../lib/pricing/pricingConstants.js";

const fetchPricingDataFromDb = async () => {
  let settings = await db.pricingSettings.findUnique({
    where: { id: "default-pricing-settings" },
  });

  if (!settings) {
    settings = await db.pricingSettings.create({
      data: {
        id: "default-pricing-settings",
        catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
        catalogPdfUrl: "/uploads/catalogs/Aameena_Furniture_Master_Catalog.pdf",
        calculatorData: DEFAULT_CALCULATOR_SETTINGS,
      },
    });
  } else {
    const calcData = settings.calculatorData || {};
    if (
      !calcData.packageCategories ||
      !Array.isArray(calcData.packageCategories) ||
      calcData.packageCategories.length === 0
    ) {
      calcData.packageCategories = DEFAULT_PACKAGE_CATEGORIES;
      settings = await db.pricingSettings.update({
        where: { id: "default-pricing-settings" },
        data: { calculatorData: calcData },
      });
    }
  }

  const packageCategories =
    settings.calculatorData?.packageCategories || DEFAULT_PACKAGE_CATEGORIES;

  return {
    settings,
    packageCategories,
    categories: packageCategories,
  };
};

const getCachedPricing = unstable_cache(
  fetchPricingDataFromDb,
  ["pricing-data-cache-v3"],
  {
    revalidate: 1,
    tags: ["pricing"],
  }
);

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
      success: true,
      data: {
        settings: {
          catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
          catalogPdfUrl: "/uploads/catalogs/Aameena_Furniture_Master_Catalog.pdf",
          calculatorData: DEFAULT_CALCULATOR_SETTINGS,
        },
        packageCategories: DEFAULT_PACKAGE_CATEGORIES,
        categories: DEFAULT_PACKAGE_CATEGORIES,
      },
    };
  }
}

function purgePricingCache() {
  try {
    revalidatePath("/pricing");
    revalidatePath("/admin/pricing");
    revalidatePath("/manager/pricing");
    revalidateTag("pricing");
  } catch (e) {
    // ignore outside request context
  }
}

function formatInr(val) {
  if (!val) return "Contact for Quote";
  if (typeof val === "string" && val.startsWith("₹")) return val;
  const num = typeof val === "number" ? val : parseInt(String(val).replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return String(val);
  return `₹${num.toLocaleString("en-IN")}`;
}

function parseInr(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const num = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Save or create a Package Category (1 BHK, 2 BHK, 3 BHK, Villa, or Custom)
 * Correctly updates prices across all 3 tiers while preserving universal tier specs.
 */
export async function savePackageCategory(categoryData) {
  try {
    const {
      id,
      name,
      pdfUrl,
      pdfName,
      fileSize = "2.5 MB",
      description = "",
      budgetPrice,
      simplePrice,
      premiumPrice,
      models,
    } = categoryData;

    if (!name || !name.trim()) {
      return { success: false, error: "Category name is required." };
    }

    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    const calcData =
      settings && settings.calculatorData
        ? { ...settings.calculatorData }
        : { ...DEFAULT_CALCULATOR_SETTINGS };

    const currentList = Array.isArray(calcData.packageCategories)
      ? [...calcData.packageCategories]
      : [...DEFAULT_PACKAGE_CATEGORIES];

    const targetId = id || `cat-${Date.now().toString(36)}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingIdx = currentList.findIndex(
      (c) => c.id === targetId || c.name.toLowerCase() === name.toLowerCase().trim()
    );

    const existingCat = existingIdx >= 0 ? currentList[existingIdx] : null;

    // Resolve models with 3 pricing sections
    const existingModels = existingCat?.models || {};

    const resolvedBudgetPrice =
      budgetPrice !== undefined
        ? formatInr(budgetPrice)
        : models?.budget?.price || existingModels?.budget?.price || "₹1,50,000";

    const resolvedSimplePrice =
      simplePrice !== undefined
        ? formatInr(simplePrice)
        : models?.simple?.price || existingModels?.simple?.price || "₹2,25,000";

    const resolvedPremiumPrice =
      premiumPrice !== undefined
        ? formatInr(premiumPrice)
        : models?.premium?.price || existingModels?.premium?.price || "₹3,50,000";

    const updatedModels = {
      budget: {
        ...TIER_SPECIFICATIONS.budget,
        ...(existingModels.budget || {}),
        ...(models?.budget || {}),
        price: resolvedBudgetPrice,
        numericPrice: parseInr(resolvedBudgetPrice),
      },
      simple: {
        ...TIER_SPECIFICATIONS.simple,
        ...(existingModels.simple || {}),
        ...(models?.simple || {}),
        price: resolvedSimplePrice,
        numericPrice: parseInr(resolvedSimplePrice),
      },
      premium: {
        ...TIER_SPECIFICATIONS.premium,
        ...(existingModels.premium || {}),
        ...(models?.premium || {}),
        price: resolvedPremiumPrice,
        numericPrice: parseInr(resolvedPremiumPrice),
      },
    };

    const updatedCategory = {
      id: targetId,
      name: name.trim(),
      slug,
      pdfUrl: pdfUrl ? pdfUrl.trim() : existingCat?.pdfUrl || null,
      pdfName: pdfName
        ? pdfName.trim()
        : existingCat?.pdfName || `${name.trim().replace(/\s+/g, "_")}_Rate_Card.pdf`,
      fileSize: fileSize || existingCat?.fileSize || "2.5 MB",
      description:
        description.trim() ||
        existingCat?.description ||
        `${name.trim()} turnkey furniture package from Aameena Furniture.`,
      models: updatedModels,
    };

    if (existingIdx >= 0) {
      currentList[existingIdx] = updatedCategory;
    } else {
      currentList.push(updatedCategory);
    }

    calcData.packageCategories = currentList;

    await db.pricingSettings.upsert({
      where: { id: "default-pricing-settings" },
      update: { calculatorData: calcData },
      create: {
        id: "default-pricing-settings",
        catalogPdfName: "Aameena_Furniture_Master_Catalog.pdf",
        catalogPdfUrl: "/uploads/catalogs/Aameena_Furniture_Master_Catalog.pdf",
        calculatorData: calcData,
      },
    });

    purgePricingCache();

    return {
      success: true,
      category: updatedCategory,
      categories: currentList,
    };
  } catch (error) {
    console.error("Error in savePackageCategory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a Package Category
 */
export async function deletePackageCategory(catId) {
  try {
    let settings = await db.pricingSettings.findUnique({
      where: { id: "default-pricing-settings" },
    });

    const calcData =
      settings && settings.calculatorData
        ? { ...settings.calculatorData }
        : { ...DEFAULT_CALCULATOR_SETTINGS };

    const currentList = Array.isArray(calcData.packageCategories)
      ? [...calcData.packageCategories]
      : [...DEFAULT_PACKAGE_CATEGORIES];

    calcData.packageCategories = currentList.filter((c) => c.id !== catId);

    await db.pricingSettings.update({
      where: { id: "default-pricing-settings" },
      data: { calculatorData: calcData },
    });

    purgePricingCache();

    return { success: true, categories: calcData.packageCategories };
  } catch (error) {
    console.error("Error in deletePackageCategory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update master pricing settings (Single Master Catalog PDF)
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
        calculatorData: calculatorData || DEFAULT_CALCULATOR_SETTINGS,
      },
    });

    purgePricingCache();

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    return { success: false, error: error.message };
  }
}
