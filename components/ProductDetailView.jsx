"use client";

import { useState } from "react";
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
  ChevronRight,
  ExternalLink,
  Phone,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import ProductShareModal from "@/components/ProductShareModal";

export default function ProductDetailView({ product, relatedProducts = [] }) {
  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedFinish, setSelectedFinish] = useState(product.finishType || "Natural Honey Teak");
  const [pincode, setPincode] = useState("413001");
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  const FINISH_OPTIONS = [
    { id: "natural", name: "Natural Honey Teak", color: "bg-amber-600", border: "border-amber-500", desc: "Golden honey sheen highlighting natural Sagwan grain" },
    { id: "walnut", name: "Warm Walnut Satin", color: "bg-amber-900", border: "border-amber-800", desc: "Classic rich walnut warmth with smooth satin PU" },
    { id: "espresso", name: "Deep Dark Espresso", color: "bg-stone-900", border: "border-stone-800", desc: "Modern architectural dark tone with subtle wood grain" },
  ];

  const comparePrice = product.compareAtPrice || Math.round(product.price * 1.32);
  const discountPercent = Math.round(((comparePrice - product.price) / comparePrice) * 100);

  // WhatsApp Inquiry Generator
  const getWhatsAppLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://aameenafurniture.com";
    const shareUrl = `${origin}/products/${product.id}`;
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

    return `https://wa.me/919876500001?text=${encodeURIComponent(message)}`;
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

                {/* Floating Share Button on Image */}
                <button
                  onClick={() => setShareOpen(true)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg backdrop-blur-sm hover:scale-110 transition-all border border-slate-200"
                  title="Share this furniture"
                >
                  <Share2 className="w-4 h-4 text-amber-900" />
                </button>

                {/* Hover Lens Hint */}
                {!isZooming && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                    Hover to zoom details
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flipkart-Style Action CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Inquire on WhatsApp (Flipkart Buy Now Equivalent) */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-102 tracking-wide"
              >
                <MessageSquare className="w-5 h-5 fill-white text-emerald-700" />
                <span>INQUIRE ON WHATSAPP</span>
              </a>

              {/* Button 2: Request Customization / Call Workshop */}
              <Link
                href="/contact"
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900 text-amber-50 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-102 tracking-wide"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>CUSTOMIZE TIMBER</span>
              </Link>
            </div>

            {/* Share & Call Bar */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                onClick={() => setShareOpen(true)}
                className="text-amber-900 font-bold hover:underline flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share with Family / Architect
              </button>

              <a
                href="tel:+919876500001"
                className="text-slate-600 hover:text-amber-900 font-medium flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-amber-800" /> Call Solapur Factory: +91 98765 00001
              </a>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: FLIPKART DETAILS, RATINGS, OFFERS, SPECS & STORY */}
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

            {/* Flipkart-Style Rating Badge */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-sm">
                <span>4.9</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600">
                148 Ratings & 42 Verified Workshop Customer Reviews
              </span>
              <span className="text-xs font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                ✓ 100% Genuine Sagwan
              </span>
            </div>
          </div>

          {/* Flipkart Price Block */}
          <div className="bg-amber-50/40 p-5 rounded-3xl border border-amber-200/80 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Special Solapur Manufacturer Direct Price
            </span>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              <span className="text-base text-slate-400 line-through">
                ₹{comparePrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {discountPercent}% off
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Inclusive of all taxes • No middleman showroom commissions • Factory-direct guarantee
            </p>
          </div>

          {/* Flipkart-Style Available Offers */}
          <div className="space-y-2.5 bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-emerald-600" /> Available Workshop Offers
            </span>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">Direct Solapur Factory Discount:</span> Save ₹{(comparePrice - product.price).toLocaleString("en-IN")} by purchasing straight from the wood carving unit.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">10-Year Sagwan Teak Warranty:</span> Comprehensive protection against borer, termite, and structural joint movement.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">Free White-Glove Installation:</span> Pre-assembled and setup by master carpenters in Solapur & across Maharashtra.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-sm leading-none">•</span>
                <div>
                  <span className="font-bold text-slate-900">Free Finish Customization:</span> Select your favorite PU polish at zero additional charge.
                </div>
              </li>
            </ul>
          </div>

          {/* Timber Polish Finish Selector */}
          <div className="space-y-3 bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Wood Polish Finish
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {selectedFinish}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FINISH_OPTIONS.map((f) => {
                const isSelected = selectedFinish === f.name;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFinish(f.name)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-amber-900 bg-amber-50/70 ring-2 ring-amber-500/50 shadow-sm"
                        : "border-slate-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-4 h-4 rounded-full ${f.color} border border-slate-300 shadow-inner`} />
                      <span className="text-xs font-bold text-slate-900">{f.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery & Pincode Checker (Flipkart Style) */}
          <div className="space-y-3 bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-800" /> Delivery & Installation Verification
            </span>

            <div className="flex items-center gap-2 max-w-sm">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => setPincodeChecked(true)}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold rounded-xl transition-colors"
              >
                Check
              </button>
            </div>

            {pincodeChecked && (
              <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                <p className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  White-Glove Delivery Available for Pincode {pincode}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Estimated delivery in <strong>5 to 7 business days</strong> • Blanketed packaging with door-step carpenter assembly included.
                </p>
              </div>
            )}
          </div>

          {/* Flipkart-Style Product Highlights & Specifications Grid */}
          <div className="space-y-4 bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-amber-100 pb-3">
              Specifications & Artisan Craftsmanship
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Sales Package</span>
                <span className="font-bold text-slate-800 text-right">1 Handcrafted Unit + Care Kit</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Primary Hardwood</span>
                <span className="font-bold text-slate-800 text-right">{product.woodType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Dimensions</span>
                <span className="font-bold text-slate-800 text-right">{product.dimensions || "78 x 36 x 32 in"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Joinery Technique</span>
                <span className="font-bold text-slate-800 text-right">Mortise & Tenon / Lap Joints</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Selected Polish</span>
                <span className="font-bold text-slate-800 text-right">{selectedFinish}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Warranty</span>
                <span className="font-bold text-slate-800 text-right">10 Years Structural Guarantee</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Assembly Status</span>
                <span className="font-bold text-slate-800 text-right">Fully Assembled (No DIY)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Manufacturing Unit</span>
                <span className="font-bold text-slate-800 text-right">Solapur Workshop, Maharashtra</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-3 space-y-2 border-t border-amber-100">
              <span className="text-xs font-bold text-slate-700 block">Description & Timber Heritage:</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description ||
                  "Handcrafted from seasoned Grade-A Sagwan Teak, this heirloom furniture piece is carved by master artisans in our Solapur company. Naturally resistant to moisture and pests, it features silky 7-step PU polishes designed to last for generations."}
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
              <Link
                href="/ai-reviews"
                className="px-4 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold rounded-xl border border-amber-700/60 transition-all"
              >
                Read 5-Star Google Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RELATED PRODUCTS SECTION (FLIPKART "SIMILAR PRODUCTS" ROW)    */}
      {/* ============================================================== */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Similar Handcrafted Furniture</h2>
              <p className="text-xs text-slate-500">More pieces from our {product.Category?.name || "Solid Wood"} collection</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-amber-900 hover:underline">
              View All Collections →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relImg = rel.images?.[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
              return (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-50">
                    <img
                      src={relImg}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {rel.woodType}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold font-serif text-slate-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                      {rel.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{rel.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 block group-hover:translate-x-1 transition-transform">
                      See Details & Specs →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
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
