import Link from "next/link";
import HeaderClient from "./HeaderClient";
import HeaderCartButton from "./HeaderCartButton";
import HeaderWishlistButton from "./HeaderWishlistButton";
import HeaderAuth from "./HeaderAuth";
import { Sofa } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  // Automatically sync logged-in Clerk user into the PostgreSQL database User table
  await checkUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-amber-950/90 backdrop-blur-md border-b border-amber-900/40 text-amber-50 shadow-lg">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight text-amber-50 flex items-center gap-2.5 group shrink-0"
        >
          <div className="bg-gradient-to-tr from-amber-600 to-amber-500 p-2 rounded-xl text-amber-950 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Sofa className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-extrabold text-white text-sm sm:text-base">
              Aameena <span className="text-amber-400 font-serif italic font-bold">Ferniture</span>
            </span>
            <span className="text-[10px] text-amber-300/80 font-medium tracking-wider uppercase -mt-0.5">
              and Fernishing
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <HeaderClient />

        {/* Quick Portal Switcher, Wishlist, Cart, Theme Switcher & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real-time Wishlist Button */}
          <HeaderWishlistButton />

          {/* Real-time Shopping Cart Button */}
          <HeaderCartButton />

          {/* Theme Switcher (3 Luxury Themes: Teak, Light, Dark) */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>



          {/* Authentication with mounted-guarded HeaderAuth */}
          <div suppressHydrationWarning className="flex items-center">
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}