import { db } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";
import { unstable_cache } from "next/cache";

export const metadata = {
  title: "Handcrafted Solid Wood Furniture Catalog | Aameena Furniture",
  description: "Browse bespoke Sagwan Teak, Indian Sheesham, and Rosewood living room, bedroom, and dining furniture.",
};

export const dynamic = "force-dynamic";

async function getCatalogProducts() {
  try {
    const products = await db.product.findMany({
      where: {
        isArchived: false,
      },
      include: {
        Category: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(products || []));
  } catch (error) {
    console.error("Error fetching catalog products:", error?.message || error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const initialCategory = params?.cat || params?.category || "all";

  const products = await getCatalogProducts();

  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-12">
      <ProductsClient initialProducts={products} initialCategory={initialCategory} />
    </div>
  );
}
