"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, MessageSquare, Calculator } from "lucide-react";

export default function PricingPage() {
  const [bhk, setBhk] = useState("2bhk");
  const [woodType, setWoodType] = useState("teak");

  // Simple pricing calculator math
  const basePrices = {
    "1bhk": { teak: 145000, sheesham: 115000 },
    "2bhk": { teak: 235000, sheesham: 185000 },
    "3bhk": { teak: 360000, sheesham: 285000 },
    "villa": { teak: 580000, sheesham: 460000 },
  };

  const estimatedTotal = basePrices[bhk][woodType];

  const packageTiers = [
    {
      name: "Standard Home Furnishing",
      subtitle: "Essential Solid Wood Essentials",
      price: "₹1,45,000",
      description: "Includes Queen Bed + Storage, 5-Seater Sofa Set, 4-Seater Dining Table, and Center Table.",
      features: [
        "100% Solid Wood Structure",
        "5-Year Structural Warranty",
        "Free Doorstep Delivery",
        "Standard Teak Polish",
      ],
      popular: false,
    },
    {
      name: "Royal Premium Package",
      subtitle: "Complete Luxury Living & Bedroom Suite",
      price: "₹2,35,000",
      description: "Includes King Bed + Hydraulic Storage, 7-Seater Royal Sofa Set, 6-Seater Dining Suite, Wardrobe & Console.",
      features: [
        "100% Grade-A Sagwan Teak Wood",
        "Lifetime Wood Guarantee",
        "Custom Velvet Upholstery",
        "3D Design & Space Consultation",
        "Free Assembly & Installation",
      ],
      popular: true,
    },
    {
      name: "Bespoke Villa / Interior Project",
      subtitle: "End-to-End Customized Home Furnishing",
      price: "Custom Quote",
      description: "Tailor-made for luxury villas, penthouses, and large bungalows with dedicated interior designer oversight.",
      features: [
        "Custom Carved Hardwood Masterpieces",
        "Dedicated Project Manager",
        "Unlimited Customization & Fabric Choices",
        "Priority Workshop Production",
      ],
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Direct Factory Pricing</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Transparent Packages & Cost Calculator</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          No hidden agent commissions. Enjoy direct manufacturer pricing with zero compromise on hardwood quality.
        </p>
      </div>

      {/* Interactive Furniture Cost Estimator */}
      <div className="bg-white rounded-3xl p-8 border border-amber-200/80 shadow-md space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-900">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Instant Full-Home Furnishing Estimator</h2>
            <p className="text-xs text-slate-500">Calculate an estimated budget for your apartment or villa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Home Size / Layout:</label>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm font-semibold text-slate-800 focus:outline-none"
            >
              <option value="1bhk">1 BHK Complete Package</option>
              <option value="2bhk">2 BHK Complete Package</option>
              <option value="3bhk">3 BHK Complete Package</option>
              <option value="villa">Independent Villa / Bungalow</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Preferred Wood Species:</label>
            <select
              value={woodType}
              onChange={(e) => setWoodType(e.target.value)}
              className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm font-semibold text-slate-800 focus:outline-none"
            >
              <option value="teak">Grade-A Sagwan Teak Wood</option>
              <option value="sheesham">Premium Sheesham Hardwood</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-900 text-amber-50 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-300 uppercase font-semibold">Estimated Package Budget</span>
            <p className="text-3xl font-extrabold font-serif">₹{estimatedTotal.toLocaleString()}</p>
          </div>
          <Link
            href={`/contact?estimate=₹${estimatedTotal.toLocaleString()}%20for%20${bhk}%20${woodType}`}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs transition-colors"
          >
            Get Detailed Estimate PDF
          </Link>
        </div>
      </div>

      {/* Package Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {packageTiers.map((tier, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl p-8 border ${
              tier.popular ? "border-amber-500 ring-2 ring-amber-500/20 shadow-xl" : "border-amber-200/70 shadow-sm"
            } space-y-6 relative flex flex-col justify-between`}
          >
            {tier.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">{tier.name}</h3>
              <p className="text-xs text-slate-500">{tier.subtitle}</p>
              <p className="text-3xl font-extrabold text-slate-900 font-serif">{tier.price}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{tier.description}</p>

              <div className="space-y-2 pt-4 border-t border-amber-100">
                {tier.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/contact"
              className={`w-full py-3 rounded-xl text-xs font-bold transition-colors text-center block ${
                tier.popular
                  ? "bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-md"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              Choose Package
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
