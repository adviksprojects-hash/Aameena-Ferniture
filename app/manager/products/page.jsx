"use client";

import { useState } from "react";
import { Package, Edit, CheckCircle2 } from "lucide-react";

export default function ManagerProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "Royal Teak Wood 7-Seater Sofa Set", price: 85000, stock: 14, inStock: true },
    { id: 2, name: "Imperial Handcarved King Bed", price: 62500, stock: 8, inStock: true },
    { id: 3, name: "Monarch 6-Seater Dining Suite", price: 54000, stock: 12, inStock: true },
  ]);

  const toggleStock = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Listings</span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager Product & Pricing Control</h1>
        <p className="text-xs text-slate-600 mt-1">Update branch product stock availability and display pricing.</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
            <tr>
              <th className="p-4">Furniture Name</th>
              <th className="p-4">Display Price (₹)</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Toggle In-Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-amber-50/50">
                <td className="p-4 font-bold text-slate-900">{p.name}</td>
                <td className="p-4 font-bold text-slate-900">₹{p.price.toLocaleString()}</td>
                <td className="p-4 font-semibold text-slate-700">{p.stock} Available</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    p.inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {p.inStock ? "Available in Showroom" : "Temporarily Sold Out"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStock(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-bold text-[10px]"
                  >
                    Toggle Availability
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
