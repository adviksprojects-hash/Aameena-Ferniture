"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Calculator,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
} from "lucide-react";
import { getPricingData } from "@/actions/pricingActions";
import SearchableSelect from "@/components/SearchableSelect";

export default function PricingPage() {
  const [bhk, setBhk] = useState("2bhk");
  const [woodType, setWoodType] = useState("teak");
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getPricingData();
      if (res.success) {
        setPackages(res.data.packages || []);
        setSettings(res.data.settings || {});
      }
      setLoading(false);
    }
    load();
  }, []);

  const basePrices = settings?.calculatorData || {
    "1bhk": { teak: 145000, sheesham: 115000, rosewood: 195000 },
    "2bhk": { teak: 235000, sheesham: 185000, rosewood: 310000 },
    "3bhk": { teak: 360000, sheesham: 285000, rosewood: 475000 },
    "villa": { teak: 580000, sheesham: 460000, rosewood: 750000 },
  };

  // If custom layout/wood, calculate reasonable estimate
  const getEstimatedTotal = () => {
    if (basePrices[bhk] && basePrices[bhk][woodType]) {
      return basePrices[bhk][woodType];
    }
    if (basePrices[bhk]) {
      return basePrices[bhk].teak || 250000;
    }
    return 320000;
  };

  const estimatedTotal = getEstimatedTotal();

  const BHK_OPTIONS = [
    { value: "1bhk", label: "1 BHK Complete Furnishing Package" },
    { value: "2bhk", label: "2 BHK Complete Furnishing Package" },
    { value: "3bhk", label: "3 BHK Complete Furnishing Package" },
    { value: "villa", label: "Independent Villa / Penthouse Project" },
  ];

  const WOOD_OPTIONS = [
    { value: "teak", label: "Grade-A Sagwan Teak Wood (10-Year Warranty)" },
    { value: "sheesham", label: "Seasoned Indian Sheesham Hardwood" },
    { value: "rosewood", label: "Royal Indian Rosewood (Shisham Sissoo)" },
  ];

  const getPackageWhatsApp = (pkg) => {
    const msg =
      `*Aameena Furniture - Pricing Package Inquiry*\n\n` +
      `Hello AMEENA Distributors’s Sofa Set Furniture Company (Solapur),\n` +
      `I am interested in your: *${pkg.name}* (${pkg.price}).\n` +
      `Description: ${pkg.description}\n\n` +
      `Please provide more details on timber certification, customization options, and delivery timeline.`;
    return `https://wa.me/919876500001?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Direct Factory Pricing</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Transparent Packages & Cost Calculator</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          Direct manufacturer pricing straight from our Solapur sawmill and artisanal carving unit. Zero showroom middlemen markups.
        </p>
      </div>

      {/* OFFICIAL PDF RATE CARD DOWNLOAD BANNER */}
      {settings?.catalogPdfUrl && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 bg-amber-900 text-amber-50 rounded-2xl shadow-md shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded">
                Official Factory Document
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 mt-1">
                {settings.catalogPdfName || "Aameena Furniture Official Rate Card & Catalog"}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Download the complete Sagwan teak rate card, dimensions guide, and bespoke wood polish spec sheet (PDF).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={settings.catalogPdfUrl}
              download={settings.catalogPdfName || "Aameena_Furniture_Rate_Card.pdf"}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>

            <a
              href={settings.catalogPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4 text-amber-900" />
              <span>Inspect Online</span>
            </a>
          </div>
        </div>
      )}

      {/* Interactive Furniture Cost Estimator with Searchable Dropdowns */}
      <div className="bg-white rounded-3xl p-8 border border-amber-200/80 shadow-md space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-900">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Instant Full-Home Furnishing Estimator</h2>
            <p className="text-xs text-slate-500">Calculate an estimated budget for your apartment, villa, or custom layout.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SearchableSelect
            label="Home Size / Layout"
            options={BHK_OPTIONS}
            value={bhk}
            onChange={(val) => setBhk(val)}
            allowOther={true}
            otherPlaceholder="Enter custom layout (e.g. 4BHK Duplex, Farmhouse)..."
          />

          <SearchableSelect
            label="Primary Hardwood Timber"
            options={WOOD_OPTIONS}
            value={woodType}
            onChange={(val) => setWoodType(val)}
            allowOther={true}
            otherPlaceholder="Enter custom timber (e.g. Burma Teak, African Oak)..."
          />
        </div>

        {/* Dynamic Estimated Output */}
        <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Estimated Direct Manufacturer Cost:
            </span>
            <span className="text-3xl font-extrabold text-amber-950 font-serif">
              ₹{estimatedTotal.toLocaleString("en-IN")}*
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              *Includes solid wood living room, bedroom & dining essentials + Solapur delivery & white-glove setup.
            </p>
          </div>

          <a
            href={`https://wa.me/919876500001?text=${encodeURIComponent(
              `Hello Aameena Furniture, I used your pricing estimator for ${bhk} in ${woodType} (Estimated ₹${estimatedTotal.toLocaleString(
                "en-IN"
              )}). I would like a detailed itemized quote.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-102"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Lock Estimate on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* DYNAMIC PACKAGES FROM DATABASE */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Artisanal Turnkey Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Pre-engineered hardwood packages designed for apartments, row houses, and luxury villas.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-xs text-slate-500">Loading live packages from workshop database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-8 border shadow-sm flex flex-col justify-between space-y-6 relative transition-all duration-300 hover:shadow-xl ${
                  pkg.popular ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-102" : "border-amber-200/80"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-100 text-[10px] font-extrabold uppercase px-4 py-1 rounded-full shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-slate-900">{pkg.name}</h3>
                    {pkg.subtitle && <p className="text-xs text-amber-900 font-semibold mt-0.5">{pkg.subtitle}</p>}
                  </div>

                  <div className="text-3xl font-extrabold text-slate-900 font-serif">{pkg.price}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-2 pt-4 border-t border-amber-100 text-xs text-slate-700">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-amber-100">
                  <a
                    href={getPackageWhatsApp(pkg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      pkg.popular
                        ? "bg-amber-900 hover:bg-amber-800 text-amber-50"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Inquire for {pkg.name}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assurance Row */}
      <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200 text-center space-y-3 max-w-3xl mx-auto">
        <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          The Aameena Furniture Price & Timber Promise
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          All prices reflect raw seasoned timber cost, artisanal joinery labor, and 7-step PU polish finish. We offer 100% price transparency and a 10-Year anti-termite and structural wood warranty.
        </p>
      </div>
    </div>
  );
}
