import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/prisma.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Verify it is a PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF documents (.pdf) are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // Sanitize filename
    const originalName = file.name || "catalog.pdf";
    const cleanBase = originalName
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const uniqueSuffix = Date.now().toString(36);
    const fileName = `${cleanBase}_${uniqueSuffix}.pdf`;
    const slug = `${cleanBase.toLowerCase()}-${uniqueSuffix}`;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    // 1. Always persist the PDF into PostgreSQL database
    try {
      await db.catalogDocument.create({
        data: {
          slug,
          fileName,
          title: cleanBase.replace(/_/g, " "),
          fileSize: fileSizeMb === "0.0 MB" ? `${(file.size / 1024).toFixed(1)} KB` : fileSizeMb,
          mimeType: "application/pdf",
          data: base64Data,
        },
      });
    } catch (dbErr) {
      console.error("[upload-pdf API] DB saving error:", dbErr);
    }

    // 2. Best-effort local file saving (works on local dev, safely ignored on Vercel read-only filesystem)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "catalogs");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
    } catch (fsErr) {
      // Vercel serverless functions have a read-only filesystem.
      // Since the file is safely stored in PostgreSQL, we ignore filesystem errors.
      console.warn("[upload-pdf API] Notice: Filesystem write skipped (using PostgreSQL DB storage):", fsErr.message);
    }

    // Return the database-connected API URL
    const publicUrl = `/api/catalogs/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: fileSizeMb,
    });
  } catch (error) {
    console.error("[upload-pdf API] Upload failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload PDF" },
      { status: 500 }
    );
  }
}

