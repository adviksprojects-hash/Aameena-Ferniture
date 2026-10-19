"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Home,
  ShoppingBag,
  Phone,
  Compass,
  Package,
  Shield,
  Briefcase,
  HeartHandshake,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Brand Apology Emblem */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          {/* Subtle pulsating aura */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-purple-500/20 blur-xl animate-pulse" />
          
          {/* Floating Artisan Emblem Container */}
          <div className="relative w-28 h-28 rounded-3xl p-1 bg-slate-950/80 border border-emerald-500/40 shadow-2xl flex items-center justify-center animate-bounce duration-1000">
            <Image
              src="/images/logo.png"
              alt="Aameena Distributors"
              width={76}
              height={76}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Gentle sorry badge */}
          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1 border border-white/50">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>So Sorry!</span>
          </div>
        </div>

        {/* Text Apology Message */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <span>Showroom Navigation Assist</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-slate-900 dark:text-white tracking-tight">
            We're Truly Sorry! <br className="hidden sm:inline" />
            We Couldn't Find That Page
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            The page, collection, or portal link you requested might have been relocated in our showroom catalog or is currently being refreshed in our workshop.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Go Back to Previous Page</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Storefront Home</span>
          </Link>
        </div>

        {/* Helpful Quick Portal Shortcuts */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-3">
          <span className="font-bold uppercase tracking-wider text-[11px] block text-slate-400">
            Helpful Showroom Shortcuts:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-emerald-500" />
              <span>Furniture Catalog</span>
            </Link>

            <Link
              href="/orders"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>Track Orders</span>
            </Link>

            <Link
              href="/contact"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Contact Workshop</span>
            </Link>

            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </Link>

            <Link
              href="/manager"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>Manager Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
