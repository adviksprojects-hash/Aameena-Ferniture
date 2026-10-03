"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Truck, RefreshCw, MessageSquare, CheckCircle2 } from "lucide-react";
import { getOrders, updateOrderStage } from "@/actions/orderActions";

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await getOrders();
    if (res.success) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdate = async (orderId, stage, status) => {
    setUpdatingId(orderId);
    const res = await updateOrderStage(orderId, { stage, status });
    if (res.success) {
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, productionStage: stage, status } : o
        )
      );
    }
    setUpdatingId(null);
  };

  const openWhatsApp = (order) => {
    const phone = (order.customerPhone || "").replace(/[^0-9]/g, "");
    const msg = `Hello ${order.customerName}, your Aameena Furniture custom order #${order.orderNumber} is currently at stage: ${order.productionStage?.replace(/_/g, " ")}. Thank you for choosing us!`;
    window.open(`https://wa.me/${phone || "919876500001"}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const STAGES = [
    { value: "INQUIRY_RECEIVED", label: "Inquiry Received", status: "PENDING" },
    { value: "TIMBER_SELECTION", label: "Timber Seasoning", status: "IN_PRODUCTION" },
    { value: "CARVING_JOINERY", label: "Carving & Joinery", status: "IN_PRODUCTION" },
    { value: "SEVEN_STEP_POLISHING", label: "Polishing & Coating", status: "IN_PRODUCTION" },
    { value: "DISPATCHED_WHITE_GLOVE", label: "Out for Delivery", status: "SHIPPED" },
    { value: "DELIVERED", label: "Delivered & Installed", status: "DELIVERED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Logistics</span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager Order Dispatch Control</h1>
          <p className="text-xs text-slate-600 mt-1">
            Update live order production stage and notify clients on WhatsApp directly from the showroom.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
          title="Refresh database records"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Delivery City</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Current Stage</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4 text-right">Update Order Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                    Fetching orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No showroom orders registered.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-slate-500 text-[10px]">{ord.customerPhone || ord.customerEmail}</span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{ord.city || "Mumbai"}</td>
                      <td className="p-4 font-bold text-slate-900">₹{ord.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {currentStage.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openWhatsApp(ord)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Notify</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          disabled={isUpdating}
                          value={currentStage}
                          onChange={(e) => {
                            const opt = STAGES.find((s) => s.value === e.target.value);
                            handleUpdate(ord.id, e.target.value, opt?.status || ord.status);
                          }}
                          className="bg-amber-50 text-slate-900 border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {STAGES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
