import { db } from "./prisma.js";

const DEFAULT_CATEGORY_TITLES = {
  living: "Living Room Luxury",
  bedroom: "Master Bedroom Suites",
  dining: "Royal Dining Collections",
  fabrics: "Loose Cloth & Fabrics",
  office: "Office & Study",
  joinery: "Architectural Joinery",
  executive: "Executive & Contract",
};

const DEFAULT_CATEGORY_SUBTITLES = {
  living: "Royal Sofas, Recliners & Center Tables",
  bedroom: "Solid Wood King Beds & Wardrobes",
  dining: "6 & 8 Seater Teak Dining Suites",
  fabrics: "Factory Velvet, Jacquard & Upholstery Fabric Rolls",
  office: "Executive Desks & Ergonomic Study Tables",
  joinery: "Bespoke Doorways & Custom Woodwork",
  executive: "Corporate Boardroom & Studio Suites",
};

const DEFAULT_CATEGORY_IMAGES = {
  living: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  bedroom: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  dining: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
  fabrics: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
  office: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
};

const FALLBACK_SLIDE_PRODUCTS = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    label: "Royal 7-Seater Teak Sofa",
    price: "₹85,000",
    category: "Living Room",
    href: "/products",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    label: "Monarch Dining Suite",
    price: "₹54,000",
    category: "Dining Room",
    href: "/products",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    label: "Imperial Master King Bed",
    price: "₹62,500",
    category: "Bedroom",
    href: "/products",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    label: "Heritage 4-Door Wardrobe",
    price: "₹48,900",
    category: "Storage",
    href: "/products",
  },
];

const CATEGORY_PRIORITY = [
  "living",
  "bedroom",
  "dining",
  "fabrics",
  "office",
  "executive",
  "joinery",
];

