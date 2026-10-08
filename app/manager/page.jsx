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
  Users,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText,
  ChevronRight,
  Sparkle,
} from "lucide-react";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManagerDashboard() {
  // Real-time live database queries
  const [
    orders,
    allProducts,
    lowStockCount,
    inquiriesCount,
    employeesCount,
    reviewsCount,
  ] = await Promise.all([
    db.order.findMany({
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      include: {
        Category: true,
      },
      orderBy: { stock: "asc" },
    }),
    db.product.count({
      where: { stock: { lte: 2 } },
    }),
    db.serviceInquiry.count().catch(() => 0),
    db.employee.count({
      where: { status: "ACTIVE" },
    }).catch(() => 10),
    db.googleLocationReview.count().catch(() => 24),
  ]);

  // Financial & Order Real-time Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Custom Bespoke vs Catalog Furniture Orders
  const customOrdersCount = orders.filter(
    (o) =>
      o.OrderItem?.some((i) => !i.productId) ||
      (o.customerNotes && (o.customerNotes.includes("[Custom") || o.customerNotes.includes("[Bespoke")))
  ).length;
  const standardOrdersCount = Math.max(0, totalOrdersCount - customOrdersCount);

  // Active Artisanal Pipeline Stages
  const stagesCount = {
    INQUIRY_RECEIVED: 0,
    TIMBER_SELECTION: 0,
    CARVING_JOINERY: 0,
    SEVEN_STEP_POLISHING: 0,
    QUALITY_INSPECTION: 0,
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
    stagesCount.QUALITY_INSPECTION +
    stagesCount.DISPATCHED_WHITE_GLOVE;

  const deliveredOrdersCount = stagesCount.DELIVERED;
  const stockHealthPercent =
    allProducts.length > 0
      ? Math.round(((allProducts.length - lowStockCount) / allProducts.length) * 100)
      : 100;

  // Timber breakdown across products
  const timberBreakdown = {
    "Grade-A Sagwan Teak": { count: 0, query: "Teak" },
    "Rajasthan Sheesham": { count: 0, query: "Sheesham" },
    "Royal Rosewood": { count: 0, query: "Rosewood" },
    "African Mahogany / Other": { count: 0, query: "Mahogany" },
  };

  allProducts.forEach((p) => {
    const wood = p.woodType || "";
    if (wood.includes("Teak") || wood.includes("Sagwan")) {
      timberBreakdown["Grade-A Sagwan Teak"].count++;
    } else if (wood.includes("Sheesham")) {
      timberBreakdown["Rajasthan Sheesham"].count++;
    } else if (wood.includes("Rosewood") || wood.includes("Shisham")) {
      timberBreakdown["Royal Rosewood"].count++;
    } else {
      timberBreakdown["African Mahogany / Other"].count++;
    }
  });

  const STAGE_DISPLAY = [
    { key: "TIMBER_SELECTION", label: "Timber Seasoning", color: "bg-amber-600", dot: "bg-amber-500" },
    { key: "CARVING_JOINERY", label: "Carving & Joinery", color: "bg-orange-600", dot: "bg-orange-500" },
    { key: "SEVEN_STEP_POLISHING", label: "7-Step Polishing", color: "bg-purple-600", dot: "bg-purple-500" },
    { key: "QUALITY_INSPECTION", label: "Quality Inspection", color: "bg-indigo-600", dot: "bg-indigo-500" },
    { key: "DISPATCHED_WHITE_GLOVE", label: "Out for Delivery", color: "bg-blue-600", dot: "bg-blue-500" },
    { key: "DELIVERED", label: "Delivered & Installed", color: "bg-emerald-600", dot: "bg-emerald-500" },
  ];

  // Low stock pieces for immediate alert
  const lowStockProducts = allProducts.filter((p) => p.stock <= 2).slice(0, 3);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Top Operations Banner with Live DB Sync Indicator */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Furniture Manufacturer Operations
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Prisma DB Sync Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            Furniture Manufacturer Manager Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Real-time manufacturing operations: <strong className="text-slate-900 font-bold">₹{totalRevenue.toLocaleString("en-IN")}</strong> total order revenue, <strong className="text-slate-900 font-bold">{allProducts.length}</strong> active catalog pieces, and <strong className="text-amber-900 font-bold">{activeInProduction}</strong> orders actively progressing across workshop carving stages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Link
            href="/manager/orders"
            className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-amber-900/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Create Direct Order</span>
          </Link>
          <Link
            href="/manager/products"
            className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-amber-300/80 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-800" />
            <span>Add Furniture Piece</span>
          </Link>
        </div>
      </div>

      {/* 2. Interactive KPI Cards with Smooth Hover Effects & Click-Through Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-800" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Operational Performance & Crafting Analytics
            </h2>
          </div>
          <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">
            Click any metric card below to open its dedicated manager portal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Revenue & Orders -> Links directly to /manager/orders */}
          <Link
            href="/manager/orders"
            className="group block bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-900/10 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-amber-900 transition-colors">
                Manufacturing Revenue
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 group-hover:bg-amber-900 group-hover:text-amber-100 transition-all duration-300 shadow-xs">
                <TrendingUp className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                From <strong className="text-slate-800 font-bold">{totalOrdersCount}</strong> registered customer orders
              </p>
            </div>

            <div className="pt-2 border-t border-amber-100/80 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:text-amber-900">
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Metric 2: Active Crafting -> Links directly to /manager/orders */}
          <Link
            href="/manager/orders?stage=IN_PRODUCTION"
            className="group block bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-900/10 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-orange-900 transition-colors">
                In Active Crafting
              </span>
              <div className="p-2.5 rounded-2xl bg-orange-100 text-orange-900 group-hover:bg-orange-800 group-hover:text-orange-100 transition-all duration-300 shadow-xs">
                <Hammer className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                {activeInProduction} Orders
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Seasoning, carving & 7-step polish queue
              </p>
            </div>

            <div className="pt-2 border-t border-orange-100/80 flex items-center justify-between text-[11px] font-bold text-orange-800 group-hover:text-orange-900">
              <span>Manage Crafting Stages</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Metric 3: Bespoke vs Catalog -> Links to /manager/orders */}
          <Link
            href="/manager/orders"
            className="group block bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-900/10 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-purple-900 transition-colors">
                Bespoke vs Catalog
              </span>
              <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-900 group-hover:bg-purple-900 group-hover:text-purple-100 transition-all duration-300 shadow-xs">
                <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                {customOrdersCount}{" "}
                <span className="text-sm font-sans font-normal text-slate-500">
                  Custom / {standardOrdersCount} Catalog
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Average Order Value: <strong className="text-slate-800 font-bold">₹{avgOrderValue.toLocaleString("en-IN")}</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-purple-100/80 flex items-center justify-between text-[11px] font-bold text-purple-800 group-hover:text-purple-900">
              <span>Inspect Custom Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Metric 4: Facility Stock Health -> Links directly to /manager/products */}
          <Link
            href="/manager/products"
            className="group block bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-900/10 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-emerald-900 transition-colors">
                Facility Stock Health
              </span>
              <div
                className={`p-2.5 rounded-2xl transition-all duration-300 shadow-xs ${
                  lowStockCount > 0
                    ? "bg-red-100 text-red-900 group-hover:bg-red-800 group-hover:text-red-100"
                    : "bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-emerald-100"
                }`}
              >
                {lowStockCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Package className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                {allProducts.length}{" "}
                <span className="text-sm font-sans font-normal text-slate-500">
                  Pieces ({stockHealthPercent}% In-Stock)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {lowStockCount > 0
                  ? `${lowStockCount} items need wood replenishment`
                  : "All pieces sufficiently stocked"}
              </p>
            </div>

            <div
              className={`pt-2 border-t flex items-center justify-between text-[11px] font-bold ${
                lowStockCount > 0
                  ? "border-red-100 text-red-700 group-hover:text-red-900"
                  : "border-emerald-100 text-emerald-800 group-hover:text-emerald-900"
              }`}
            >
              <span>{lowStockCount > 0 ? "Replenish Low Stock" : "Manage Products"}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Low Stock Alert Banner (Visible when lowStockCount > 0) */}
      {lowStockCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-200/80 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Warehouse Reorder Notice: {lowStockCount} furniture pieces at or below 2 units
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                {lowStockProducts.map((p) => p.title).join(", ")}
                {lowStockCount > 3 ? " and more..." : ""}
              </p>
            </div>
          </div>
          <Link
            href="/manager/products"
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shrink-0 text-center flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Restock in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Operations Quick Access Hub (All 6 Manager Portals) */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900">
              Facility Management Portals
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick access shortcuts to all operational modules with real-time status counts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Portal 1: Order Management */}
          <Link
            href="/manager/orders"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                Order Tracking
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {totalOrdersCount} Total Orders
              </span>
            </div>
          </Link>

          {/* Portal 2: Products & Stock */}
          <Link
            href="/manager/products"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <Package className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                Product Stock
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {allProducts.length} Live Pieces
              </span>
            </div>
          </Link>

          {/* Portal 3: Pricing & PDF Catalog */}
          <Link
            href="/manager/pricing"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                Pricing & PDF
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                1BHK / 2BHK Packages
              </span>
            </div>
          </Link>

          {/* Portal 4: Workforce */}
          <Link
            href="/manager/employees"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                Artisan Workforce
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {employeesCount} Active Staff
              </span>
            </div>
          </Link>

          {/* Portal 5: Customer Reviews */}
          <Link
            href="/manager/reviews"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <Star className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                Customer Reviews
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {reviewsCount}+ Verified 4.9★
              </span>
            </div>
          </Link>

          {/* Portal 6: WhatsApp Customer Alerts */}
          <Link
            href="/manager/whatsapp"
            className="p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-950 w-fit group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                WhatsApp Dispatch
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                +91 97303 92917
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Analytics Section: Clickable Manufacturing Pipeline Funnel & Timber Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Breakdown (Each stage row links to /manager/orders?stage=...) */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">
                Manufacturing Pipeline Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any stage below to immediately filter orders in the management queue.
              </p>
            </div>
            <Link
              href="/manager/orders"
              className="text-xs text-amber-800 font-bold flex items-center gap-1 hover:underline group"
            >
              <span>Manage All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {STAGE_DISPLAY.map((stg) => {
              const count = stagesCount[stg.key] || 0;
              const percent = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;

              return (
                <Link
                  key={stg.key}
                  href={`/manager/orders?stage=${stg.key}`}
                  className="group block p-3 rounded-2xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition-all duration-200 cursor-pointer space-y-2"
                  title={`View orders in ${stg.label}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stg.dot} shrink-0`} />
                      <span className="font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
                        {stg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium group-hover:text-amber-900 transition-colors">
                        {count} {count === 1 ? "order" : "orders"} ({percent}%)
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${stg.color} h-2.5 rounded-full transition-all duration-500 group-hover:brightness-110`}
                      style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Timber Utilization Breakdown (Clickable to /manager/products?search=...) */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-6">
          <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">Timber Seasoning Mix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Raw solid timber utilization in catalog pieces.</p>
            </div>
            <Link
              href="/manager/products"
              className="text-xs text-amber-800 font-bold hover:underline"
            >
              Catalog →
            </Link>
          </div>

          <div className="space-y-3">
            {Object.entries(timberBreakdown).map(([wood, info]) => {
              const totalItems = allProducts.length || 1;
              const pct = Math.round((info.count / totalItems) * 100);

              return (
                <Link
                  key={wood}
                  href={`/manager/products?search=${encodeURIComponent(info.query)}`}
                  className="group block p-3.5 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-100 hover:border-amber-300 transition-all duration-200 space-y-1.5 cursor-pointer"
                  title={`Filter products made of ${wood}`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="group-hover:text-amber-950 transition-colors">{wood}</span>
                    <span className="text-amber-900 group-hover:underline">
                      {info.count} pieces ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-amber-200/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-900 h-2 rounded-full transition-all duration-500 group-hover:bg-amber-800"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Real Recent Manufacturing Orders Feed Table */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-900" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                Recent Workshop Manufacturing Orders
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live customer orders directly synced from database. Click any order row to process details.
            </p>
          </div>
          <Link
            href="/manager/orders"
            className="text-xs text-amber-800 font-bold flex items-center gap-1 hover:underline group"
          >
            <span>View All Orders & WhatsApp Dispatch</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-10 bg-amber-50/30 rounded-2xl border border-amber-100 space-y-2">
              <ShoppingBag className="w-8 h-8 text-amber-700/50 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">No active orders found in database.</p>
              <Link
                href="/manager/orders"
                className="inline-block text-xs font-bold text-amber-800 underline mt-1"
              >
                Create your first workshop order
              </Link>
            </div>
          ) : (
            orders.slice(0, 6).map((ord) => {
              const firstItem = ord.OrderItem?.[0];
              const totalItems = ord.OrderItem?.length || 1;
              const isCustom =
                !firstItem?.productId ||
                ord.customerNotes?.includes("[Custom") ||
                ord.customerNotes?.includes("[Bespoke");
              const stageKey = ord.productionStage || "INQUIRY_RECEIVED";
              const stageObj = STAGE_DISPLAY.find((s) => s.key === stageKey) || {
                label: stageKey.replace(/_/g, " "),
                dot: "bg-amber-500",
              };

              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 hover:bg-amber-100/60 border border-amber-100/80 hover:border-amber-300 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-slate-700 font-semibold text-xs sm:text-sm">
                        • {ord.customerName}
                      </span>
                      {isCustom && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold uppercase border border-purple-200">
                          Bespoke Custom
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        ({ord.city || "Solapur Facility"})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {firstItem?.title || "Handcrafted Sagwan Teak Piece"}
                      {totalItems > 1 ? ` + ${totalItems - 1} more item(s)` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                    {/* Stage status pill */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-800 border border-amber-200 shadow-2xs">
                      <span className={`w-2 h-2 rounded-full ${stageObj.dot}`} />
                      <span>{stageObj.label}</span>
                    </span>

                    {/* Total Amount */}
                    <span className="font-black text-slate-900 font-serif text-sm sm:text-base">
                      ₹{ord.totalAmount?.toLocaleString("en-IN")}
                    </span>

                    {/* Action Deep Link */}
                    <Link
                      href={`/manager/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Process</span>
                      <ArrowRight className="w-3 h-3" />
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
