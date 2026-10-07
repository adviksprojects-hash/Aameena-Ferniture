"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  ArrowLeft,
  Star,
  ExternalLink,
  Menu,
  X,
  DollarSign,
  Users,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function ManagerLayout({ children }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const managerLinks = [
    { title: "Manufacturer Analytics", url: "/manager", icon: LayoutDashboard },
    { title: "Product Stock & Pricing", url: "/manager/products", icon: Package },
    { title: "Pricing & PDF Catalog", url: "/manager/pricing", icon: DollarSign },
    { title: "Order Management", url: "/manager/orders", icon: ShoppingBag },
    { title: "Workforce Directory", url: "/manager/employees", icon: Users },
    { title: "Customer Reviews", url: "/manager/reviews", icon: Star },
    { title: "WhatsApp Customer Alerts", url: "/manager/whatsapp", icon: MessageSquare },
    { title: "Facility Settings", url: "/manager/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row">
      {/* 1. Desktop Sidebar (Persistent on md and above) */}
      <aside className="hidden md:flex md:w-64 bg-amber-950 text-amber-50 border-r border-amber-900/40 p-6 flex-col justify-between shrink-0 space-y-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <div>
            <Link href="/manager" className="flex items-center gap-2 font-bold text-amber-400 font-serif text-lg">
              <div className="p-1.5 bg-amber-500 rounded-lg text-amber-950">
                <Briefcase className="w-5 h-5" />
              </div>
              <span>
                Operations <span className="text-white font-sans text-xs uppercase bg-amber-900 px-2 py-0.5 rounded border border-amber-800">Manager</span>
              </span>
            </Link>
            <p className="text-[10px] text-amber-300/80 mt-1">Furniture Manufacturer Portal</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 px-3 mb-2">Facility Controls</p>
            {managerLinks.map((link) => {
              const isActive = pathname === link.url;
              return (
                <Link
                  key={link.url}
                  href={link.url}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-amber-500 text-amber-950 shadow-md font-semibold"
                      : "text-amber-200 hover:text-white hover:bg-amber-900/60"
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? "text-amber-950" : "text-amber-400"}`} />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Public Site */}
        <div className="pt-4 border-t border-amber-900/60 space-y-2">
          <Link
            href="/ai-reviews"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-colors border border-amber-500/30"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Live Reviews Page</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-colors border border-amber-800/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Website</span>
          </Link>
        </div>
      </aside>

      {/* 2. Mobile Off-Canvas Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-amber-950 border-r border-amber-900/60 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200 text-amber-50">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
                <Link href="/manager" className="flex items-center gap-2 font-bold text-amber-400 font-serif text-base">
                  <div className="p-1 bg-amber-500 rounded-lg text-amber-950">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span>Manager Portal</span>
                </Link>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/60 transition-colors cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="space-y-1">
                {managerLinks.map((link) => {
                  const isActive = pathname === link.url;
                  return (
                    <Link
                      key={link.url}
                      href={link.url}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-amber-500 text-amber-950 shadow-md font-semibold"
                          : "text-amber-200 hover:text-white hover:bg-amber-900/60"
                      }`}
                    >
                      <link.icon className={`w-4 h-4 ${isActive ? "text-amber-950" : "text-amber-400"}`} />
                      <span>{link.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-[11px] font-bold text-amber-300">Theme</span>
                <ThemeSwitcher />
              </div>
              <Link
                href="/ai-reviews"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-colors border border-amber-500/30"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Live Reviews Page</span>
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-colors border border-amber-800/60"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar with Mobile Menu Toggle */}
        <header className="h-14 sm:h-16 bg-amber-950 text-amber-100 border-b border-amber-900/40 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 rounded-xl border border-amber-900/60 bg-amber-900/40 text-amber-200 hover:text-white hover:bg-amber-800 transition-colors cursor-pointer"
              aria-label="Open Manager Navigation"
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-amber-200 truncate">
              <span className="font-semibold text-white truncate">Aameena Furniture</span>
              <span className="hidden sm:inline">/</span>
              <span className="hidden sm:inline">Showroom Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher in Manager Topbar */}
            <ThemeSwitcher />

            <Link
              href="/ai-reviews"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors font-medium ml-1"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Live Reviews</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span className="hidden sm:inline">View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
