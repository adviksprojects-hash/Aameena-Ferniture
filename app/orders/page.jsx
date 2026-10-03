"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, FileText, Search, RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { getOrders, trackOrderByToken } from "@/actions/orderActions";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);

  const loadInitialOrders = async () => {
    setLoading(true);
    const res = await getOrders();
    if (res.success) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInitialOrders();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchedOrder(null);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);

    const res = await trackOrderByToken(searchQuery);
    if (res.success) {
      setSearchedOrder(res.data);
    } else {
      setSearchedOrder(null);
      setSearchError(res.error || "Order not found");
    }
    setSearching(false);
  };

  const getStageStep = (stage) => {
    switch (stage) {
      case "TIMBER_SELECTION":
        return 1;
      case "CARVING_JOINERY":
        return 2;
      case "SEVEN_STEP_POLISHING":
        return 3;
      case "QUALITY_INSPECTION":
        return 4;
      case "DISPATCHED_WHITE_GLOVE":
        return 5;
      case "DELIVERED":
        return 6;
      default:
        return 1;
    }
  };

  const STAGES = [
    { num: 1, label: "Timber Seasoning" },
    { num: 2, label: "Hand Carving" },
    { num: 3, label: "7-Step Polish" },
    { num: 4, label: "Inspection" },
    { num: 5, label: "Out for Setup" },
  ];

  const displayedOrders = searchedOrder ? [searchedOrder] : orders;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Live Workshop Tracking</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Track Your Handcrafted Furniture</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
          Follow your bespoke furniture through our 7 artisanal crafting stages from raw Sagwan timber seasoning to
          white-glove installation.
        </p>

        {/* Live Search Bar */}
        <form onSubmit={handleSearch} className="pt-4 max-w-xl relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="Enter Order # or Tracking Code (e.g. AF-2026-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
          >
            {searching ? "Searching..." : "Track"}
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {searchedOrder ? `Search Result for "${searchQuery}"` : "Active Custom Orders"}
          </h2>
          {searchedOrder && (
            <button
              onClick={() => {
                setSearchedOrder(null);
                setSearchQuery("");
              }}
              className="text-xs font-bold text-amber-900 hover:underline"
            >
              Show All Orders
            </button>
          )}
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-slate-600 text-xs font-medium">Fetching orders from workshop database...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4">
            <p className="text-slate-600 text-base font-medium">No orders matched your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => {
              const currentStep = getStageStep(order.productionStage);
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 lg:p-8 border border-amber-200/70 shadow-sm space-y-6"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-serif text-slate-900">{order.orderNumber}</span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Placed on {formattedDate} • Client: {order.customerName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                      <p className="text-xs text-slate-500">Destination: {order.city || "Mumbai"}</p>
                    </div>
                  </div>

                  {/* 5-Step Progress Timeline */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-700">Artisanal Production Timeline:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                      {STAGES.map((s) => {
                        const isDoneOrCurrent = currentStep >= s.num;
                        const isCurrent = currentStep === s.num;

                        return (
                          <div
                            key={s.num}
                            className={`p-2.5 rounded-xl transition-all ${
                              isCurrent
                                ? "bg-amber-900 text-amber-50 shadow-md ring-2 ring-amber-500/50"
                                : isDoneOrCurrent
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <span className="block text-[10px] opacity-75">Step 0{s.num}</span>
                            <span>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items & Shipping */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Custom Furniture Specs:</span>
                      <p className="text-slate-600 font-medium">
                        {order.customerNotes || "Handcrafted Sagwan teak structure with custom joinery."}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-slate-500 mt-1 text-[11px]">
                          Dispatch Tracking ID: <span className="font-mono font-bold text-slate-800">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Delivery Destination:</span>
                      <p className="text-slate-600 font-medium">{order.shippingAddress || "Showroom Pickup"}</p>
                      <p className="text-slate-500 text-[11px] mt-1">Phone: {order.customerPhone || "On file"}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <a
                      href={`https://wa.me/919876500001?text=Hi%20Aameena%20Furniture,%20checking%20status%20for%20order%20${order.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Message Showroom on WhatsApp
                    </a>

                    <Link
                      href="/contact"
                      className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-colors"
                    >
                      Need Carpenter Modification / Help
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
