"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  MessageSquare,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Home,
  Building,
  Castle,
  Layers,
  ChevronRight,
  ChevronDown,
  Phone,
  Clock,
  Award,
  Truck,
  Wrench,
  ArrowRight,
  Check,
  Crown,
  Star,
  MapPin,
} from "lucide-react";
import { getPricingData } from "@/actions/pricingActions";
import {
  DEFAULT_PACKAGE_CATEGORIES,
  TIER_SPECIFICATIONS,
} from "@/lib/pricing/pricingConstants";

export default function PricingPage() {
  const [categories, setCategories] = useState(DEFAULT_PACKAGE_CATEGORIES);
  const [selectedCatId, setSelectedCatId] = useState("2bhk");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getPricingData();
        if (res?.success && res?.data) {
          if (
            Array.isArray(res.data.packageCategories) &&
            res.data.packageCategories.length > 0
          ) {
            setCategories(res.data.packageCategories);
            if (!res.data.packageCategories.some((c) => c.id === selectedCatId)) {
              setSelectedCatId(res.data.packageCategories[0].id);
            }
          }
          setSettings(res.data.settings || {});
        }
      } catch (err) {
        console.error("Failed to load pricing data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCategory =
    categories.find((c) => c.id === selectedCatId) ||
    categories[0] ||
    DEFAULT_PACKAGE_CATEGORIES[0];

  const getCategoryIcon = (id, name = "") => {
    const lower = `${id} ${name}`.toLowerCase();
    if (lower.includes("1") || lower.includes("1bhk")) return <Home className="w-5 h-5" />;
    if (lower.includes("2") || lower.includes("2bhk")) return <Building className="w-5 h-5" />;
    if (lower.includes("3") || lower.includes("3bhk")) return <Building className="w-5 h-5" />;
    if (lower.includes("villa") || lower.includes("penthouse") || lower.includes("bungalow"))
      return <Castle className="w-5 h-5" />;
    return <Layers className="w-5 h-5" />;
  };

  const handleWhatsAppInquiry = (modelKey) => {
    const modelSpec = TIER_SPECIFICATIONS[modelKey] || {};
    const modelData = activeCategory?.models?.[modelKey] || {};
    const price = modelData.price || "Contact for Quote";

    const lines = [
      `*Namaste Aameena Furniture Solapur,*`,
      `I am inquiring about your turnkey furnishing package:`,
      `🛋️ *Package:* ${activeCategory?.name || "Complete Furnishing Package"}`,
      `⭐ *Quality Tier:* ${modelSpec.name || modelKey.toUpperCase()}`,
      `💰 *Package Price:* ${price} (All Inclusive)`,
      `🪵 *Timber / Material:* ${modelSpec.timberShort || modelSpec.timber}`,
      `🛡️ *Warranty:* ${modelSpec.warrantyShort || modelSpec.warranty}`,
      `✨ *Key Inclusions:*`,
      ...(modelSpec.inclusions || []).slice(0, 4).map((inc) => ` • ${inc}`),
      `\nPlease share the detailed room layout estimation and schedule a showroom/factory consultation in Solapur.`,
    ];

    const message = lines.join("\n");
    const url = `https://api.whatsapp.com/send?phone=918600570542&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Determine active PDF url (category specific or master)
  const activePdfUrl =
    activeCategory?.pdfUrl ||
    settings?.catalogPdfUrl ||
    "/uploads/catalogs/Aameena_Furniture_Master_Catalog.pdf";

  const activePdfName =
    activeCategory?.pdfName ||
    settings?.catalogPdfName ||
    `${activeCategory?.name?.replace(/\s+/g, "_") || "Furnishing"}_Rate_Card.pdf`;

  const tierKeys = ["budget", "simple", "premium"];



  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-500 selection:text-neutral-950 font-sans">
      {/* Background Ambience & Golden Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-600/12 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 -right-32 w-[36rem] h-[36rem] bg-amber-700/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[30rem] h-[30rem] bg-orange-600/8 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24">
        {/* ============================================================== */}
        {/* HEADER SECTION                                                */}
        {/* ============================================================== */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Direct Solapur Factory Rates • Zero Middlemen Markup</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif leading-[1.15]">
            Turnkey Furnishing{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Packages
            </span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Select your home floorplan below to view live all-inclusive factory prices across our 3 distinct craftsmanship tiers:
            <span className="text-neutral-200 font-medium"> Budget Friendly</span>,
            <span className="text-amber-400 font-semibold"> Simple (Standard)</span>, and
            <span className="text-amber-300 font-semibold"> Royal 100% Sagwan Teak</span>.
          </p>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: CATEGORY SELECTION CARDS                                */}
        {/* ============================================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 text-xs font-black flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Select Your Home Floorplan
              </span>
            </div>
            {loading && (
              <span className="text-xs text-amber-400 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing live factory rates...
              </span>
            )}
          </div>

          {/* Responsive Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              const startingPrice = cat.models?.budget?.price || "₹1,15,000";

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`group relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
                    isSelected
                      ? "bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-amber-950/40 border-amber-500/90 shadow-xl shadow-amber-500/15 ring-1 ring-amber-400/50 scale-[1.02]"
                      : "bg-neutral-900/70 hover:bg-neutral-900/90 border-neutral-800/80 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1"
                  }`}
                >
                  {/* Subtle top amber glow for active card */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500" />
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/30"
                          : "bg-neutral-800 text-amber-400 group-hover:bg-neutral-700 group-hover:text-amber-300"
                      }`}
                    >
                      {getCategoryIcon(cat.id, cat.name)}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Starts At
                      </span>
                      <span
                        className={`text-xs font-black ${
                          isSelected ? "text-amber-300" : "text-neutral-300"
                        }`}
                      >
                        {startingPrice}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-sm sm:text-base font-bold font-serif line-clamp-1 transition-colors ${
                      isSelected ? "text-white" : "text-neutral-200 group-hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                    {cat.roomSummary || cat.tag || "Whole home complete woodworking"}
                  </p>

                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        isSelected ? "text-amber-400" : "text-neutral-500 group-hover:text-neutral-400"
                      }`}
                    >
                      {isSelected ? "Active Package Selected" : "Click to View Rates"}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isSelected
                          ? "text-amber-400 translate-x-1"
                          : "text-neutral-500 group-hover:translate-x-1 group-hover:text-amber-400"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE PACKAGE SPOTLIGHT BANNER                                */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-br from-neutral-900/90 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 mb-14 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-amber-600/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Active Package</span>
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {activeCategory?.tag || "Turnkey Woodworking Solution"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                {activeCategory?.name}
              </h2>

              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                {activeCategory?.description ||
                  "Complete turnkey furniture suite engineered and manufactured directly at our Solapur facility."}
              </p>

              <div className="flex items-center gap-4 text-xs text-neutral-300 pt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Factory Manufacturing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Solapur Doorstep Installation</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Customizable Dimensions & Finishes</span>
                </span>
              </div>
            </div>

            {/* Direct Actions Hub */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={activePdfUrl}
                download={activePdfName}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-300" />
                <span>Download Rate Card (PDF)</span>
                {activeCategory?.fileSize && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-950/20 text-neutral-900">
                    {activeCategory.fileSize}
                  </span>
                )}
              </a>

              <a
                href="tel:+918669233747"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white text-sm font-bold border border-neutral-700/80 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Factory: +91 86692 33747</span>
              </a>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 2: THE 3 PRICING TIERS CARDS (CORE ATTRACTION)             */}
        {/* ============================================================== */}
        <div className="mb-20">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 2: Compare Our 3 Craftsmanship Tiers</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              Select Your Craftsmanship & Finish
            </h3>
            <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
              Transparent, factory-direct pricing for{" "}
              <strong className="text-amber-300 font-semibold">{activeCategory?.name}</strong>.
              All specifications below are fully comprehensive with zero hidden charges.
            </p>
          </div>

          {/* The 3 Symmetrical Cards Grid with Attractive Hover Effects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
            {tierKeys.map((key) => {
              const spec = TIER_SPECIFICATIONS[key];
              const categoryModel = activeCategory?.models?.[key] || {};
              const price = categoryModel.price || "₹1,50,000";
              const isPopular = key === "simple";
              const isTeak = key === "premium";

              return (
                <div
                  key={key}
                  className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-500 ease-out cursor-default ${
                    isPopular
                      ? "bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-amber-950/30 border-2 border-amber-500/90 shadow-2xl shadow-amber-500/15 lg:-translate-y-3 hover:-translate-y-5 hover:shadow-[0_25px_60px_-10px_rgba(245,158,11,0.25)] hover:border-amber-400"
                      : isTeak
                      ? "bg-gradient-to-b from-neutral-900/95 via-neutral-900/90 to-amber-950/20 border border-amber-500/50 shadow-xl shadow-amber-600/10 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(217,119,6,0.22)] hover:border-amber-400"
                      : "bg-neutral-900/70 border border-neutral-800/90 hover:border-amber-500/50 shadow-lg hover:-translate-y-3 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.12)]"
                  }`}
                >
                  {/* Subtle Inner Glow on Hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/6 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top Floating Ribbons */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 whitespace-nowrap z-20">
                      <Star className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Most Popular • Best Value</span>
                    </div>
                  )}

                  {isTeak && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-600/30 flex items-center gap-1.5 whitespace-nowrap z-20">
                      <Crown className="w-3.5 h-3.5 fill-amber-200" />
                      <span>100% Solid Sagwan Teak</span>
                    </div>
                  )}

                  {/* Card Header & Price */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg ${
                          isPopular
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : isTeak
                            ? "bg-amber-600/20 text-amber-300 border border-amber-600/40"
                            : "bg-neutral-800/90 text-neutral-400 border border-neutral-700/80"
                        }`}
                      >
                        {spec.badge}
                      </span>

                      <span className="text-[10px] uppercase font-bold text-neutral-500">
                        {isTeak ? "Heirloom Class" : isPopular ? "Executive Tier" : "Smart Value"}
                      </span>
                    </div>

                    <h4 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                      {spec.name}
                    </h4>

                    <p className="text-xs text-neutral-400 mt-1.5 mb-6 min-h-[36px] leading-relaxed">
                      {spec.subtitle}
                    </p>

                    {/* Price Card Box */}
                    <div
                      className={`p-5 rounded-2xl border transition-all duration-300 mb-6 ${
                        isPopular
                          ? "bg-neutral-950/90 border-amber-500/40 group-hover:border-amber-400/70"
                          : isTeak
                          ? "bg-neutral-950/90 border-amber-600/30 group-hover:border-amber-500/60"
                          : "bg-neutral-950/80 border-neutral-800/80 group-hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs uppercase font-bold tracking-wider text-neutral-400">
                        <span>Turnkey Package Price</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          All Inclusive
                        </span>
                      </div>

                      <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-serif tracking-tight flex items-baseline gap-2">
                        <span>{price}</span>
                        <span className="text-xs font-normal text-neutral-400">
                          / Complete Home
                        </span>
                      </div>

                      <div className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1.5 font-medium">
                        <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Free Solapur Factory Delivery & Installation</span>
                      </div>
                    </div>

                    {/* Architectural Specifications Grid (2x2 Matrix) */}
                    <div className="mb-6 space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                        Core Material & Build Specifications:
                      </span>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Timber */}
                        <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">
                            🪵 Timber Core
                          </span>
                          <span className="text-[11px] font-bold text-neutral-200 mt-1 leading-snug line-clamp-2">
                            {spec.timberShort || spec.timber}
                          </span>
                        </div>

                        {/* Finish */}
                        <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">
                            🎨 Finish & Polish
                          </span>
                          <span className="text-[11px] font-bold text-neutral-200 mt-1 leading-snug line-clamp-2">
                            {spec.finishShort || spec.finish}
                          </span>
                        </div>

                        {/* Hardware */}
                        <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">
                            ⚙️ Hardware
                          </span>
                          <span className="text-[11px] font-bold text-neutral-200 mt-1 leading-snug line-clamp-2">
                            {spec.hardwareShort || spec.hardware}
                          </span>
                        </div>

                        {/* Warranty */}
                        <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-emerald-400 block">
                            🛡️ Warranty
                          </span>
                          <span className="text-[11px] font-bold text-emerald-300 mt-1 leading-snug line-clamp-2">
                            {spec.warrantyShort || spec.warranty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inclusions Checklist */}
                    <div className="pb-6 border-b border-neutral-800/80">
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Included in {activeCategory?.name}:</span>
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {spec.inclusions.length} Elements
                        </span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-neutral-300">
                        {spec.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            <span className="leading-relaxed">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* WhatsApp CTA Action (Symmetrically Positioned at Bottom) */}
                  <div className="pt-6 space-y-2">
                    <button
                      onClick={() => handleWhatsAppInquiry(key)}
                      className={`group/btn relative w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                        isPopular
                          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02]"
                          : isTeak
                          ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-black shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40 hover:scale-[1.02]"
                          : "bg-neutral-800 hover:bg-emerald-600 text-white border border-neutral-700/80 hover:border-emerald-500 shadow-md hover:shadow-emerald-600/25 hover:scale-[1.02]"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-950 shrink-0 group-hover/btn:scale-110 transition-transform duration-300" />
                      <span>Connect with Owner on WhatsApp</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 duration-300" />
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 pt-1">
                      <span>✓ Direct Factory Consultation</span>
                      <span>✓ Instant Response</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle Button for Side-by-Side Comparison Matrix */}
          <div className="text-center mt-10">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white border border-neutral-800 hover:border-amber-500/40 transition-all duration-300 cursor-pointer"
            >
              <span>{showComparison ? "Hide Detailed Comparison Table" : "Compare All 3 Tiers Side-by-Side"}</span>
              <ChevronDown
                className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${
                  showComparison ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Collapsible Comparison Table */}
          {showComparison && (
            <div className="mt-8 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 overflow-x-auto shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h4 className="text-lg font-bold text-white font-serif mb-4">
                Detailed Craftsmanship Matrix Comparison
              </h4>
              <table className="w-full text-xs text-left text-neutral-300 border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Feature / Specification</th>
                    <th className="py-3 px-4 font-bold text-neutral-200">Budget Friendly</th>
                    <th className="py-3 px-4 font-bold text-amber-400">Simple (Standard)</th>
                    <th className="py-3 px-4 font-bold text-amber-300">Premium (Royal Teak)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Core Wood Structure</td>
                    <td className="py-3.5 px-4">Commercial MR Grade Plywood</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-300">100% BWP Marine Grade 710</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-400">100% Certified CP Sagwan Teak</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Moisture & Water Proofing</td>
                    <td className="py-3.5 px-4">Moisture Resistant (MR)</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">100% Boiling Water Proof (710)</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">Naturally Water & Weather Resistant</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Polish / Surface Finish</td>
                    <td className="py-3.5 px-4">1.0mm Anti-Scratch Laminate</td>
                    <td className="py-3.5 px-4">High-Gloss Acrylic / PU Veneer</td>
                    <td className="py-3.5 px-4">Hand-Rubbed 7-Layer Italian PU</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Fittings & Hinges Brand</td>
                    <td className="py-3.5 px-4">Standard Soft-Close Channels</td>
                    <td className="py-3.5 px-4">Branded Ebco / Hettich Soft-Close</td>
                    <td className="py-3.5 px-4">German Blum / Hafele Concealed</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Structural Warranty</td>
                    <td className="py-3.5 px-4 font-bold">5-Year Warranty</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">10-Year Anti-Borer Warranty</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">Lifetime Sagwan Purity Guarantee</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Customization Flexibility</td>
                    <td className="py-3.5 px-4">Dimension & Laminate Options</td>
                    <td className="py-3.5 px-4">Full 3D Design + Fabric Selection</td>
                    <td className="py-3.5 px-4">Unlimited Bespoke Carving & Fabrics</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-neutral-400">Solapur Delivery & Setup</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">100% Free Doorstep Setup</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">100% Free Doorstep Setup</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">VIP White-Glove Setup</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* WHY SOLAPUR HOMEOWNERS CHOOSE AAMEENA FURNITURE                 */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-br from-neutral-900/80 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-10 mb-16 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Manufacturer Transparency
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif mt-1">
              Why Solapur Homeowners Trust Aameena Furniture
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Decades of master woodworking in Solapur, Maharashtra with zero showroom retail markups and 100% wood purity certification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-white">Genuine Teak Guarantee</h5>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                100% Certified Central Province (CP) Sagwan Teak stamped with wood purity certificate.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-white">Zero Delivery Charge</h5>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Completely free doorstep transportation across Solapur municipal city and surrounding areas.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                <Wrench className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-white">White-Glove Assembly</h5>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Assembled directly by senior factory carpenters with protective floor padding.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-white">15-Year Service Support</h5>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Dedicated local carpenter visits for hardware adjustments, polishing, and maintenance.
              </p>
            </div>
          </div>
        </div>



        {/* ============================================================== */}
        {/* MASTER CATALOG & SHOWROOM VISIT BANNER                         */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Visit Our Solapur Factory & Showroom
            </h3>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Experience the wood grains, sit on our custom sofas, and inspect our timber seasoning firsthand.
              We welcome you to visit us at Solapur, Maharashtra.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://api.whatsapp.com/send?phone=918600570542&text=Hello%20Aameena%20Furniture,%20I%20would%20like%20to%20schedule%20a%20factory%20visit%20at%20Solapur."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-950" />
                <span>Schedule Free Factory Visit on WhatsApp (+91 86005 70542)</span>
              </a>

              {settings?.catalogPdfUrl && (
                <a
                  href={settings.catalogPdfUrl}
                  download={settings.catalogPdfName || "Aameena_Master_Catalog.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs border border-neutral-700 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Download Master Catalog PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
