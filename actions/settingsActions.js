"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

const SETTINGS_FILE = path.join(process.cwd(), "data", "platformSettings.json");

const DEFAULT_SETTINGS = {
  storeName: "Aameena Distributors",
  storeSubtitle: "Sofa Set Furniture & Furnishing Company",
  tagline: "Handcrafted Solid Sagwan Teak Wood Furniture & Luxury Living Solutions",
  supportPhone: "+91 97303 92917",
  whatsappNumber: "+91 97303 92917",
  supportEmail: "sales@aameenadistributors.com",
  showroomAddress: "Main Showroom & Workshop, Near Old Pune Naka, Solapur, Maharashtra - 413005",
  gstin: "27AAAAA0000A1Z5",
  currency: "INR (₹)",
  defaultStorefrontTheme: "light",
  defaultManagerTheme: "emerald",
  enableThemeSwitcher: true,
  enableAnnouncement: true,
  announcementText: "🎉 Festive Teak Collection: Flat 20% Off on Custom Handcrafted Living Sets & Free Delivery in Solapur!",
  announcementColor: "orange",
  enableWhatsAppOrdering: true,
  enableARView: true,
  enableCatalogDownload: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Fetch platform settings from PostgreSQL database with file fallback
 */
export async function getPlatformSettings() {
  try {
    // 1. First priority: Fetch from PostgreSQL database (PricingSettings model's calculatorData Json)
    try {
      const dbSettings = await db.pricingSettings.findUnique({
        where: { id: "default-pricing-settings" },
      });

      if (dbSettings && dbSettings.calculatorData && typeof dbSettings.calculatorData === "object") {
        const stored = dbSettings.calculatorData.platformSettings;
        if (stored && typeof stored === "object") {
          return {
            success: true,
            settings: { ...DEFAULT_SETTINGS, ...stored },
            source: "database",
          };
        }
      }
    } catch (dbErr) {
      console.warn("Notice: Database lookup for platform settings fallback to file storage:", dbErr?.message);
    }

    // 2. Secondary fallback: Read from persistent JSON file
    try {
      const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        success: true,
        settings: { ...DEFAULT_SETTINGS, ...parsed },
        source: "file",
      };
    } catch (fileErr) {
      // 3. Final fallback: Return defaults
      return { success: true, settings: DEFAULT_SETTINGS, source: "default" };
    }
  } catch (error) {
    console.error("Error retrieving platform settings:", error);
    return { success: true, settings: DEFAULT_SETTINGS, source: "default" };
  }
}

/**
 * Update platform settings in PostgreSQL database and local storage
 */
export async function updatePlatformSettings(data) {
  try {
    // 1. Fetch current settings from database
    let current = DEFAULT_SETTINGS;
    let existingCalcData = {};

    try {
      const dbRecord = await db.pricingSettings.findUnique({
        where: { id: "default-pricing-settings" },
      });

      if (dbRecord && dbRecord.calculatorData && typeof dbRecord.calculatorData === "object") {
        existingCalcData = dbRecord.calculatorData;
        if (existingCalcData.platformSettings) {
          current = { ...DEFAULT_SETTINGS, ...existingCalcData.platformSettings };
        }
      }
    } catch (e) {
      console.warn("DB read note during platform settings update:", e?.message);
    }

    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // 2. Persist directly to PostgreSQL database via Prisma
    let dbSuccess = false;
    try {
      const mergedCalculatorData = {
        ...existingCalcData,
        platformSettings: updated,
      };

      await db.pricingSettings.upsert({
        where: { id: "default-pricing-settings" },
        update: {
          calculatorData: mergedCalculatorData,
        },
        create: {
          id: "default-pricing-settings",
          catalogPdfName: "Aameena_Furniture_Official_Rate_Card.pdf",
          calculatorData: mergedCalculatorData,
        },
      });

      dbSuccess = true;

      // Also record in enterprise audit log if table exists
      try {
        await db.enterpriseAuditLog.create({
          data: {
            action: "DB_UPDATE",
            entityType: "SYSTEM",
            actorRole: "SUPER_ADMIN",
            actorName: "Super Admin",
            status: "SUCCESS",
            details: `Updated platform settings for store: ${updated.storeName || "Aameena Furniture"}`,
            newValues: updated,
          },
        });
      } catch (auditErr) {
        // Non-blocking for audit logs
      }
    } catch (dbSaveErr) {
      console.error("Critical error saving platform settings to database:", dbSaveErr);
      // If DB failed, we still attempt file save but notify error
    }

    // 3. Also write to data/platformSettings.json if filesystem is available
    try {
      const dir = path.dirname(SETTINGS_FILE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    } catch (fsErr) {
      // Ignored in read-only environments like Vercel serverless
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/manager");

    return {
      success: true,
      settings: updated,
      databaseSaved: dbSuccess,
    };
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return { success: false, error: error.message || "Failed to save settings to database." };
  }
}
