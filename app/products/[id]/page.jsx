import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProductDetailView from "@/components/ProductDetailView";
import { DEFAULT_FABRIC_PRODUCTS } from "@/lib/constants/fabricDefaults";

export const dynamic = "force-dynamic";

async function fetchProduct(idParam) {
  const cleanId = decodeURIComponent(idParam || "").trim();
  if (!cleanId) return null;

  try {
    // 1. Try finding by direct ID, slug, or title match
    let product = await db.product.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { slug: cleanId },
          { slug: cleanId.toLowerCase() },
          { title: { equals: cleanId, mode: "insensitive" } },
        ],
      },
      include: { Category: true },
    });

    // 2. Fallback: try partial slug or case-insensitive match
    if (!product) {
      product = await db.product.findFirst({
        where: {
          OR: [
            { slug: { contains: cleanId, mode: "insensitive" } },
            { id: { contains: cleanId, mode: "insensitive" } },
          ],
        },
        include: { Category: true },
      });
    }

    if (product) return product;
  } catch (err) {
    console.warn("Database lookup notice in fetchProduct:", err?.message || err);
  }

  // 3. Fallback: check factory static fabric items
  const fabricMatch = DEFAULT_FABRIC_PRODUCTS.find(
    (fp) =>
      fp.id === cleanId ||
      fp.slug === cleanId ||
      fp.id.toLowerCase() === cleanId.toLowerCase() ||
      fp.slug.toLowerCase() === cleanId.toLowerCase() ||
      cleanId.includes(fp.id) ||
      cleanId.includes(fp.slug)
  );

  return fabricMatch || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Aameena Furniture",
    };
  }

  return {
    title: `${product.title} | Aameena Furniture Solapur`,
    description: `Buy handcrafted ${product.woodType} ${product.title}. Direct factory price ₹${product.price?.toLocaleString("en-IN")} from AMEENA Distributors’s Sofa Set Furniture Company, Solapur.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product || product.isArchived) {
    notFound();
  }

  // 1. Fetch recommended / similar products (same category first)
  let relatedProducts = [];
  try {
    if (product.categoryId) {
      relatedProducts = await db.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isArchived: false,
        },
        take: 4,
        include: {
          Category: true,
        },
      });
    }

    const isFabric =
      product.Category?.slug === "fabrics" ||
      product.Category?.name?.toLowerCase().includes("cloth");

    // 2. If fewer than 4 items, supplement with matching pieces of the same type
    if (relatedProducts.length < 4) {
      const excludeIds = [product.id, ...relatedProducts.map((p) => p.id)];
      const categoryFilter = isFabric
        ? { slug: "fabrics" }
        : { slug: { not: "fabrics" } };

      const matchingType = await db.product.findMany({
        where: {
          id: { notIn: excludeIds },
          isArchived: false,
          Category: categoryFilter,
        },
        take: 4 - relatedProducts.length,
        orderBy: { price: "desc" },
        include: {
          Category: true,
        },
      });

      relatedProducts = [...relatedProducts, ...matchingType];
    }

    // 3. Final fallback: any active products if still fewer than 4
    if (relatedProducts.length < 4) {
      const excludeIds = [product.id, ...relatedProducts.map((p) => p.id)];
      const fallback = await db.product.findMany({
        where: {
          id: { notIn: excludeIds },
          isArchived: false,
        },
        take: 4 - relatedProducts.length,
        include: {
          Category: true,
        },
      });
      relatedProducts = [...relatedProducts, ...fallback];
    }
  } catch (err) {
    console.warn("Notice fetching related products:", err?.message || err);
  }

  // Plain-object sanitization prevents RSC date/prototype serialization crashes
  const sanitizedProduct = JSON.parse(JSON.stringify(product));
  const sanitizedRelated = JSON.parse(JSON.stringify(relatedProducts || []));

  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-12 space-y-12">
      <ProductDetailView product={sanitizedProduct} relatedProducts={sanitizedRelated} />
    </div>
  );
}
