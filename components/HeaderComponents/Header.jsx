import Link from "next/link";
import HeaderClient from "./HeaderClient";
import HeaderCartButton from "./HeaderCartButton";
import HeaderWishlistButton from "./HeaderWishlistButton";
import HeaderAuth from "./HeaderAuth";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  // Automatically sync logged-in Clerk user into the PostgreSQL database User table
  await checkUser();

  return (
    <header className="storefront-header sticky top-0 z-50 w-full bg-amber-950/90 backdrop-blur-md border-b border-amber-900/40 text-amber-50 shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <BrandLogo href="/" size="md" priority />

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