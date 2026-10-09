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

    const fileNameLower = (file.name || "").toLowerCase();
    const isGlb = fileNameLower.endsWith(".glb");
    const isGltf = fileNameLower.endsWith(".gltf");
    const isUsdz = fileNameLower.endsWith(".usdz");

    // Verify it is a 3D model
    if (!isGlb && !isGltf && !isUsdz) {
      return NextResponse.json(
        { success: false, error: "Only 3D model files (.glb, .gltf, .usdz) are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    const ext = isGlb ? ".glb" : isGltf ? ".gltf" : ".usdz";

    // Sanitize filename
    const originalName = file.name || `furniture_model${ext}`;
    const cleanBase = originalName
      .replace(/\.(glb|gltf|usdz)$/i, "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const uniqueSuffix = Date.now().toString(36);
    const savedFileName = `${cleanBase}_${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "models");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, savedFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/models/${savedFileName}`;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: fileSizeMb,
    });
  } catch (error) {
    console.error("[upload-model3d API] Upload failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload 3D model file" },
      { status: 500 }
    );
  }
}
