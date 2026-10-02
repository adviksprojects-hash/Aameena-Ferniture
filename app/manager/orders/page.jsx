"use client";

import { useState } from "react";
import { ShoppingBag, Truck, CheckCircle2, Phone, MessageSquare } from "lucide-react";

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-2026-9812", client: "Rajesh Sharma", phone: "+91 98765 12345", item: "Royal Teak 7-Seater Sofa", status: "In Transit" },
    { id: "ORD-2026-9810", client: "Sunil Verma", phone: "+91 98987 65432", item: "Monarch 6-Seater Dining Suite", status: "Ready for Delivery" },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Logistics</span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager Order Dispatch Control</h1>
        <p className="text-xs text-slate-600 mt-1">Update live order delivery status and notify customers on WhatsApp.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Furniture Item</th>
              <th className="p-4">Current Status</th>
              <th className="p-4 text-right">Update Order Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-amber-50/50">
                <td className="p-4 font-bold text-slate-900">{ord.id}</td>
                <td className="p-4">
                  <span className="font-bold text-slate-900 block">{ord.client}</span>
                  <span className="text-slate-500 text-[10px]">{ord.phone}</span>
                </td>
                <td className="p-4 text-amber-900 font-semibold">{ord.item}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {ord.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={ord.status}
                    onChange={(e) => updateStatus(ord.id, e.target.value)}
                    className="bg-amber-50 text-slate-900 border border-amber-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Wood Crafting">Wood Crafting</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered & Installed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
