"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
  Ruler,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Share2,
} from "lucide-react";
import ProductShareModal from "@/components/ProductShareModal";

const DEFAULT_FABRIC_PRODUCTS = [
  {
    id: "fabric-loose-velvet",
    title: "Premium Royal Velvet Loose Sofa Cloth (By the Meter)",
    slug: "factory-loose-velvet-sofa-cloth",
    price: 850,
    compareAtPrice: 1200,
    woodType: "Heavy-Duty Velvet Cloth",
    dimensions: "Width: 54 inches (Sold by Meter)",
    finishType: "Water-Repellent Velvet Finish",
    stock: 250,
    showInquiryBtn: true,
    showDetailsBtn: true,
    Category: { id: "cat-fabrics", slug: "fabrics", name: "Loose Cloth & Fabrics" },
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Authentic raw loose velvet fabric stored in rolls directly at our Solapur manufacturing facility. 450 GSM, stain-resistant, and ideal for custom living room sofas and cushion covers.",
  },
  {
    id: "fabric-loose-jacquard",
    title: "Turkish Floral Jacquard Loose Furniture Cloth Roll",
    slug: "turkish-jacquard-loose-furniture-cloth",
    price: 1250,
    compareAtPrice: 1750,
    woodType: "Turkish Jacquard Fabric",
    dimensions: "Width: 56 inches (Sold by Meter)",
    finishType: "Heirloom Woven Texture",
    stock: 180,
    showInquiryBtn: true,
    showDetailsBtn: true,
    Category: { id: "cat-fabrics", slug: "fabrics", name: "Loose Cloth & Fabrics" },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Heavy woven royal jacquard loose cloth from our factory textile stock. High Martindale rub count engineered for longevity and luxurious sofa upholstery.",
  },
  {
    id: "fabric-loose-chenille",
    title: "Textured Chenille & Breathable Cotton Sofa Material",
    slug: "textured-chenille-cotton-sofa-material",
    price: 950,
    compareAtPrice: 1350,
    woodType: "Chenille-Cotton Blend",
    dimensions: "Width: 54 inches (Sold by Meter)",
    finishType: "Soft Matte Texture",
    stock: 320,
    showInquiryBtn: true,
    showDetailsBtn: true,
    Category: { id: "cat-fabrics", slug: "fabrics", name: "Loose Cloth & Fabrics" },
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Breathable textured chenille loose cloth stored at the factory. Highly durable, easy to wash, and perfect for daily-use sofa sets and accent armchairs.",
  },
];

