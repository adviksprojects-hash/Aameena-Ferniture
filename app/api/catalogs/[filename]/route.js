import { NextResponse } from "next/server";
import { db } from "@/lib/prisma.js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Generate a dynamic fallback PDF for Aameena Furniture catalogs
 * Ensures that even if a custom file is missing from both DB and disk,
 * the user receives an official, valid PDF document instead of a 404.
 */
function generateDynamicPdf(title, subtitle) {
  const safeTitle = (title || "AAMEENA FURNITURE CATALOG").toUpperCase().replace(/[()]/g, "");
  const safeSubtitle = (subtitle || "Direct Factory Pricing & Turnkey Furnishing").replace(/[()]/g, "");
  const dateStr = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const streamContent = `BT
/F1 20 Tf
50 740 Td
(AAMEENA FURNITURE & FURNISHING - SOLAPUR) Tj
/F1 14 Tf
0 -35 Td
(${safeTitle}) Tj
/F1 11 Tf
0 -25 Td
(${safeSubtitle}) Tj
0 -20 Td
(Official Factory Rate Card - ${dateStr}) Tj
0 -30 Td
(--------------------------------------------------------------------------------) Tj
0 -25 Td
(100% Certified Central Province CP Sagwan Teakwood & Marine Grade 710 Plywood) Tj
0 -20 Td
(Direct Factory: +91 97303 92917 | Sole Official Store Solapur) Tj
0 -20 Td
(Showroom: Main Showroom & Workshop, Near Old Pune Naka, Solapur - 413005) Tj
0 -30 Td
(Turnkey Home Packages Available:) Tj
0 -20 Td
( - Budget Friendly Tier: Essential MR Grade Ply & Anti-Scratch Laminate) Tj
0 -20 Td
( - Simple Standard Tier: 100% BWP Marine Grade 710 Ply & Acrylic/PU Finish) Tj
0 -20 Td
( - Royal Sagwan Teak Tier: 100% Solid CP Sagwan Teakwood Heirloom Polish) Tj
0 -30 Td
(All packages include free doorstep delivery & white-glove setup in Solapur.) Tj
ET`;

  const streamBytes = Buffer.byteLength(streamContent, "utf8");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamBytes} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(244 + 50 + streamBytes).toString().padStart(3, "0")} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${(300 + streamBytes)}
%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const requestedFile = decodeURIComponent(resolvedParams.filename || "");

    if (!requestedFile) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // 1. Try querying the CatalogDocument table from PostgreSQL
    try {
      const doc = await db.catalogDocument.findFirst({
        where: {
          OR: [
            { fileName: requestedFile },
            { slug: requestedFile.replace(/\.pdf$/i, "").toLowerCase() },
          ],
        },
      });

      if (doc && doc.data) {
        const fileBuffer = Buffer.from(doc.data, "base64");
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${doc.fileName || requestedFile}"`,
            "Content-Length": String(fileBuffer.length),
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Catalog API] DB query notice:", dbErr.message);
    }

    // 2. Check if the file exists on disk in public/uploads/catalogs/
    try {
      const diskPath = path.join(process.cwd(), "public", "uploads", "catalogs", requestedFile);
      if (fs.existsSync(diskPath)) {
        const diskBuffer = fs.readFileSync(diskPath);

        // Lazily back up to DB so future Vercel serverless queries find it instantly
        try {
          const slug = requestedFile.replace(/\.pdf$/i, "").toLowerCase();
          await db.catalogDocument.upsert({
            where: { slug },
            update: {
              fileName: requestedFile,
              data: diskBuffer.toString("base64"),
              fileSize: `${(diskBuffer.length / (1024 * 1024)).toFixed(1)} MB`,
            },
            create: {
              slug,
              fileName: requestedFile,
              title: requestedFile.replace(/[_-]/g, " ").replace(/\.pdf$/i, ""),
              data: diskBuffer.toString("base64"),
              fileSize: `${(diskBuffer.length / (1024 * 1024)).toFixed(1)} MB`,
            },
          });
        } catch (e) {}

        return new Response(diskBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${requestedFile}"`,
            "Content-Length": String(diskBuffer.length),
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch (diskErr) {
      console.warn("[Catalog API] Disk read notice:", diskErr.message);
    }

    // 3. Fallback: Generate dynamic official PDF so the user NEVER receives a 404
    const humanTitle = requestedFile
      .replace(/[_-]/g, " ")
      .replace(/\.pdf$/i, "");
    const generatedBuffer = generateDynamicPdf(
      humanTitle || "Official Turnkey Rate Card",
      "Solapur Factory Direct Furniture Packages"
    );

    return new Response(generatedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${requestedFile}"`,
        "Content-Length": String(generatedBuffer.length),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("[Catalog API] Unexpected error:", error);
    return NextResponse.json({ error: "Failed to load catalog document" }, { status: 500 });
  }
}
