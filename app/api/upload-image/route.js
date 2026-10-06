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
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    const mimeType = file.type || "";
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/jpg"];

    if (!allowedTypes.includes(mimeType) && !/\.(jpe?g|png|webp|avif|gif)$/i.test(file.name)) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid image file (JPEG, PNG, WebP, AVIF, GIF)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract clean extension
    let ext = "jpg";
    if (file.name && file.name.includes(".")) {
      ext = file.name.split(".").pop().toLowerCase();
    } else if (mimeType.includes("/")) {
      ext = mimeType.split("/")[1];
      if (ext === "jpeg") ext = "jpg";
    }

    const uniqueId = Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
    const fileName = `review_${uniqueId}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/reviews/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("[upload-image API] Failed to upload image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
