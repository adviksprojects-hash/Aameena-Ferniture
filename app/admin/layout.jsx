"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  UserCheck, 
  Users, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  DollarSign,
  BookOpen,
  Star,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import RoleGuard from "@/components/RoleGuard";
import BrandLogo from "@/components/BrandLogo";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [storeName, setStoreName] = useState("Aameena Distributors");

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Load saved collapse preferences and dynamic store name
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem("aameena_admin_sidebar_collapsed");
      if (savedSidebar !== null) setIsSidebarCollapsed(savedSidebar === "true");

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
        localStorage.setItem("aameena_admin_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  const adminLinks = [
    { title: "Admin Dashboard", shortTitle: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Product Management", shortTitle: "Products", url: "/admin/products", icon: Package },
    { title: "Order Management", shortTitle: "Orders", url: "/admin/orders", icon: ShoppingBag },
    { title: "Service Management", shortTitle: "Services", url: "/admin/services", icon: Settings },
    { title: "Pricing & PDF Catalog", shortTitle: "Pricing", url: "/admin/pricing", icon: DollarSign },
    { title: "Blog & SEO Articles", shortTitle: "Blogs", url: "/admin/blogs", icon: BookOpen },
    { title: "Customer Reviews", shortTitle: "Reviews", url: "/admin/reviews", icon: Star },
    { title: "Manager Management", shortTitle: "Managers", url: "/admin/managers", icon: UserCheck },
    { title: "Employee Management", shortTitle: "Employees", url: "/admin/employees", icon: Users },
    // { title: "Sales Analysis", shortTitle: "Analytics", url: "/admin/analysis", icon: BarChart3 },
    { title: "Platform Settings", shortTitle: "Settings", url: "/admin/settings", icon: Settings },
  ];

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row admin-layout-shell">
        {/* SINGLE VERTICAL FIXED NAVBAR (Fixed to the left side, always accessible when scrolling down, collapsible to icons) */}
        <aside
          className={`hidden md:flex bg-slate-950 border-r border-slate-800 p-4 flex-col justify-between shrink-0 transition-all duration-300 md:fixed md:top-0 md:left-0 md:bottom-0 md:z-30 md:h-screen md:overflow-y-auto ${
            isSidebarCollapsed ? "md:w-20 items-center" : "md:w-64"
          }`}
        >
          <div className="space-y-5 w-full">
            {/* Top Brand Header & Minimize to Icons Toggle */}
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center flex-col gap-2.5" : "justify-between"}`}>
              <BrandLogo
                href="/admin"
                size="sm"
                showText={!isSidebarCollapsed}
                subtitle="Super Admin Panel"
                layout="stacked"
                storeName={storeName}
              />
              <button
                type="button"
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? "Expand Sidebar (Full Width)" : "Minimize to Just Icons"}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Sidebar"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>

            {/* Vertical Navigation Links */}
            <nav className="space-y-1 w-full" aria-label="Admin Navigation">
              {!isSidebarCollapsed ? (
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 mb-2">
                  Super Admin Controls
                </p>
              ) : (
                <div className="h-px bg-slate-800/80 my-2 mx-1" />
              )}
              {adminLinks.map((link) => {
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
                        ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                    {!isSidebarCollapsed && <span className="truncate">{link.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className={`pt-4 border-t border-slate-800 space-y-2.5 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between px-1"}`}>
              {!isSidebarCollapsed && <span className="text-[11px] font-semibold text-slate-400">Theme</span>}
              <ThemeSwitcher orientation={isSidebarCollapsed ? "vertical" : "horizontal"} />
            </div>

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
              className={`flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors border border-slate-800 ${
                isSidebarCollapsed ? "w-11 h-11 p-0" : "gap-2 w-full py-2.5"
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Return to Storefront</span>}
            </Link>
          </div>
        </aside>

        {/* Mobile Off-Canvas Drawer (When opened on mobile phones < md) */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200">
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <BrandLogo href="/admin" size="sm" subtitle="Super Admin Panel" layout="stacked" storeName={storeName} />
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Links */}
                <nav className="space-y-1">
                  {adminLinks.map((link) => {
                    const isActive = pathname === link.url;
                    return (
                      <Link
                        key={link.url}
                        href={link.url}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <link.icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                        <span>{link.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[11px] font-bold text-slate-400">Theme</span>
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
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors border border-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Storefront</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}>
          {/* Mobile-Only Header (< md screens) */}
          <header className="md:hidden sticky top-0 z-40 h-14 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Open Admin Navigation"
              >
                <Menu className="w-5 h-5 text-amber-400" />
              </button>
              <BrandLogo href="/admin" size="sm" subtitle="Super Admin" layout="stacked" storeName={storeName} />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeSwitcher />
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
