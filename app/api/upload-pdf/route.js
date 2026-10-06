import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Sanitize filename
    const originalName = file.name || "catalog.pdf";
    const cleanBase = originalName
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const uniqueSuffix = Date.now().toString(36);
    const fileName = `${cleanBase}_${uniqueSuffix}.pdf`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "catalogs");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/catalogs/${fileName}`;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

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
