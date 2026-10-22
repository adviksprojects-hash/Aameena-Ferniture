"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/HeaderData/HeaderData";
import { cn } from "@/lib/utils";
import { ShoppingCart, Heart, Sparkles, X, ChevronRight, Phone } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";

export default function HeaderClient({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll-lock & Escape key dismissal
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
      {/* Right action slots (Wishlist, Cart, Theme, Auth) */}
      {children}

      {/* Mobile / Tablet Menu Toggle - Positioned on far right */}
      <button
        type="button"
        suppressHydrationWarning
        className={cn(
          "xl:hidden relative size-9 sm:size-10 rounded-full text-amber-200 hover:text-white bg-amber-900/60 border border-amber-800/60 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer shrink-0 transition-all duration-200 active:scale-95 shadow-sm"
        )}
        onClick={() => setIsMobileMenuOpen((open) => !open)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-nav-panel"
      >
        <span
          className={`absolute h-0.5 w-4 sm:w-5 bg-current transition-transform duration-300 ${
            isMobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
          }`}
        />
        <span
          className={`absolute h-0.5 w-4 sm:w-5 bg-current transition-opacity duration-200 ${
            isMobileMenuOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute h-0.5 w-4 sm:w-5 bg-current transition-transform duration-300 ${
            isMobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
          }`}
        />
      </button>

      {/* Mobile Navigation Drawer Overlay & Backdrop (Portaled to document.body) */}
      {isMobileMenuOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md xl:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Drawer Panel */}
          <div
            id="mobile-nav-panel"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed inset-y-0 right-0 w-80 max-w-[85vw] h-full h-[100dvh] max-h-[100dvh] border-l border-amber-800/60 bg-gradient-to-b from-[#2b1106] via-[#3a1505] to-[#1c0a00] p-4 sm:p-5 shadow-2xl backdrop-blur-2xl z-[10000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 text-white"
            )}
          >
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-sm tracking-wide text-white">
                    Navigation Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900/60 transition-colors cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Auth Bar in Drawer */}
              <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40">
                {isSignedIn ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8 ring-2 ring-amber-500",
                          },
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.fullName || user?.firstName || "Customer Account"}
                        </p>
                        <p className="text-[10px] text-amber-300 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SignInButton mode="modal">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-xs font-bold text-amber-100 transition-colors text-center cursor-pointer"
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold text-stone-950 transition-colors text-center shadow-sm cursor-pointer"
                      >
                        Create Account
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.url;
                  return (
                    <Link
                      key={link.id}
                      href={link.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "mobile-drawer-link rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-between group",
                        isActive
                          ? "active-nav-link bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md border border-amber-400"
                          : "text-white/95 bg-white/5 hover:bg-white/10 hover:text-amber-300 border border-white/10 hover:border-amber-400/40"
                      )}
                    >
                      <span className="tracking-wide">{link.title}</span>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0",
                          isActive ? "text-stone-950" : "text-amber-400/80"
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Links for Mobile: Wishlist & Cart */}
              <div className="pt-2 border-t border-amber-800/40 space-y-1.5">
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/50 text-white"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Saved Wishlist</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-500 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/50 text-white"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Shopping Cart</span>
                  </span>
                  {totalItems > 0 && (
                    <span className="bg-amber-400 text-amber-950 font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Bottom Drawer Actions: Theme Appearance & Helpline */}
            <div className="pt-3 mt-4 border-t border-amber-800/40 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300">
                  Theme Appearance
                </span>
                <ThemeSwitcher />
              </div>
              <div className="text-[11px] text-amber-200/90 flex items-center gap-2 px-1">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="tel:+919730392917" className="hover:underline font-medium text-white">
                  Helpline: +91 97303 92917
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
