"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Share2,
  CheckCircle2,
  MapPin,
  Clock,
  Ruler,
  Tag,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Phone,
  MessageSquare,
  HelpCircle,
  Eye,
  Layers,
  Award,
  ShoppingCart,
  ShoppingBag,
  Heart,
} from "lucide-react";
import ProductShareModal from "@/components/ProductShareModal";
import ProductReviewsSection from "@/components/ProductReviewsSection";
import { getProductRatingScore } from "@/utils/productRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailView({ product, relatedProducts = [] }) {
  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedFinish, setSelectedFinish] = useState(product.finishType || "Natural Honey Teak");
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inCart = mounted && isInCart(product.id);
  const inWishlist = mounted && isInWishlist(product.id);
  const [pincode, setPincode] = useState("413001");
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isFabric =
    product.Category?.slug === "fabrics" ||
    product.Category?.name?.toLowerCase().includes("cloth") ||
    /cotton|chenille|velvet|jacquard|fabric|cloth|linen/i.test(product.woodType || "") ||
    /cloth|fabric|velvet|cotton|jacquard/i.test(product.title || "");

  const purityBadgeText =
    product.materialPurity && product.materialPurity.trim()
      ? product.materialPurity.trim()
      : "Authentic Craftsmanship";

  const FINISH_OPTIONS = [
    { id: "natural", name: "Natural Honey Teak", color: "bg-amber-600", border: "border-amber-500", desc: `Golden honey sheen highlighting natural ${product.woodType || "timber"} grain` },
    { id: "walnut", name: "Warm Walnut Satin", color: "bg-amber-900", border: "border-amber-800", desc: "Classic rich walnut warmth with smooth satin PU" },
    { id: "espresso", name: "Deep Dark Espresso", color: "bg-stone-900", border: "border-stone-800", desc: "Modern architectural dark tone with subtle wood grain" },
  ];

  const FABRIC_FINISH_OPTIONS = [
    { id: "natural-weave", name: "Natural Soft Matte Weave", color: "bg-amber-100", border: "border-amber-300", desc: "Breathable natural yarn feel, soft on skin" },
    { id: "royal-velvet", name: "Water-Repellent Velvet Sheen", color: "bg-amber-700", border: "border-amber-600", desc: "Royal soft-touch finish with hydrophobic coating" },
    { id: "textured-jacquard", name: "Heritage Woven Texture", color: "bg-stone-800", border: "border-stone-700", desc: "Heavy Martindale rub count for intense daily usage" },
  ];

  const finishList = isFabric ? FABRIC_FINISH_OPTIONS : FINISH_OPTIONS;

  const comparePrice = product.compareAtPrice || Math.round(product.price * 1.32);
  const discountPercent = Math.round(((comparePrice - product.price) / comparePrice) * 100);

  const getShareUrl = () => {
    const identifier = product.slug || product.id;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${identifier}`;
    }
    return `https://aameenafurniture.com/products/${identifier}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  // WhatsApp Inquiry Generator
  const getWhatsAppLink = () => {
    const shareUrl = getShareUrl();
    const message =
      `*Aameena Furniture - Direct Factory Inquiry*\n\n` +
      `Hello AMEENA Distributors’s Sofa Set Furniture Company (Solapur),\n` +
      `I want to inquire about purchasing:\n` +
      `• *Product:* ${product.title}\n` +
      `• *Product ID:* ${product.id}\n` +
      `• *Timber:* ${product.woodType}\n` +
      `• *Selected Finish:* ${selectedFinish}\n` +
      `• *Factory Price:* ₹${product.price?.toLocaleString("en-IN")}\n` +
      `• *Dimensions:* ${product.dimensions || "Standard"}\n` +
      `• *Product Link:* ${shareUrl}\n\n` +
      `Please confirm stock availability, delivery schedule for Pincode ${pincode}, and payment/workshop inspection details.`;

    return `https://api.whatsapp.com/send?phone=919730392917&text=${encodeURIComponent(message)}`;
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.8)",
    });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transform: "scale(1)" });
  };

  return (
    <div className="space-y-12">
      {/* Flipkart-Style Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-2">
        <Link href="/" className="hover:text-amber-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <Link href="/products" className="hover:text-amber-900 transition-colors">Furniture Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <Link href={`/products?category=${product.Category?.slug || "all"}`} className="hover:text-amber-900 transition-colors capitalize">
          {product.Category?.name || "Solid Wood"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Flipkart-Style 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: FLIPKART THUMBNAIL RAIL + ZOOM IMAGE + ACTION BTNS */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Vertical Thumbnail Rail (Left on desktop/tablet) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] shrink-0 py-1">
                {images.map((img, idx) => {
                  const isSelected = activeImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      onMouseEnter={() => setActiveImage(img)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                        isSelected
                          ? "border-amber-900 shadow-md ring-2 ring-amber-500/40 scale-102"
                          : "border-slate-200 hover:border-amber-400 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-900/10 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main High-Resolution Preview Image with Hover-Zoom */}
            <div className="relative flex-1 bg-white rounded-3xl border border-amber-200/80 p-3 shadow-md overflow-hidden">
              <div
                className="relative h-[380px] sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-crosshair bg-slate-50 flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={activeImage}
                  alt={product.title}
                  style={zoomStyle}
                  className="w-full h-full object-cover transition-transform duration-150 ease-out"
                />

                {/* Badges on Main Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                  <span className="bg-amber-950/90 text-amber-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                    {product.woodType}
                  </span>
                  <span className="bg-emerald-950/90 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md border border-emerald-700/60">
                    {product.stock > 0 ? "Ready in Solapur" : "Handcrafted to Order"}
                  </span>
                </div>

                {/* Floating Action Buttons on Image */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm hover:scale-110 transition-all border cursor-pointer ${
                      inWishlist
                        ? "bg-rose-50 text-rose-600 border-rose-300"
                        : "bg-white/90 hover:bg-white text-slate-700 border-slate-200"
                    }`}
                    title={inWishlist ? "Saved in your Wishlist" : "Save to Wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-slate-600"}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg backdrop-blur-sm hover:scale-110 transition-all border border-slate-200 cursor-pointer"
                    title="Share this furniture"
                  >
                    <Share2 className="w-4 h-4 text-amber-900" />
                  </button>
                </div>

                {/* Hover Lens Hint */}
                {!isZooming && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                    Hover to zoom details
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Add to Cart / View in Cart */}
              {inCart ? (
                <Link
                  href="/cart"
                  suppressHydrationWarning
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-102 tracking-wide text-center border border-amber-800"
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span>VIEW IN CART →</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product, { finishType: selectedFinish })}
                  suppressHydrationWarning
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-102 tracking-wide cursor-pointer text-center"
                >
                  <ShoppingCart className="w-5 h-5 text-slate-950" />
                  <span>ADD TO CART</span>
                </button>
              )}

              {/* Button 2: Direct Inquiry on WhatsApp */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 hover:from-amber-800 hover:to-amber-900 text-amber-50 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-102 tracking-wide cursor-pointer border border-amber-700/60"
              >
                <MessageSquare className="w-5 h-5 text-amber-300" />
                <span>DIRECT INQUIRY</span>
              </a>
            </div>

            {/* Button 3: Request Customization */}
            <Link
              href="/contact"
              className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs hover:scale-101"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Request Custom Dimensions or Timber Adaptation</span>
            </Link>

            {/* Share, Wishlist & Call Bar */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 px-1 gap-2">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`font-bold hover:underline flex items-center gap-1.5 cursor-pointer ${
                    inWishlist ? "text-rose-600" : "text-amber-900"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="text-amber-900 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Piece</span>
                </button>
              </div>

              <a
                href="tel:+918669233747"
                className="text-slate-600 hover:text-amber-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                <span>Call Factory: +91 86692 33747</span>
              </a>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: DETAILS, OFFERS, SPECS & STORY                   */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-amber-100 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                {product.Category?.name || "Artisanal Collection"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Solapur Factory Direct
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating Badge (Clickable to jump to reviews section) */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <a
                href="#product-reviews-section"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>{getProductRatingScore(product)}</span>
                <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              </a>
              <a
                href="#product-reviews-section"
                className="text-xs font-semibold text-slate-600 hover:text-amber-900 underline"
              >
                View Customer Reviews & Ratings ↓
              </a>
              <span className="text-xs font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                ✓ {purityBadgeText}
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-amber-50/40 p-5 rounded-3xl border border-amber-200/80 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded">
              Special Solapur Manufacturer Direct Price
            </span>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              <span className="text-base text-slate-400 line-through">
                ₹{comparePrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-bold text-amber-800">
                {discountPercent}% off
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Inclusive of all taxes • No middleman showroom commissions • Factory-direct guarantee
            </p>
          </div>

          {/* Available Offers */}
          <div className="space-y-2.5 bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-amber-700" /> Available Workshop Offers
            </span>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">Direct Solapur Factory Discount:</span> Save ₹{(comparePrice - product.price).toLocaleString("en-IN")} by purchasing straight from the wood carving unit.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">
                    {isFabric ? "10-Year Fabric Durability Guarantee:" : `10-Year ${product.woodType || "Timber"} Structural Warranty:`}
                  </span>{" "}
                  {isFabric
                    ? "Comprehensive protection against fabric tearing, thread pilling, and premature color loss."
                    : "Comprehensive protection against borer, termite, and structural joint movement."}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">Free White-Glove Installation:</span> Pre-assembled and setup by master carpenters in Solapur & across Maharashtra.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">
                    {isFabric ? "Free Fabric Swatch Inspection:" : "Free Finish Customization:"}
                  </span>{" "}
                  {isFabric
                    ? "Inspect touch, GSM thickness, and weave directly at our Solapur plant before shipping."
                    : "Select your favorite PU polish at zero additional charge."}
                </div>
              </li>
            </ul>
          </div>

          {/* Timber Polish / Fabric Finish Selector */}
          <div className="space-y-3 bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isFabric ? "Select Fabric Weave / Shade" : "Select Wood Polish Finish"}
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {selectedFinish}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {finishList.map((f) => {
                const isSelected = selectedFinish === f.name;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFinish(f.name)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-900 bg-amber-50/50 shadow-md ring-1 ring-amber-500/30"
                        : "border-slate-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3.5 h-3.5 rounded-full ${f.color} border ${f.border}`} />
                      <span className="text-xs font-bold text-slate-900">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-2">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3 bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Artisanal Craftsmanship Specifications
            </span>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{isFabric ? "Material / Fabric Species" : "Timber Species"}</span>
                <span className="font-bold text-slate-800 text-right">{product.woodType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Material Purity & Authenticity</span>
                <span className="font-bold text-emerald-800 text-right">✓ {purityBadgeText}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Dimensions</span>
                <span className="font-bold text-slate-800 text-right">{product.dimensions || (isFabric ? "Width: 54 in (Sold Per Meter)" : "Custom Built / As Per Room Plan")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{isFabric ? "Weave Technique" : "Joinery Technique"}</span>
                <span className="font-bold text-slate-800 text-right">{isFabric ? "High Martindale Rub Count / Heavy GSM" : "Mortise & Tenon / Lap Joints"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{isFabric ? "Selected Weave Shade" : "Selected Polish"}</span>
                <span className="font-bold text-slate-800 text-right">{selectedFinish}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Warranty</span>
                <span className="font-bold text-slate-800 text-right">{isFabric ? "10-Year Fabric Durability Guarantee" : "10 Years Structural Guarantee"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{isFabric ? "Supply Form" : "Assembly Status"}</span>
                <span className="font-bold text-slate-800 text-right">{isFabric ? "Factory Roll / Cut-to-length" : "Fully Assembled (No DIY)"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Manufacturing Unit</span>
                <span className="font-bold text-slate-800 text-right">Solapur Workshop, Maharashtra</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-3 space-y-2 border-t border-amber-100">
              <span className="text-xs font-bold text-slate-700 block">
                {isFabric ? "Description & Textile Heritage:" : "Description & Timber Heritage:"}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description ||
                  (isFabric
                    ? "Premium raw loose furniture fabric stored in rolls directly at our Solapur manufacturing facility. High Martindale rub count engineered for longevity and luxurious sofa upholstery."
                    : `Handcrafted from seasoned ${product.woodType || "Grade-A Solid Timber"}, this heirloom furniture piece is carved by master artisans in our Solapur company. Naturally resistant to moisture and pests, it features silky 7-step PU polishes designed to last for generations.`)}
              </p>
            </div>
          </div>

          {/* Solapur Factory Store Information Card */}
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 p-6 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Sole Manufacturing Store Location</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-100">
              AMEENA Distributors’s Sofa Set Furniture Company
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Solapur, Maharashtra • Experience raw timber logs, witness 7-step polishing, and consult directly with our master carpenters.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href="https://www.google.com/maps/place/AMEENA+Distributors%E2%80%99s+Sofa+Set+Furniture+Company/@17.6578402,75.9362493,15z/data=!3m1!4b1!4m6!3m5!1s0x3bc5db34c23e5907:0x86af8fec8b37d0ed!8m2!3d17.6578402!4d75.9362493!16s%2Fg%2F11gypsrxj5?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on Google Maps
              </a>
              <a
                href="#product-reviews-section"
                className="px-4 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold rounded-xl border border-amber-700/60 transition-all"
              >
                Read Verified Customer Reviews
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🌟 AMAZON/FLIPKART STYLE PRODUCT REVIEWS & RATINGS SECTION     */}
      {/* ============================================================== */}
      <ProductReviewsSection product={product} />

      {/* ============================================================== */}
      {/* RELATED PRODUCTS SECTION                                       */}
      {/* ============================================================== */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-amber-200/90">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full inline-block mb-1.5">
                Handpicked Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Recommended & Similar Handcrafted Furniture
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                More artisanal pieces crafted with authentic timber and master Solapur carpentry.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 px-4 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto shrink-0"
            >
              <span>Explore Full Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relImg =
                rel.images?.[0] ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
              const relCompare =
                rel.compareAtPrice || Math.round((rel.price || 0) * 1.3);
              const relDiscount =
                relCompare > rel.price
                  ? Math.round(((relCompare - rel.price) / relCompare) * 100)
                  : 0;
              const relRating = getProductRatingScore(rel);

              return (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-50">
                    <img
                      src={relImg}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />

                    {/* Timber Badge */}
                    <div className="absolute top-3 left-3 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                      {rel.woodType || "Solid Wood"}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{relRating}</span>
                    </div>

                    {/* Category Pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold text-amber-900 bg-white/95 px-2 py-0.5 rounded-md shadow-xs border border-amber-100">
                        {rel.Category?.name || "Handcrafted"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold font-serif text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                        {rel.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {rel.description ||
                          "Handcrafted solid wood furniture direct from Solapur workshop."}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg font-black text-slate-900">
                          ₹{rel.price?.toLocaleString("en-IN")}
                        </span>
                        {relCompare > rel.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{relCompare.toLocaleString("en-IN")}
                          </span>
                        )}
                        {relDiscount > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {relDiscount}% off
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-amber-900 group-hover:text-amber-950 flex items-center justify-between pt-1">
                        <span>See Details & Specs</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Share Modal Dialog */}
      <ProductShareModal
        product={product}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