export default function ProductsClient({ initialProducts = [], initialCategory = "all" }) {
  const [products] = useState(() => {
    const hasFabrics = initialProducts.some((p) => p.Category?.slug === "fabrics");
    return hasFabrics ? initialProducts : [...initialProducts, ...DEFAULT_FABRIC_PRODUCTS];
  });
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFinishes, setSelectedFinishes] = useState({});

  // Product Details Modal state
  const [detailsModalProduct, setDetailsModalProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sharingProduct, setSharingProduct] = useState(null);

  // Keyboard navigation (ESC to close, Left/Right for gallery) & body scroll lock
  useEffect(() => {
    if (!detailsModalProduct) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDetailsModalProduct(null);
      } else if (e.key === "ArrowLeft") {
        const len = detailsModalProduct.images?.length || 0;
        if (len > 1) {
          setActiveImageIndex((prev) => (prev === 0 ? len - 1 : prev - 1));
        }
      } else if (e.key === "ArrowRight") {
        const len = detailsModalProduct.images?.length || 0;
        if (len > 1) {
          setActiveImageIndex((prev) => (prev === len - 1 ? 0 : prev + 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailsModalProduct]);

  const FINISH_OPTIONS = [
    { id: "natural", name: "Natural Honey Teak", color: "bg-amber-600", border: "border-amber-500" },
    { id: "walnut", name: "Warm Walnut Satin", color: "bg-amber-900", border: "border-amber-800" },
    { id: "espresso", name: "Deep Dark Espresso", color: "bg-stone-900", border: "border-stone-800" },
  ];

  const handleFinishChange = (productId, finish) => {
    setSelectedFinishes((prev) => ({ ...prev, [productId]: finish }));
  };

  const getWhatsAppLink = (product) => {
    const finish = selectedFinishes[product.id] || product.finishType || "Natural Honey Teak";
    const message = `*Aameena Furniture Inquiry - Solapur Store*\n\n` +
      `Hello AMEENA Distributors’s Sofa Set Furniture Company,\n` +
      `I am interested in direct inquiry for:\n` +
      `• *Product:* ${product.title}\n` +
      `• *Product ID:* ${product.id}\n` +
      `• *Material / Timber:* ${product.woodType}\n` +
      `• *Finish:* ${finish}\n` +
      `• *Listed Price:* ₹${product.price?.toLocaleString("en-IN")}\n` +
      `• *Dimensions:* ${product.dimensions || "Standard"}\n\n` +
      `Please let me know availability, manufacturing lead time, and delivery to my location.`;

    return `https://wa.me/919876500001?text=${encodeURIComponent(message)}`;
  };

  const openDetailsModal = (product) => {
    setDetailsModalProduct(product);
    setActiveImageIndex(0);
  };

  const filteredProducts = products.filter((p) => {
    // Only show unarchived products on customer storefront
    if (p.isArchived) return false;

    const catSlug = p.Category?.slug || "general";
    const matchesCategory = selectedCategory === "all" || catSlug === selectedCategory;
    const matchesMaterial =
      selectedMaterial === "all" ||
      (p.woodType && p.woodType.toLowerCase().includes(selectedMaterial.toLowerCase()));
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.woodType && p.woodType.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesMaterial && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>AMEENA Distributors’s Sofa Set Furniture Company • Solapur</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Handcrafted Solid Wood Furniture</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
          Artisanal heirloom pieces crafted from seasoned Grade-A Sagwan Teak, Indian Sheesham, and Rosewood.
          Built in Solapur with traditional mortise-and-tenon joinery and finished with hand-rubbed PU polishes.
        </p>

        {/* Live Search */}
        <div className="pt-4 max-w-xl relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Search sofas, beds, dining tables, teak desks, loose cloth..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* FACTORY LOOSE CLOTH & SOFA MATERIAL NOTIFICATION BANNER */}
      <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <span className="p-2.5 bg-amber-900 text-amber-100 rounded-xl shrink-0 font-serif font-bold text-xs">
            FACTORY STOCK
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-serif">
              Raw Loose Cloth for Furniture & Sofa Materials Available in Factory
            </h4>
            <p className="text-xs text-slate-600">
              We stock hundreds of meters of velvet, Turkish jacquard, chenille, and foam materials directly at our Solapur plant. Available by the meter or for custom re-upholstery.
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedCategory("fabrics")}
          className="shrink-0 px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-colors whitespace-nowrap"
        >
          View Loose Fabrics
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Collections" },
            { id: "living", label: "Living Room" },
            { id: "bedroom", label: "Bedroom" },
            { id: "dining", label: "Dining Suite" },
            { id: "office", label: "Office & Study" },
            { id: "fabrics", label: "Loose Cloth & Sofa Fabrics" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-900 text-amber-50 shadow-md scale-102"
                  : "bg-amber-50 text-slate-700 hover:bg-amber-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Material Dropdown */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-800" /> Wood / Material:
          </span>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Specs</option>
            <option value="teak">Grade-A Sagwan Teak</option>
            <option value="sheesham">Indian Sheesham</option>
            <option value="rosewood">Indian Rosewood</option>
            <option value="mahogany">African Mahogany</option>
            <option value="velvet">Loose Velvet Cloth</option>
            <option value="jacquard">Turkish Jacquard</option>
            <option value="chenille">Chenille Fabric</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4">
          <p className="text-slate-600 text-lg font-medium">No furniture items matched your current filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedMaterial("all");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-full bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const currentFinish = selectedFinishes[product.id] || product.finishType || "Natural Honey Teak";
            const inStock = product.stock > 0;
            const images = product.images && product.images.length > 0 ? product.images : [
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
            ];
            const primaryImg = images[0];

            // Manager / Admin decisions:
            const showInquiry = product.showInquiryBtn !== false;
            const showDetails = product.showDetailsBtn !== false;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Tag with Photo Count Badge */}
                  <div className="relative h-64 overflow-hidden bg-amber-50">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <img
                        src={primaryImg}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="absolute top-4 left-4 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md pointer-events-none">
                      {product.woodType}
                    </div>

                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                        1 of {images.length} photos
                      </div>
                    )}

                    {/* Share Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSharingProduct(product);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 border border-slate-200"
                      title="Share product"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-900" />
                    </button>

                    <div className="absolute bottom-3 left-4 pointer-events-none">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm ${
                          inStock
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700/60"
                            : "bg-amber-950/90 text-amber-300 border border-amber-700/60"
                        }`}
                      >
                        {inStock ? "Ready in Solapur" : "Custom Built to Order"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="capitalize font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                        {product.Category?.name || "Collection"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>5.0 (Artisan Verified)</span>
                      </div>
                    </div>

                    <h3>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-lg font-bold font-serif text-slate-900 line-clamp-1 hover:text-amber-800 transition-colors block"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {product.description || "Bespoke solid wood construction, finished with eco-friendly polishes."}
                    </p>

                    {/* Finish Swatch Selector */}
                    <div className="pt-2 border-t border-amber-100 space-y-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Select Wood Finish: <span className="text-amber-900 font-bold">{currentFinish}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {FINISH_OPTIONS.map((finish) => {
                          const isSelected = currentFinish === finish.name;
                          return (
                            <button
                              key={finish.id}
                              onClick={() => handleFinishChange(product.id, finish.name)}
                              className={`w-6 h-6 rounded-full ${finish.color} border-2 transition-all ${
                                isSelected ? "ring-2 ring-amber-600 scale-110" : "opacity-75 hover:opacity-100"
                              }`}
                              title={finish.name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{product.price?.toLocaleString("en-IN")}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{product.compareAtPrice?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 🎯 ACTION BUTTONS WITH DIRECT PAGE LINK AND INQUIRY             */}
                {/* ============================================================== */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Button 1: See Details -> Navigates to Separate Page */}
                    {showDetails && (
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-800" />
                        <span>See Details</span>
                      </Link>
                    )}

                    {/* Button 2: Direct WhatsApp Inquiry */}
                    {showInquiry && (
                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                          !showDetails ? "sm:col-span-2 py-3" : ""
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Direct Inquiry</span>
                      </a>
                    )}
                  </div>

                  {/* Quick Share Link */}
                  <button
                    type="button"
                    onClick={() => setSharingProduct(product)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 border border-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3 h-3 text-amber-700" />
                    <span>Share Piece</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 PRODUCT DETAILS MODAL (Shows 1-3 Images Gallery & Full Specs) */}
      {/* ============================================================== */}
      {detailsModalProduct && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailsModalProduct(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl border border-amber-200 my-auto transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-amber-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    Solapur Heritage Craftsmanship
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {detailsModalProduct.stock > 0 ? `${detailsModalProduct.stock} In Stock` : "Custom Order"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
                  {detailsModalProduct.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSharingProduct(detailsModalProduct)}
                  className="p-2 rounded-full hover:bg-amber-100/70 text-amber-900 transition-colors"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalProduct(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gallery (1 to 3 images) */}
            <div className="space-y-3">
              {detailsModalProduct.images && detailsModalProduct.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-amber-200">
                    <img
                      src={detailsModalProduct.images[activeImageIndex] || detailsModalProduct.images[0]}
                      alt={detailsModalProduct.title}
                      className="w-full h-full object-cover"
                    />
                    {detailsModalProduct.images.length > 1 && (
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? detailsModalProduct.images.length - 1 : prev - 1
                            )
                          }
                          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === detailsModalProduct.images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {detailsModalProduct.images.length > 1 && (
                    <div className="flex items-center gap-3">
                      {detailsModalProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx
                              ? "border-amber-900 ring-2 ring-amber-500/50 scale-105"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Timber Species</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{detailsModalProduct.woodType}</span>
                <span className="text-[10px] text-amber-800">100% Seasoned Hardwood</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Dimensions / Form</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {detailsModalProduct.dimensions || '78" W x 34" D x 32" H'}
                </span>
                <span className="text-[10px] text-slate-500">Custom sizing available</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Polish & Coating</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {detailsModalProduct.finishType || "Natural Teak Honey Polish"}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Eco-friendly PU coat</span>
              </div>
            </div>

            {/* Description & Store Location */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>{detailsModalProduct.description}</p>
              <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-950 font-semibold">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  Manufactured & Displayed at: <strong>AMEENA Distributors’s Sofa Set Furniture Company, Solapur</strong>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-100">
              <div>
                <span className="text-xs text-slate-400 block">Manufacturer Direct Price:</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{detailsModalProduct.price?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDetailsModalProduct(null)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  href={`/products/${detailsModalProduct.id}`}
                  className="px-5 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Page View</span>
                </Link>
                <a
                  href={getWhatsAppLink(detailsModalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-600/30"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Direct Inquiry via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Share Modal */}
      <ProductShareModal
        product={sharingProduct}
        isOpen={!!sharingProduct}
        onClose={() => setSharingProduct(null)}
      />
    </div>
  );
}

