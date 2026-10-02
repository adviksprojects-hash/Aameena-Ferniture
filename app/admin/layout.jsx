"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  UserCheck, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  ArrowLeft,
  Sofa
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const adminLinks = [
    { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Product Management", url: "/admin/products", icon: Package },
    { title: "Order Management", url: "/admin/orders", icon: ShoppingBag },
    { title: "Manager Management", url: "/admin/managers", icon: UserCheck },
    { title: "Employee Management", url: "/admin/employees", icon: Users },
    { title: "Sales Analysis", url: "/admin/analysis", icon: BarChart3 },
    { title: "WhatsApp Automation", url: "/admin/whatsapp", icon: MessageSquare },
    { title: "Platform Settings", url: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 space-y-6">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-amber-400 font-serif text-lg">
              <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
                <Shield className="w-5 h-5" />
              </div>
              <span>Admin <span className="text-white font-sans text-xs uppercase bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">Super</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 mb-2">Super Admin Controls</p>
            {adminLinks.map((link) => {
              const isActive = pathname === link.url;
              return (
                <Link
                  key={link.url}
                  href={link.url}
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

        {/* Back to Public Site */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors border border-slate-800"
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
