"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShoppingBag,
  RefreshCw,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Filter,
  ArrowRight,
  ChevronRight,
  Shield,
  Briefcase,
  Star,
  ExternalLink,
} from "lucide-react";
import { getSalesAnalytics } from "@/actions/orderActions";

const STAGE_LABELS = {
  INQUIRY_RECEIVED: "Inquiry & 3D Drafting",
  TIMBER_SELECTION: "Timber Selection & Seasoning",
  CARVING_JOINERY: "Joinery & Framing",
  SEVEN_STEP_POLISHING: "7-Step PU Polishing",
  QUALITY_INSPECTION: "Quality Inspection",
  DISPATCHED_WHITE_GLOVE: "White-Glove Dispatch",
  DELIVERED: "Installed & Delivered",
};

export default function AnalyticsManagementView({ userRole = "ADMIN" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("6m"); // '30d' | '6m' | '1y'
  const [metricView, setMetricView] = useState("revenue"); // 'revenue' | 'orders'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getSalesAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalRev = data?.totalRevenue || 0;
  const realizedRev = data?.realizedRevenue || 0;
  const pipelineRev = data?.pipelineRevenue || 0;
  const aov = data?.avgOrderValue || 0;
  const totalOrders = data?.totalOrdersCount || 0;
  const delivered = data?.deliveredCount || 0;
  const inProd = data?.inProductionCount || 0;
  const cancelled = data?.cancelledCount || 0;
  const fulfillmentRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

  // Filter timeline points by timeframe
  const timelinePoints = useMemo(() => {
    const raw = data?.monthlyTimeline || [];
    if (timeframe === "30d") return raw.slice(-2);
    if (timeframe === "6m") return raw.slice(-6);
    return raw;
  }, [data?.monthlyTimeline, timeframe]);

  // SVG Chart Calculations
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = useMemo(() => {
    if (!timelinePoints.length) return 100000;
    const values = timelinePoints.map((p) => (metricView === "revenue" ? p.revenue : p.orders));
    const highest = Math.max(...values, 10);
    return Math.ceil(highest * 1.15);
  }, [timelinePoints, metricView]);

  const svgPoints = useMemo(() => {
    if (!timelinePoints.length) return [];
    const count = timelinePoints.length;
    const stepX = (chartWidth - paddingX * 2) / Math.max(1, count - 1);
    const usableH = chartHeight - paddingY * 2;

    return timelinePoints.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const val = metricView === "revenue" ? p.revenue : p.orders;
      const y = chartHeight - paddingY - (val / maxVal) * usableH;
      return { x, y, data: p };
    });
  }, [timelinePoints, maxVal, metricView]);

  const pathD = useMemo(() => {
    if (svgPoints.length === 0) return "";
    return svgPoints.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic curve
      const prev = svgPoints[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, "");
  }, [svgPoints]);

  const areaD = useMemo(() => {
    if (svgPoints.length === 0) return "";
    const first = svgPoints[0];
    const last = svgPoints[svgPoints.length - 1];
    const baseLine = chartHeight - paddingY;
    return `${pathD} L ${last.x} ${baseLine} L ${first.x} ${baseLine} Z`;
  }, [pathD, svgPoints]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!data?.recentOrders || data.recentOrders.length === 0) {
      alert("No order ledger data available to export.");
      return;
    }
    const headers = ["Order Number", "Customer Name", "Customer Phone", "City", "Amount (INR)", "Stage", "Status", "Date"];
    const rows = data.recentOrders.map((o) => [
      o.orderNumber,
      `"${o.customerName?.replace(/"/g, '""')}"`,
      o.customerPhone || "N/A",
      o.city || "Solapur",
      o.totalAmount || 0,
      o.productionStage || "INQUIRY_RECEIVED",
      o.status || "PENDING",
      new Date(o.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aameena_furniture_sales_analysis_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* ── Page Header & Controls ── */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              {userRole === "ADMIN" ? "Super Admin Executive ERP" : "Operations & Production Intelligence"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Sales &amp; Production Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Real-time revenue trajectories, hardwood consumption mix, 7-stage carpentry velocity, and showroom regional fulfillment.
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
            title="Download CSV Ledger"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
            title="Print Executive Summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={loadAnalytics}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer shadow-md"
            title="Recalculate live from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-center py-20 text-slate-500 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-sm font-semibold text-slate-300">Calculating real-time analytics from PostgreSQL database...</p>
          <p className="text-xs text-slate-500">Aggregating Sagwan Teak orders, production stages, and financial ledger.</p>
        </div>
      ) : (
        <>
          {/* ── TOP 4 KPI CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Total Orders Revenue */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2.5 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Orders Revenue</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                ₹{totalRev.toLocaleString()}
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{totalOrders} Orders Placed</span>
                </span>
                <span className="text-slate-500 text-[11px]">Gross Volume</span>
              </div>
            </div>

            {/* 2. Delivered & Installed Revenue */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2.5 relative overflow-hidden shadow-lg group hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Realized Revenue</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-serif tracking-tight">
                ₹{realizedRev.toLocaleString()}
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-emerald-300 font-semibold">
                  {delivered} Installed at Homes
                </span>
                <span className="text-slate-500 text-[11px]">{fulfillmentRate}% Fulfilled</span>
              </div>
            </div>

            {/* 3. In-Production Pipeline */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2.5 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Production WIP Pipeline</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif tracking-tight">
                ₹{pipelineRev.toLocaleString()}
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-amber-300 font-semibold">
                  {inProd} Units in Workshop
                </span>
                <span className="text-slate-500 text-[11px]">Solapur Facility</span>
              </div>
            </div>

            {/* 4. Average Order Value (AOV) */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2.5 relative overflow-hidden shadow-lg group hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Average Order Value</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                ₹{aov.toLocaleString()}
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-blue-400 font-semibold">
                  Ticket Size Benchmark
                </span>
                <span className="text-slate-500 text-[11px]">Solid Hardwood</span>
              </div>
            </div>
          </div>

          {/* ── INTERACTIVE ANALYTICAL GRAPH SECTION ── */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            {/* Graph Header & Interactive Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold font-serif text-white">
                    {metricView === "revenue" ? "Revenue Trajectory Curve (₹)" : "Order Volume Velocity (Units)"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Monthly performance trends, seasonal customer acquisitions, and delivery completions.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Metric Selector (Revenue vs Orders) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMetricView("revenue")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      metricView === "revenue"
                        ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Revenue (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricView("orders")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      metricView === "orders"
                        ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Orders (Qty)
                  </button>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  {[
                    { id: "30d", label: "30 Days" },
                    { id: "6m", label: "6 Months" },
                    { id: "1y", label: "12 Months" },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTimeframe(tf.id)}
                      className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                        timeframe === tf.id
                          ? "bg-slate-800 text-amber-300 font-bold border border-slate-700"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div className="relative w-full overflow-x-auto">
              <div className="min-w-[620px] relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                      <stop offset="70%" stopColor="#d97706" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingY + (chartHeight - paddingY * 2) * ratio;
                    const valAtLine = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.12)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          fill="#64748b"
                          fontSize="9"
                          textAnchor="end"
                          fontFamily="sans-serif"
                        >
                          {metricView === "revenue" ? `₹${(valAtLine / 1000).toFixed(0)}k` : valAtLine}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                  {/* Smooth curve stroke */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#strokeGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data Points */}
                  {svgPoints.map((pt, idx) => {
                    const isHovered = hoveredPoint === idx;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Hover vertical guide */}
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={paddingY}
                            x2={pt.x}
                            y2={chartHeight - paddingY}
                            stroke="rgba(245, 158, 11, 0.45)"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Outer glow ring */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : 4}
                          fill="#f59e0b"
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 3.5 : 2}
                          fill="#ffffff"
                        />

                        {/* X-Axis Month label */}
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          fill={isHovered ? "#fde047" : "#94a3b8"}
                          fontSize="10"
                          fontWeight={isHovered ? "bold" : "normal"}
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {pt.data.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip */}
                {hoveredPoint !== null && svgPoints[hoveredPoint] && (
                  <div
                    className="absolute pointer-events-none p-3 rounded-xl bg-slate-900 border border-amber-500/50 shadow-2xl text-xs space-y-1 z-20"
                    style={{
                      left: `${(svgPoints[hoveredPoint].x / chartWidth) * 100}%`,
                      top: `${Math.max(10, svgPoints[hoveredPoint].y - 75)}px`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <p className="font-bold text-amber-300 font-serif">
                      {svgPoints[hoveredPoint].data.label}
                    </p>
                    <div className="flex items-center justify-between gap-4 text-slate-300">
                      <span>Total Revenue:</span>
                      <strong className="text-white">
                        ₹{svgPoints[hoveredPoint].data.revenue?.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
                      <span>Delivered Units:</span>
                      <span className="text-emerald-400 font-semibold">
                        {svgPoints[hoveredPoint].data.orders} orders
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 2-COLUMN BREAKDOWN: Category Revenue Share & Hardwood Demand ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Category Revenue Share */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2 text-white font-bold font-serif text-base">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Revenue by Furniture Category</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  PostgreSQL Aggregation
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {(data?.categoryAnalytics || []).length === 0 ? (
                  <p className="text-slate-500 py-6 text-center">No category breakdown data available yet.</p>
                ) : (
                  data.categoryAnalytics.map((cat, idx) => {
                    const percentage = totalRev > 0 ? Math.round((cat.amount / totalRev) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-slate-300 font-semibold">
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                idx === 0
                                  ? "bg-amber-400"
                                  : idx === 1
                                  ? "bg-emerald-400"
                                  : idx === 2
                                  ? "bg-blue-400"
                                  : "bg-purple-400"
                              }`}
                            />
                            <span>{cat.category}</span>
                          </span>
                          <span className="text-amber-400 font-mono">
                            {percentage}% (₹{cat.amount.toLocaleString()})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              idx === 0
                                ? "bg-amber-500"
                                : idx === 1
                                ? "bg-emerald-500"
                                : idx === 2
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(6, percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Client Timber & Wood Species Preferences */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2 text-white font-bold font-serif text-base">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <span>Client Hardwood &amp; Timber Mix</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Sagwan Teak Benchmark
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {(data?.woodAnalytics || []).length === 0 ? (
                  <p className="text-slate-500 py-6 text-center">No timber preference data available yet.</p>
                ) : (
                  data.woodAnalytics.map((wood, idx) => {
                    const percentage = totalRev > 0 ? Math.round((wood.amount / totalRev) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-slate-300 font-semibold">
                          <span>{wood.wood}</span>
                          <span className="text-emerald-400 font-mono">
                            {percentage}% (₹{wood.amount.toLocaleString()})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, Math.max(6, percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── 7-STAGE CARPENTRY PRODUCTION FUNNEL ── */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold font-serif text-white">
                  7-Stage Carpentry Production Velocity &amp; Pipeline Funnel
                </h3>
              </div>
              <span className="text-xs text-slate-400">Solapur Facility Floor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(STAGE_LABELS).map(([stageKey, label], idx) => {
                const count = data?.stageCounts?.[stageKey] || 0;
                return (
                  <div
                    key={stageKey}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center group hover:border-amber-500/40 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      Stage 0{idx + 1}
                    </span>
                    <span className="text-2xl font-black text-white block">
                      {count}
                    </span>
                    <p className="text-[11px] text-slate-400 font-semibold leading-tight line-clamp-2">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SHOWROOM FACILITY & LOGISTICS STATUS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Primary Facility Dispatch</span>
              </div>
              <p className="text-lg font-bold font-serif text-white">Solapur Central Workshop</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                AMEENA Distributors’s Sofa Set Furniture Company, Solapur Facility. 100% of custom crafting and white-glove logistics originate here.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Showroom Floor Inventory</span>
              </div>
              <p className="text-lg font-bold font-serif text-white">
                {data?.totalCatalogStock || 0} Finished Units Available
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Across {data?.totalCatalogItems || 0} active catalog models in PostgreSQL with live stock decrement upon customer installation.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>Cancellations &amp; Quality Returns</span>
              </div>
              <p className="text-lg font-bold font-serif text-rose-400">
                {cancelled} Orders Cancelled
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cancelled > 0
                  ? "Inventory automatically restored when orders are cancelled."
                  : "0% return rate across all Sagwan Teak collections this month."}
              </p>
            </div>
          </div>

          {/* ── RECENT SALES & INVOICING LEDGER TABLE ── */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold font-serif text-white">
                Live Sales &amp; Invoicing Transaction Ledger
              </h3>
              <span className="text-xs text-slate-400">
                Showing latest verified customer orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-3.5">Order Number</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Item Spec</th>
                    <th className="p-3.5">City / Hub</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Production Stage</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(data?.recentOrders || []).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 font-bold text-white font-mono">{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ord.customerPhone}</div>
                      </td>
                      <td className="p-3.5 text-amber-400 truncate max-w-[180px]">
                        {ord.OrderItem?.[0]?.title || "Bespoke Sagwan Furniture"}
                      </td>
                      <td className="p-3.5 text-slate-300">{ord.city || "Solapur"}</td>
                      <td className="p-3.5 font-bold text-white font-mono">
                        ₹{ord.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold">
                          {STAGE_LABELS[ord.productionStage] || ord.productionStage?.replace(/_/g, " ") || "Inquiry"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : ord.status === "CANCELLED"
                              ? "bg-rose-950 text-rose-400 border-rose-800"
                              : "bg-amber-950 text-amber-400 border-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
