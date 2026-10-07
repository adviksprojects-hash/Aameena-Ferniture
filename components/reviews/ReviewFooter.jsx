"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function ReviewFooter() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 shrink-0">
          <HeartHandshake className="w-6 h-6" aria-hidden="true" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
            Direct Solapur Hardwood Manufacturer
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            100% Seasoned Grade-A Sagwan Teak & Sheesham furniture. Direct factory warranty.
          </p>
        </div>
      </div>

      <Link
        href="/products"
        className="px-5 py-2.5 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors whitespace-nowrap shadow-sm"
      >
        Browse Products
      </Link>
    </div>
  );
}
