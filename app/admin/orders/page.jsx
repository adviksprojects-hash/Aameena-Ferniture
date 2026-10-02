"use client";

import { useState } from "react";
import { ShoppingBag, Eye, CheckCircle2, Truck, Clock } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-2026-9812", client: "Rajesh Sharma", phone: "+91 98765 12345", item: "Royal Teak 7-Seater Sofa", amount: "₹85,000", manager: "Suresh Manager", status: "In Transit" },
    { id: "ORD-2026-9811", client: "Meera Patel", phone: "+91 98123 45678", item: "Imperial King Bed", amount: "₹62,500", manager: "Vikram Manager", status: "Processing" },
    { id: "ORD-2026-9810", client: "Sunil Verma", phone: "+91 98987 65432", item: "Monarch 6-Seater Dining", amount: "₹54,000", manager: "Suresh Manager", status: "Delivered" },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Dispatch Center</span>
        <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Master Order Management</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor all furniture dispatches across store managers, update status, and track invoices.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Furniture Item</th>
                <th className="p-4">Assigned Manager</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-white">{ord.id}</td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{ord.client}</span>
                    <span className="text-slate-500 text-[10px]">{ord.phone}</span>
                  </td>
                  <td className="p-4 text-amber-400 font-semibold">{ord.item}</td>
                  <td className="p-4 text-slate-400">{ord.manager}</td>
                  <td className="p-4 font-bold text-white">{ord.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ord.status === "Delivered" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => updateStatus(ord.id, e.target.value)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Wood Crafting">Wood Crafting</option>
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
