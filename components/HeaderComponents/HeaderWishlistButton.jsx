"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function HeaderWishlistButton() {
  const { wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? wishlistCount : 0;

  return (
    <Link
      href="/wishlist"
      className="relative w-10 h-10 rounded-full bg-amber-900/40 hover:bg-amber-900/80 text-amber-100 hover:text-white border border-amber-800/60 transition-all flex items-center justify-center group cursor-pointer shadow-xs hover:border-rose-400/80 hover:scale-105 active:scale-95"
      title={
        count > 0
          ? `My Wishlist (${count} saved piece${count === 1 ? "" : "s"})`
          : "My Wishlist (0 pieces saved)"
      }
      aria-label={`Wishlist with ${count} items`}
      suppressHydrationWarning
    >
      <Heart
        className={`w-5 h-5 transition-transform group-hover:scale-110 ${
          count > 0
            ? "fill-rose-500 text-rose-400"
            : "text-amber-300 group-hover:text-amber-100"
        }`}
      />
      {count > 0 && (
        <span
          key={count}
          suppressHydrationWarning
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200 border border-amber-950 pointer-events-none"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
