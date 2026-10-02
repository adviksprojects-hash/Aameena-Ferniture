"use client";

import { useState } from "react";
import { Package, Plus, Edit, Trash2, Search, Filter, CheckCircle2 } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "Royal Teak Wood 7-Seater Sofa Set", category: "Living Room", price: 85000, stock: 14, wood: "Grade-A Sagwan Teak" },
    { id: 2, name: "Imperial Handcarved King Bed", category: "Bedroom", price: 62500, stock: 8, wood: "Sheesham Hardwood" },
    { id: 3, name: "Monarch 6-Seater Dining Suite", category: "Dining Room", price: 54000, stock: 12, wood: "Solid Teak Wood" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Living Room", price: "", stock: "", wood: "Sagwan Teak" });

  const handleAddProduct = (e) => {
    e.preventDefault();
    setProducts([...products, { id: Date.now(), ...newProduct, price: parseInt(newProduct.price), stock: parseInt(newProduct.stock) }]);
    setShowAddModal(false);
    setNewProduct({ name: "", category: "Living Room", price: "", stock: "", wood: "Sagwan Teak" });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Inventory Control</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Product Management</h1>
          <p className="text-xs text-slate-400 mt-1">Add new furniture items, adjust stock count, and manage pricing across all stores.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Furniture Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Wood Material</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-white">{prod.name}</td>
                  <td className="p-4 text-amber-400 font-semibold">{prod.category}</td>
                  <td className="p-4 text-slate-400">{prod.wood}</td>
                  <td className="p-4 font-bold text-white">₹{prod.price.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-emerald-400">{prod.stock} units</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setProducts(products.filter(p => p.id !== prod.id))}
                      className="p-2 bg-red-950/60 hover:bg-red-900 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold font-serif text-white">Add New Furniture Listing</h3>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Furniture Title:</label>
                <input
                  type="text" required
                  placeholder="e.g. Royal Teak 5-Seater Sofa"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Category:</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Office">Office / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Price (₹):</label>
                  <input
                    type="number" required
                    placeholder="45000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Stock Quantity:</label>
                <input
                  type="number" required
                  placeholder="10"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Furniture</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
