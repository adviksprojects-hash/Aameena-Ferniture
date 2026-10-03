import { db } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";
import { unstable_cache } from "next/cache";

export const metadata = {
  title: "Handcrafted Solid Wood Furniture Catalog | Aameena Furniture",
  description: "Browse bespoke Sagwan Teak, Indian Sheesham, and Rosewood living room, bedroom, and dining furniture.",
};

const getCachedCatalogProducts = unstable_cache(
  async () => {
    return db.product.findMany({
      where: {
        isArchived: false,
      },
      include: {
        Category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["active-storefront-products"],
  {
    revalidate: 60,
    tags: ["products"],
  }
);

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const initialCategory = params?.cat || params?.category || "all";

  const products = await getCachedCatalogProducts();

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <ProductsClient initialProducts={products} initialCategory={initialCategory} />
    </div>
  );
}
