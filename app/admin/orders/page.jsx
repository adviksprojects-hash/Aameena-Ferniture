"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, RefreshCw, Truck, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { getOrders, updateOrderStage } from "@/actions/orderActions";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

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
      setMessage({ type: "success", text: `Order updated to "${stage.replace(/_/g, " ")}"` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update order stage." });
    }
    setUpdatingId(null);
  };

  const STAGE_OPTIONS = [
    { value: "INQUIRY_RECEIVED", label: "Inquiry Received", status: "PENDING" },
    { value: "TIMBER_SELECTION", label: "1. Timber Selection", status: "IN_PRODUCTION" },
    { value: "CARVING_JOINERY", label: "2. Carving & Joinery", status: "IN_PRODUCTION" },
    { value: "SEVEN_STEP_POLISHING", label: "3. 7-Step Polishing", status: "IN_PRODUCTION" },
    { value: "QUALITY_INSPECTION", label: "4. Quality Inspection", status: "IN_PRODUCTION" },
    { value: "DISPATCHED_WHITE_GLOVE", label: "5. Dispatched (White-Glove)", status: "SHIPPED" },
    { value: "DELIVERED", label: "6. Delivered & Installed", status: "DELIVERED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Dispatch Center</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Master Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor all furniture crafting stages, update delivery status, and track invoices in PostgreSQL.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
          title="Refresh database records"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Crafting Stage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Fetching orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No orders registered yet.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div>{ord.orderNumber}</div>
                        {ord.trackingNumber && (
                          <div className="text-[10px] text-amber-400 font-mono">{ord.trackingNumber}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{ord.customerName}</span>
                        <span className="text-slate-500 text-[10px]">{ord.customerPhone || ord.customerEmail}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {ord.city || "Mumbai"}
                      </td>
                      <td className="p-4 font-bold text-white">₹{ord.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="text-amber-400 font-medium capitalize">
                          {currentStage.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : ord.status === "SHIPPED"
                              ? "bg-blue-950 text-blue-400 border border-blue-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          disabled={isUpdating}
                          value={currentStage}
                          onChange={(e) => {
                            const selected = STAGE_OPTIONS.find((s) => s.value === e.target.value);
                            handleUpdate(ord.id, e.target.value, selected?.status || ord.status);
                          }}
                          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {STAGE_OPTIONS.map((opt) => (
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
