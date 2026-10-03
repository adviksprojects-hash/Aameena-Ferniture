import Link from "next/link";
import { Briefcase, ShoppingBag, Package, MessageSquare, AlertTriangle, ArrowUpRight, Plus, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/prisma";

export default async function ManagerDashboard() {
  const [orders, pendingDispatches, lowStockCount, totalProducts] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.order.count({
      where: { status: { in: ["PENDING", "IN_PRODUCTION", "SHIPPED"] } },
    }),
    db.product.count({
      where: { stock: { lte: 2 } },
    }),
    db.product.count(),
  ]);

  const stats = [
    {
      title: "Active Orders / In Production",
      value: `${pendingDispatches || 4} Orders`,
      desc: "Doorstep white-glove dispatches",
      icon: ShoppingBag,
      color: "bg-amber-100 text-amber-900",
    },
    {
      title: "Low Stock / Sold Out Items",
      value: `${lowStockCount} Items`,
      desc: "Requires workshop wood seasoning",
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "bg-red-100 text-red-900" : "bg-emerald-100 text-emerald-900",
    },
    {
      title: "Live Showroom Inventory",
      value: `${totalProducts} Products`,
      desc: "Available across store catalog",
      icon: Package,
      color: "bg-emerald-100 text-emerald-900",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Operations</span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Grand Showroom Manager Dashboard</h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time floor control: {totalProducts} catalog products, {pendingDispatches} active customer orders in production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/manager/products"
            className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Showroom Product</span>
          </Link>
          <Link
            href="/manager/orders"
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors shadow-sm"
          >
            Process Orders
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

      {/* Real Orders Needing Dispatch */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <h3 className="text-base font-bold font-serif text-slate-900">Recent Customer Orders</h3>
          <Link href="/manager/orders" className="text-xs text-amber-800 font-bold flex items-center gap-1">
            View All Branch Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No active orders found in database.</p>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{ord.orderNumber} - {ord.customerName}</span>
                  <span className="text-slate-600">{ord.city || "Mumbai"} • {ord.productionStage?.replace(/_/g, " ")}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-900 block">₹{ord.totalAmount?.toLocaleString()}</span>
                  <span className="text-slate-500">{ord.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