export async function getHomepageData() {
  try {
    // 1. Fetch all active non-archived products from PostgreSQL
    const products = await db.product.findMany({
      where: { isArchived: false },
      include: {
        Category: true,
        OrderItem: {
          select: { quantity: true },
        },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch categories with their active products
    const categoriesFromDb = await db.category.findMany({
      include: {
        Product: {
          where: { isArchived: false },
          select: {
            id: true,
            title: true,
            images: true,
            woodType: true,
            price: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // 3. Map dynamic products for horizontal sliders
    const rawSliding = products
      .filter((p) => Array.isArray(p.images) && p.images.length > 0 && p.images[0])
      .map((p) => ({
        id: p.id,
        src: p.images[0],
        label: p.title,
        price: `₹${Number(p.price || 0).toLocaleString("en-IN")}`,
        category: p.Category?.name || "Solid Woodcraft",
        href: `/products/${p.id}`,
      }));

    const slidingList = rawSliding.length > 0 ? rawSliding : FALLBACK_SLIDE_PRODUCTS;

    // Distribute into 2 distinct sets for Row 1 & Row 2
    let row1 = [];
    let row2 = [];

    if (slidingList.length >= 6) {
      row1 = slidingList.filter((_, i) => i % 2 === 0);
      row2 = slidingList.filter((_, i) => i % 2 === 1);
    } else {
      row1 = [...slidingList];
      row2 = [...slidingList].reverse();
    }

    // Ensure at least 8 items per row for infinite marquee width
    while (row1.length < 8) {
      row1 = [...row1, ...row1];
    }
    while (row2.length < 8) {
      row2 = [...row2, ...row2];
    }

    // 4. Map dynamic categories based on products added by admin/manager
    // Sort categories according to consumer priority, placing Living, Bedroom, Dining, Fabrics first
    const sortedCategories = [...categoriesFromDb].sort((a, b) => {
      const idxA = CATEGORY_PRIORITY.indexOf(a.slug);
      const idxB = CATEGORY_PRIORITY.indexOf(b.slug);
      const prioA = idxA !== -1 ? idxA : 99;
      const prioB = idxB !== -1 ? idxB : 99;
      if (prioA !== prioB) return prioA - prioB;
      return (b.Product?.length || 0) - (a.Product?.length || 0);
    });

    const categoriesWithProducts = sortedCategories
      .filter((c) => c.Product && c.Product.length > 0)
      .map((c) => {
        const count = c.Product.length;
        // Prefer an http/https image over large base64 if available
        const cleanProductImage =
          c.Product.find((p) => p.images?.[0] && !p.images[0].startsWith("data:"))
            ?.images?.[0] || c.Product[0]?.images?.[0];

        const categoryImg =
          cleanProductImage ||
          c.imageUrl ||
          DEFAULT_CATEGORY_IMAGES[c.slug] ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

        const title =
          DEFAULT_CATEGORY_TITLES[c.slug] ||
          (c.name.includes("Room") || c.name.includes("Cloth")
            ? c.name
            : `${c.name} Collection`);

        const subtitle =
          c.description ||
          DEFAULT_CATEGORY_SUBTITLES[c.slug] ||
          `Handcrafted ${c.name} Collection`;

        return {
          id: c.slug,
          title,
          subtitle,
          image: categoryImg,
          itemsCount:
            c.slug === "fabrics"
              ? `${count} Factory Rolls`
              : `${count} ${count === 1 ? "Piece" : "Pieces"} Available`,
          href: `/products?category=${c.slug}`,
          productCount: count,
        };
      });

    // Ensure the top 4 primary categories are always available
    const fallbackCategoryKeys = ["living", "bedroom", "dining", "fabrics"];
    const mergedCategories = [...categoriesWithProducts];

    for (const key of fallbackCategoryKeys) {
      if (!mergedCategories.some((c) => c.id === key)) {
        mergedCategories.push({
          id: key,
          title: DEFAULT_CATEGORY_TITLES[key] || "Solid Woodcraft",
          subtitle: DEFAULT_CATEGORY_SUBTITLES[key] || "Solid Hardwood Collections",
          image: DEFAULT_CATEGORY_IMAGES[key],
          itemsCount: "Artisan Range",
          href: `/products?category=${key}`,
          productCount: 0,
        });
      }
    }

    // 5. Map Handcrafted Favorites (Featured Bestselling Masterpieces)
    // Dynamic ranking based on total sold quantities from OrderItem, then isFeatured, then createdAt
    const rankedProducts = products
      .map((p) => {
        const totalSold = (p.OrderItem || []).reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );

        const avgRating =
          p.reviews && p.reviews.length > 0
            ? Number(
                (
                  p.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  p.reviews.length
                ).toFixed(1)
              )
            : 4.9;

        const reviewCount =
          p.reviews && p.reviews.length > 0 ? p.reviews.length : 24;

        let tag = "Artisan Choice";
        if (totalSold > 0) tag = "Best Seller";
        else if (p.isFeatured) tag = "Featured";
        else if (p.stock <= 3) tag = "Selling Fast";

        return {
          id: p.id,
          name: p.title,
          category: p.Category?.name || "Living Room",
          price: `₹${Number(p.price || 0).toLocaleString("en-IN")}`,
          originalPrice: p.compareAtPrice
            ? `₹${Number(p.compareAtPrice).toLocaleString("en-IN")}`
            : null,
          rating: avgRating,
          reviews: reviewCount,
          material: p.woodType || p.materialPurity || "Grade-A Sagwan Teak",
          tag,
          image:
            (p.images && p.images[0]) ||
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
          totalSold,
          isFeatured: p.isFeatured,
          href: `/products/${p.id}`,
        };
      })
      .sort(
        (a, b) =>
          b.totalSold - a.totalSold ||
          (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      )
      .slice(0, 4);

    const bestsellers =
      rankedProducts.length > 0 ? rankedProducts : FALLBACK_SLIDE_PRODUCTS;

    return {
      sliderRow1: row1,
      sliderRow2: row2,
      categories: mergedCategories.slice(0, 4),
      bestsellers,
    };
  } catch (error) {
    console.error("Error in getHomepageData:", error);
    return {
      sliderRow1: FALLBACK_SLIDE_PRODUCTS,
      sliderRow2: [...FALLBACK_SLIDE_PRODUCTS].reverse(),
      categories: [
        {
          id: "living",
          title: DEFAULT_CATEGORY_TITLES.living,
          subtitle: DEFAULT_CATEGORY_SUBTITLES.living,
          image: DEFAULT_CATEGORY_IMAGES.living,
          itemsCount: "Artisan Range",
          href: "/products?category=living",
        },
        {
          id: "bedroom",
          title: DEFAULT_CATEGORY_TITLES.bedroom,
          subtitle: DEFAULT_CATEGORY_SUBTITLES.bedroom,
          image: DEFAULT_CATEGORY_IMAGES.bedroom,
          itemsCount: "Artisan Range",
          href: "/products?category=bedroom",
        },
        {
          id: "dining",
          title: DEFAULT_CATEGORY_TITLES.dining,
          subtitle: DEFAULT_CATEGORY_SUBTITLES.dining,
          image: DEFAULT_CATEGORY_IMAGES.dining,
          itemsCount: "Artisan Range",
          href: "/products?category=dining",
        },
        {
          id: "fabrics",
          title: DEFAULT_CATEGORY_TITLES.fabrics,
          subtitle: DEFAULT_CATEGORY_SUBTITLES.fabrics,
          image: DEFAULT_CATEGORY_IMAGES.fabrics,
          itemsCount: "Factory Stock",
          href: "/products?category=fabrics",
        },
      ],
      bestsellers: FALLBACK_SLIDE_PRODUCTS,
    };
  }
}
