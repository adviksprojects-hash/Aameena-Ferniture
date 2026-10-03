"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { getSalesAnalytics } from "@/actions/orderActions";

export default function AdminAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await getSalesAnalytics();
    if (res.success) {
      setData(res.data);
    }
    setLoading(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Business Intelligence & ERP</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Live Sales & Performance Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial metrics, hardwood material preferences, furniture category revenue, and order velocity.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
          title="Recalculate live from database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !data ? (
        <div className="text-center py-16 text-slate-500 bg-slate-950 rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
          <p>Calculating live analytics from Neon PostgreSQL orders...</p>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Orders Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                ₹{totalRev.toLocaleString()}
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Across {totalOrders} recorded orders</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Delivered & Realized</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-serif">
                ₹{realizedRev.toLocaleString()}
              </p>
              <div className="text-[11px] text-slate-400">
                <span>{delivered} orders completed & installed</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>In-Production Pipeline</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif">
                ₹{pipelineRev.toLocaleString()}
              </p>
              <div className="text-[11px] text-slate-400">
                <span>{inProd} orders currently being crafted</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Average Order Value</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                ₹{aov.toLocaleString()}
              </p>
              <div className="text-[11px] text-purple-400 font-semibold">
                <span>Fulfillment rate: {fulfillmentRate}%</span>
              </div>
            </div>
          </div>

          {/* Breakdown Section: Category Revenue & Hardwood Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Revenue Share */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2 text-white font-bold font-serif text-base">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Revenue by Furniture Category</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">PostgreSQL Aggregation</span>
              </div>

              <div className="space-y-4 text-xs">
                {(data?.categoryAnalytics || []).length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No category breakdown data available yet.</p>
                ) : (
                  data.categoryAnalytics.map((cat, idx) => {
                    const percentage = totalRev > 0 ? Math.round((cat.amount / totalRev) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-slate-300 font-semibold">
                          <span>{cat.category}</span>
                          <span className="text-amber-400">
                            {percentage}% (₹{cat.amount.toLocaleString()})
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0
                                ? "bg-amber-500"
                                : idx === 1
                                ? "bg-amber-600"
                                : idx === 2
                                ? "bg-amber-700"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Timber & Hardwood Preference */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2 text-white font-bold font-serif text-base">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <span>Client Timber & Wood Preferences</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Sagwan Teak / Hardwoods</span>
              </div>

              <div className="space-y-4 text-xs">
                {(data?.woodAnalytics || []).length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No timber preference data available yet.</p>
                ) : (
                  data.woodAnalytics.map((wood, idx) => {
                    const percentage = totalRev > 0 ? Math.round((wood.amount / totalRev) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-slate-300 font-semibold">
                          <span>{wood.wood}</span>
                          <span className="text-emerald-400">
                            {percentage}% (₹{wood.amount.toLocaleString()})
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Showroom Facility & Logistics Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Primary Facility Dispatch</span>
              </div>
              <p className="text-lg font-bold font-serif text-white">Solapur Central Workshop</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                AMEENA Distributors’s Sofa Set Furniture Company, Solapur. 100% of custom crafting and white-glove logistics originated here.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Showroom Floor Inventory</span>
              </div>
              <p className="text-lg font-bold font-serif text-white">
                {data?.totalCatalogStock || 0} Total Finished Units
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Across {data?.totalCatalogItems || 0} active catalog designs in the database with live stock decrement on delivery.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Ban className="w-4 h-4 text-red-400" />
                <span>Cancellations & Returns</span>
              </div>
              <p className="text-lg font-bold font-serif text-red-400">
                {cancelled} Orders Cancelled
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cancelled > 0 ? "Inventory automatically restored when orders are cancelled." : "Zero return rate this month."}
              </p>
            </div>
          </div>

          {/* Recent Orders Ledger Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-3 p-6">
            <h3 className="text-base font-bold font-serif text-white">Recent Sales & Invoicing Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Item Spec</th>
                    <th className="p-3">City / Hub</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(data?.recentOrders || []).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white">{ord.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500">{ord.customerPhone}</div>
                      </td>
                      <td className="p-3 text-amber-400 truncate max-w-[160px]">
                        {ord.OrderItem?.[0]?.title || "Bespoke Furniture"}
                      </td>
                      <td className="p-3 text-slate-300">{ord.city || "Solapur"}</td>
                      <td className="p-3 font-bold text-white">₹{ord.totalAmount?.toLocaleString()}</td>
                      <td className="p-3 text-slate-300 capitalize">
                        {ord.productionStage?.replace(/_/g, " ").toLowerCase() || "Inquiry"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : ord.status === "CANCELLED"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
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
