import Link from "next/link";
import { Briefcase, ShoppingBag, Package, MessageSquare, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function ManagerDashboard() {
  const stats = [
    { title: "Today's Pending Dispatches", value: "8 Orders", desc: "Assigned for doorstep delivery", icon: ShoppingBag, color: "bg-amber-100 text-amber-900" },
    { title: "Low Stock Furniture Items", value: "3 Items", desc: "Needs workshop restocking", icon: AlertTriangle, color: "bg-red-100 text-red-900" },
    { title: "WhatsApp Alerts Sent Today", value: "24 Messages", desc: "Automated status updates", icon: MessageSquare, color: "bg-emerald-100 text-emerald-900" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Operations</span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Grand Showroom Manager Dashboard</h1>
          <p className="text-xs text-slate-600 mt-1">Manage daily order processing, stock adjustments, and customer WhatsApp dispatches.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/manager/orders"
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors"
          >
            Process Pending Orders
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">{stat.title}</span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">{stat.value}</h2>
              <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Needing Dispatch */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <h3 className="text-base font-bold font-serif text-slate-900">Immediate Furniture Dispatches</h3>
          <Link href="/manager/orders" className="text-xs text-amber-800 font-bold flex items-center gap-1">
            View All Branch Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {[
            { id: "ORD-2026-9812", client: "Rajesh Sharma", item: "Royal Teak 7-Seater Sofa", status: "In Transit", date: "Today, 2:30 PM" },
            { id: "ORD-2026-9810", client: "Sunil Verma", item: "Monarch 6-Seater Dining Suite", status: "Ready for Delivery", date: "Today, 4:00 PM" },
          ].map((ord, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{ord.id} - {ord.client}</span>
                <span className="text-slate-600">{ord.item}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-900 block">{ord.status}</span>
                <span className="text-slate-500">{ord.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
