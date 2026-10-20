"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  ArrowLeft,
  Star,
  ExternalLink,
  Menu,
  X,
  DollarSign,
  BookOpen,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Minimize2,
  Maximize2,
  Sliders,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import RoleGuard from "@/components/RoleGuard";
import BrandLogo from "@/components/BrandLogo";

export default function ManagerLayout({ children }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHNavMinimized, setIsHNavMinimized] = useState(false);
  const [storeName, setStoreName] = useState("Aameena Distributors");

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Load saved collapse preferences and dynamic store name
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem("aameena_manager_sidebar_collapsed");
      if (savedSidebar !== null) setIsSidebarCollapsed(savedSidebar === "true");

      const savedHNav = localStorage.getItem("aameena_manager_hnav_minimized");
      if (savedHNav !== null) setIsHNavMinimized(savedHNav === "true");

      const cachedSettings = localStorage.getItem("aameena_platform_settings");
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        if (parsed.storeName) setStoreName(parsed.storeName);
      }
    } catch (e) {}

    const handleSettingsUpdate = () => {
      try {
        const cachedSettings = localStorage.getItem("aameena_platform_settings");
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.storeName) setStoreName(parsed.storeName);
        }
      } catch (e) {}
    };

    if (typeof window !== "undefined") {
      window.addEventListener("aameena_settings_updated", handleSettingsUpdate);
      return () => window.removeEventListener("aameena_settings_updated", handleSettingsUpdate);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("aameena_manager_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleHNav = () => {
    setIsHNavMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("aameena_manager_hnav_minimized", String(next));
      } catch (e) {}
      return next;
    });
  };

  const managerLinks = [
    { title: "Manufacturer Analytics", shortTitle: "Analytics", url: "/manager", icon: LayoutDashboard },
    { title: "Sales & Graph Analysis", shortTitle: "Sales", url: "/manager/analysis", icon: BarChart3 },
    { title: "Product Stock & Pricing", shortTitle: "Products", url: "/manager/products", icon: Package },
    { title: "Pricing & PDF Catalog", shortTitle: "Pricing", url: "/manager/pricing", icon: DollarSign },
    { title: "Blog & SEO Articles", shortTitle: "Blogs", url: "/manager/blogs", icon: BookOpen },
    { title: "Order Management", shortTitle: "Orders", url: "/manager/orders", icon: ShoppingBag },
    { title: "Workforce Directory", shortTitle: "Workforce", url: "/manager/employees", icon: Users },
    { title: "Customer Reviews", shortTitle: "Reviews", url: "/manager/reviews", icon: Star },
    { title: "Facility Settings", shortTitle: "Settings", url: "/manager/settings", icon: Settings },
  ];

  return (
    <RoleGuard requiredRole="MANAGER">
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row manager-layout-shell">
        {/* 1. Desktop Sidebar (Sticky on md and above with collapse support) */}
        <aside
          className={`hidden md:flex bg-amber-950 text-amber-50 border-r border-amber-900/40 p-4 flex-col justify-between shrink-0 transition-all duration-300 md:sticky md:top-0 md:h-screen md:overflow-y-auto ${
            isSidebarCollapsed ? "md:w-20 items-center" : "md:w-64"
          }`}
        >
          <div className="space-y-5 w-full">
            {/* Brand Header with Collapse Toggle */}
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center flex-col gap-2" : "justify-between"}`}>
              <div>
                <BrandLogo
                  href="/manager"
                  size="sm"
                  showText={!isSidebarCollapsed}
                  subtitle="Operations Manager"
                  layout="stacked"
                  storeName={storeName}
                />
                {!isSidebarCollapsed && (
                  <p className="text-[10px] text-amber-300/80 mt-1 pl-1">Furniture Manufacturer Portal</p>
                )}
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? "Expand Sidebar (Full Width)" : "Minimize Sidebar to Icons"}
                className="p-1.5 rounded-lg border border-amber-900/60 bg-amber-900/40 text-amber-300 hover:text-white hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Sidebar Width"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 w-full">
              {!isSidebarCollapsed ? (
                <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 px-3 mb-2">
                  Facility Controls
                </p>
              ) : (
                <div className="h-px bg-amber-900/60 my-2 mx-1" />
              )}
              {managerLinks.map((link) => {
                const isActive = pathname === link.url;
                return (
                  <Link
                    key={link.url}
                    href={link.url}
                    title={link.title}
                    className={`flex items-center rounded-xl text-xs font-bold transition-all ${
                      isSidebarCollapsed
                        ? "justify-center p-2.5 mx-auto w-11 h-11"
                        : "gap-3 px-3.5 py-2.5 w-full"
                    } ${
                      isActive
                        ? "bg-amber-500 text-amber-950 shadow-md font-semibold"
                        : "text-amber-200 hover:text-white hover:bg-amber-900/60"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-950" : "text-amber-400"}`} />
                    {!isSidebarCollapsed && <span className="truncate">{link.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Back to Public Site */}
          <div className={`pt-4 border-t border-amber-900/60 space-y-2 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            <Link
              href="/ai-reviews"
              target="_blank"
              title="Live Reviews Page"
              className={`live-reviews-nav-btn flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-xs ${
                isSidebarCollapsed ? "w-11 h-11 p-0" : "gap-2 w-full py-2.5"
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span className="truncate">Live Reviews Page</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 shrink-0" />
                </>
              )}
            </Link>
            <Link
              href="/"
              title="Return to User Website"
              className={`flex items-center justify-center rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-colors border border-amber-800/60 ${
                isSidebarCollapsed ? "w-11 h-11 p-0" : "gap-2 w-full py-2.5"
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Return to User Website</span>}
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
                  <BrandLogo href="/manager" size="sm" subtitle="Operations Manager" layout="stacked" storeName={storeName} />
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
                  className="live-reviews-nav-btn flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Top Navigation Shell (Fixed on scroll, stays accessible at all times) */}
          <div className="sticky top-0 z-40 bg-amber-950/95 backdrop-blur-md border-b border-amber-900/40 shadow-md transition-all text-amber-100">
            {/* Top Bar Header with Breadcrumbs & Actions */}
            <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between shrink-0 manager-header border-b border-amber-900/40">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsMobileNavOpen(true)}
                  className="md:hidden p-2 rounded-xl border border-amber-900/60 bg-amber-900/40 text-amber-200 hover:text-white hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Open Manager Navigation"
                >
                  <Menu className="w-4 h-4 text-amber-400" />
                </button>

                {/* Desktop Sidebar Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title={isSidebarCollapsed ? "Expand Sidebar to Full Width" : "Minimize Sidebar to Icons"}
                  className="hidden md:flex p-1.5 rounded-lg border border-amber-900/60 bg-amber-900/40 text-amber-200 hover:text-white hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle Sidebar"
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4 text-amber-400" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-amber-200 truncate">
                  <span className="font-semibold text-white truncate">{storeName}</span>
                  <span>/</span>
                  <span className="truncate text-amber-300 font-medium">Showroom Operations</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Horizontal Navbar Minimize / Expand Button */}
                <button
                  type="button"
                  onClick={toggleHNav}
                  title={isHNavMinimized ? "Expand Horizontal Navbar to Show Full Labels" : "Minimize Horizontal Navbar to Just Icons"}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-900/60 bg-amber-900/40 hover:bg-amber-900/80 text-xs text-amber-200 hover:text-white font-medium transition-colors cursor-pointer shadow-xs"
                >
                  {isHNavMinimized ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Show Labels</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Just Icons</span>
                    </>
                  )}
                </button>

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

            {/* Fixed Horizontal Navbar with ALL Sections (Never moves on scroll, minimizable to icons) */}
            <nav
              aria-label="Manager Sections Horizontal Navigation"
              className="px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 sm:gap-2 bg-amber-950/80"
            >
              <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mr-1">
                <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden lg:inline">Sections:</span>
              </div>

              {managerLinks.map((link) => {
                const isActive = pathname === link.url;
                return (
                  <Link
                    key={link.url}
                    href={link.url}
                    title={link.title}
                    className={`flex items-center rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      isHNavMinimized
                        ? "p-2 sm:p-2.5 justify-center w-8 h-8 sm:w-9 sm:h-9"
                        : "gap-2 px-3 py-1.5"
                    } ${
                      isActive
                        ? "bg-amber-500 text-amber-950 shadow-md font-bold scale-[1.02]"
                        : "text-amber-200 hover:text-white hover:bg-amber-900/60 border border-amber-900/50"
                    }`}
                  >
                    <link.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-950" : "text-amber-400"}`} />
                    {!isHNavMinimized && (
                      <span className="whitespace-nowrap">{link.shortTitle || link.title}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Content Body */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
