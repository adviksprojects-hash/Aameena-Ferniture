"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  ArrowLeft 
} from "lucide-react";

export default function ManagerLayout({ children }) {
  const pathname = usePathname();

  const managerLinks = [
    { title: "Manager Dashboard", url: "/manager", icon: LayoutDashboard },
    { title: "Product Stock & Pricing", url: "/manager/products", icon: Package },
    { title: "Order Management", url: "/manager/orders", icon: ShoppingBag },
    { title: "WhatsApp Customer Alerts", url: "/manager/whatsapp", icon: MessageSquare },
    { title: "Store Settings", url: "/manager/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-amber-950/20 text-slate-900 flex flex-col md:flex-row">
      
      {/* Manager Sidebar */}
      <aside className="w-full md:w-64 bg-amber-950 text-amber-50 border-r border-amber-900/40 p-6 flex flex-col justify-between shrink-0 space-y-6">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div>
            <Link href="/manager" className="flex items-center gap-2 font-bold text-amber-400 font-serif text-lg">
              <div className="p-1.5 bg-amber-500 rounded-lg text-amber-950">
                <Briefcase className="w-5 h-5" />
              </div>
              <span>Store <span className="text-white font-sans text-xs uppercase bg-amber-900 px-2 py-0.5 rounded border border-amber-800">Manager</span></span>
            </Link>
            <p className="text-[10px] text-amber-300/80 mt-1">Showroom Operations Portal</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 px-3 mb-2">Branch Controls</p>
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
        <div className="pt-4 border-t border-amber-900/60">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-colors border border-amber-800/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
