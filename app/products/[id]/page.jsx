import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProductDetailView from "@/components/ProductDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: { Category: true },
  });

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

  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      Category: true,
    },
  });

  if (!product || product.isArchived) {
    notFound();
  }

  // Get related products from the same category
  const relatedProducts = await db.product.findMany({
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

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 lg:py-12">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
