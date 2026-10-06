"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HeaderCartButton() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalItems : 0;

  return (
    <Link
      href="/cart"
      className="relative w-10 h-10 rounded-full bg-amber-900/40 hover:bg-amber-900/80 text-amber-100 hover:text-white border border-amber-800/60 transition-all flex items-center justify-center group cursor-pointer shadow-xs hover:border-amber-400/80 hover:scale-105 active:scale-95"
      title={
        count > 0
          ? `Shopping Cart (${count} ${count === 1 ? "item" : "items"})`
          : "Your Shopping Cart is Empty"
      }
      aria-label={`Shopping Cart with ${count} items`}
      suppressHydrationWarning
    >
      <ShoppingCart className="w-5 h-5 text-amber-300 group-hover:text-amber-100 group-hover:scale-110 transition-transform" />
      {count > 0 && (
        <span
          key={count}
          suppressHydrationWarning
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200 border border-amber-950 pointer-events-none"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
