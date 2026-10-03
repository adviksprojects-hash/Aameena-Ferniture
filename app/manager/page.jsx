import Link from "next/link";
import {
  Briefcase,
  ShoppingBag,
  Package,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Layers,
  Hammer,
  Truck,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/prisma";

export default async function ManagerDashboard() {
  const [orders, allProducts, lowStockCount, inquiriesCount] = await Promise.all([
    db.order.findMany({
      include: {
        OrderItem: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      include: {
        Category: true,
      },
    }),
    db.product.count({
      where: { stock: { lte: 2 } },
    }),
    db.serviceInquiry.count(),
  ]);

  // Financial & Order Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Custom vs Standard Furniture Orders
  const customOrdersCount = orders.filter(
    (o) =>
      o.OrderItem?.some((i) => !i.productId) ||
      (o.customerNotes && (o.customerNotes.includes("[Custom") || o.customerNotes.includes("[Bespoke")))
  ).length;
  const standardOrdersCount = totalOrdersCount - customOrdersCount;

  // Active Pipeline Stages
  const stagesCount = {
    INQUIRY_RECEIVED: 0,
    TIMBER_SELECTION: 0,
    CARVING_JOINERY: 0,
    SEVEN_STEP_POLISHING: 0,
    DISPATCHED_WHITE_GLOVE: 0,
    DELIVERED: 0,
  };

  orders.forEach((o) => {
    const stage = o.productionStage || "INQUIRY_RECEIVED";
    if (stagesCount[stage] !== undefined) {
      stagesCount[stage]++;
    } else {
      stagesCount.INQUIRY_RECEIVED++;
    }
  });

  const activeInProduction =
    stagesCount.TIMBER_SELECTION +
    stagesCount.CARVING_JOINERY +
    stagesCount.SEVEN_STEP_POLISHING +
    stagesCount.DISPATCHED_WHITE_GLOVE;

  // Timber breakdown across products
  const timberBreakdown = {
    "Grade-A Sagwan Teak": 0,
    "Rajasthan Sheesham": 0,
    "Royal Rosewood": 0,
    "African Mahogany / Other": 0,
  };

  allProducts.forEach((p) => {
    const wood = p.woodType || "";
    if (wood.includes("Teak") || wood.includes("Sagwan")) {
      timberBreakdown["Grade-A Sagwan Teak"]++;
    } else if (wood.includes("Sheesham")) {
      timberBreakdown["Rajasthan Sheesham"]++;
    } else if (wood.includes("Rosewood") || wood.includes("Shisham")) {
      timberBreakdown["Royal Rosewood"]++;
    } else {
      timberBreakdown["African Mahogany / Other"]++;
    }
  });

  const STAGE_DISPLAY = [
    { key: "TIMBER_SELECTION", label: "Timber Seasoning", color: "bg-amber-600" },
    { key: "CARVING_JOINERY", label: "Carving & Joinery", color: "bg-orange-600" },
    { key: "SEVEN_STEP_POLISHING", label: "7-Step Polishing", color: "bg-purple-600" },
    { key: "DISPATCHED_WHITE_GLOVE", label: "Out for Delivery", color: "bg-blue-600" },
    { key: "DELIVERED", label: "Delivered & Installed", color: "bg-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
            Furniture Manufacturer Operations
          </span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
            Furniture Manufacturer Manager Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time manufacturing analytics: ₹{totalRevenue.toLocaleString("en-IN")} total order value, {allProducts.length} active catalog pieces, {activeInProduction} orders currently in crafting stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/manager/orders"
            className="px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-amber-900/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Direct Order</span>
          </Link>
          <Link
            href="/manager/products"
            className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Furniture Piece</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Manufacturing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Manufacturing Revenue</span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">From {totalOrdersCount} registered customer orders</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">In Active Crafting</span>
            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-900">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">{activeInProduction} Orders</h2>
            <p className="text-[11px] text-slate-500 mt-1">Seasoning, carving, & polishing pipeline</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Bespoke vs Catalog</span>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-900">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              {customOrdersCount} <span className="text-sm font-sans font-normal text-slate-500">Custom / {standardOrdersCount} Catalog</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Average Order Value: ₹{avgOrderValue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Facility Stock Health</span>
            <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? "bg-red-100 text-red-900" : "bg-emerald-100 text-emerald-900"}`}>
              {lowStockCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              {allProducts.length} <span className="text-sm font-sans font-normal text-slate-500">Pieces</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              {lowStockCount > 0 ? `${lowStockCount} items need wood replenishment` : "All pieces sufficiently stocked"}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Manufacturing Pipeline Progress Bar & Timber Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">
                Manufacturing Pipeline Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current distribution of customer orders across the 5 artisanal stages.
              </p>
            </div>
            <Link
              href="/manager/orders"
              className="text-xs text-amber-800 font-bold flex items-center gap-1 hover:underline"
            >
              Manage Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {STAGE_DISPLAY.map((stg) => {
              const count = stagesCount[stg.key] || 0;
              const percent = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;

              return (
                <div key={stg.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{stg.label}</span>
                    <span className="text-slate-500 font-medium">
                      {count} {count === 1 ? "order" : "orders"} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${stg.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timber Utilization Breakdown */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <h3 className="text-base font-bold font-serif text-slate-900">Timber Seasoning Mix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Raw solid timber utilization in catalog pieces.</p>
          </div>

          <div className="space-y-4">
            {Object.entries(timberBreakdown).map(([wood, count]) => {
              const totalItems = allProducts.length || 1;
              const pct = Math.round((count / totalItems) * 100);

              return (
                <div key={wood} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{wood}</span>
                    <span className="text-amber-900">{count} pieces ({pct}%)</span>
                  </div>
                  <div className="w-full bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-900 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real Orders Table */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900">Recent Manufacturing Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct customer orders and custom furniture crafting progress.</p>
          </div>
          <Link href="/manager/orders" className="text-xs text-amber-800 font-bold flex items-center gap-1">
            View All Orders & WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No active orders found in database.</p>
          ) : (
            orders.slice(0, 5).map((ord) => {
              const firstItem = ord.OrderItem?.[0];
              const isCustom = !firstItem?.productId;

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-amber-100/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">#{ord.orderNumber}</span>
                      <span className="text-slate-700 font-semibold">• {ord.customerName}</span>
                      {isCustom && (
                        <span className="px-2 py-0.2 rounded-md bg-purple-100 text-purple-900 text-[9px] font-bold uppercase">
                          Custom Furniture
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 block">
                      {firstItem?.title || "Handcrafted Furniture"} ({ord.city || "Mumbai"})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {(ord.productionStage || "INQUIRY_RECEIVED").replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </span>
                    <Link
                      href="/manager/orders"
                      className="px-2.5 py-1 rounded-lg bg-amber-900 text-amber-50 text-[10px] font-bold hover:bg-amber-800 transition-colors"
                    >
                      Process
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
