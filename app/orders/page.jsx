"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, FileText, Search, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const [orderId, setOrderId] = useState("");

  const sampleOrders = [
    {
      id: "ORD-2026-9812",
      date: "September 24, 2026",
      items: ["Royal Teak Wood 7-Seater Sofa Set"],
      total: "₹85,000",
      status: "In Transit",
      statusStep: 3,
      estimatedDelivery: "October 05, 2026",
      deliveryAddress: "Green Park Avenue, Block C, Villa 12",
    },
    {
      id: "ORD-2026-8745",
      date: "August 12, 2026",
      items: ["Imperial Handcarved King Bed with Storage"],
      total: "₹62,500",
      status: "Delivered",
      statusStep: 4,
      estimatedDelivery: "August 18, 2026",
      deliveryAddress: "Green Park Avenue, Block C, Villa 12",
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Management</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Track Your Furniture Order</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl">
          Enter your Order ID below or check your recent custom furniture dispatches and live delivery progress.
        </p>

        {/* Order Search */}
        <div className="pt-4 max-w-xl relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Enter Order ID (e.g. ORD-2026-9812)..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif text-slate-900">Recent Furniture Orders</h2>

        <div className="space-y-6">
          {sampleOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 lg:p-8 border border-amber-200/70 shadow-sm space-y-6">
              
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-serif text-slate-900">{order.id}</span>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Placed on {order.date}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900">{order.total}</span>
                  <p className="text-xs text-slate-500">Est. Delivery: {order.estimatedDelivery}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">Delivery Status Timeline:</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className={`p-2 rounded-xl ${order.statusStep >= 1 ? "bg-amber-800 text-amber-50" : "bg-slate-100 text-slate-400"}`}>
                    1. Confirmed
                  </div>
                  <div className={`p-2 rounded-xl ${order.statusStep >= 2 ? "bg-amber-800 text-amber-50" : "bg-slate-100 text-slate-400"}`}>
                    2. Wood Crafting
                  </div>
                  <div className={`p-2 rounded-xl ${order.statusStep >= 3 ? "bg-amber-800 text-amber-50" : "bg-slate-100 text-slate-400"}`}>
                    3. In Transit
                  </div>
                  <div className={`p-2 rounded-xl ${order.statusStep >= 4 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    4. Installed
                  </div>
                </div>
              </div>

              {/* Items & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Ordered Furniture:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 font-medium">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Delivery Address:</span>
                  <p className="text-slate-600 font-medium">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Download PDF Invoice
                </button>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors"
                >
                  Need Help / Contact Showroom Manager
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
