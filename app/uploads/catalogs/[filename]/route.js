import { GET as getCatalog } from "@/app/api/catalogs/[filename]/route.js";

export const dynamic = "force-dynamic";

/**
 * Route handler for legacy /uploads/catalogs/[filename] paths.
 * If a static file is not found in public/ (e.g. on serverless Vercel deployments),
 * Next.js delegates to this route handler, which serves the PDF directly from PostgreSQL.
 */
export async function GET(request, context) {
  return getCatalog(request, context);
}
