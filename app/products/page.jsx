import { db } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";

export const metadata = {
  title: "Handcrafted Solid Wood Furniture Catalog | Aameena Furniture",
  description: "Browse bespoke Sagwan Teak, Indian Sheesham, and Rosewood living room, bedroom, and dining furniture.",
};

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: {
      isArchived: false,
    },
    include: {
      Category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <ProductsClient initialProducts={products} />
    </div>
  );
}
