import Link from "next/link";
import HeaderClient from "./HeaderClient";
import HeaderDesktopNav from "./HeaderDesktopNav";
import HeaderCartButton from "./HeaderCartButton";
import HeaderWishlistButton from "./HeaderWishlistButton";
import HeaderAuth from "./HeaderAuth";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  // Automatically sync logged-in Clerk user into PostgreSQL DB
  await checkUser();

  return (
    <header className="storefront-header sticky top-0 z-50 w-full bg-amber-950/90 backdrop-blur-md border-b border-amber-900/40 text-amber-50 shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <BrandLogo href="/" size="md" priority />

        {/* Desktop Navigation Links (Centered) */}
        <HeaderDesktopNav />

        {/* Right Actions & Mobile/Tablet Navigation Controller */}
        <HeaderClient>
          {/* Real-time Wishlist Button */}
          <HeaderWishlistButton />

          {/* Real-time Shopping Cart Button */}
          <HeaderCartButton />

          {/* Theme Switcher (3 Luxury Themes: Light, Emerald, Dark - Hidden on extra small mobile) */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          {/* Authentication with mounted-guarded HeaderAuth */}
          <div suppressHydrationWarning className="flex items-center">
            <HeaderAuth />
          </div>
        </HeaderClient>
      </div>
    </header>
  );
}
