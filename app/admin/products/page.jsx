"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Trash2, Search, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { getProducts, createProduct, deleteProduct } from "@/actions/productActions";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    categorySlug: "living",
    woodType: "Grade-A Sagwan Teak",
    price: "",
    compareAtPrice: "",
    stock: "5",
    dimensions: "Standard Dimensions",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    finishType: "Natural Teak Honey Polish",
  });

  const loadProducts = async () => {
    setLoading(true);
    const res = await getProducts();
    if (res.success) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const res = await createProduct({
      ...newProduct,
      images: [newProduct.imageUrl],
    });

    if (res.success) {
      setMessage({ type: "success", text: "Product added to catalog and synchronized with database!" });
      setShowAddModal(false);
      setNewProduct({
        title: "",
        categorySlug: "living",
        woodType: "Grade-A Sagwan Teak",
        price: "",
        compareAtPrice: "",
        stock: "5",
        dimensions: "Standard Dimensions",
        description: "",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        finishType: "Natural Teak Honey Polish",
      });
      await loadProducts();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add product." });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setMessage({ type: "success", text: "Product removed from database." });
      setProducts(products.filter((p) => p.id !== id));
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete product." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Live PostgreSQL Inventory</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Product Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add new furniture items, adjust stock counts, and synchronize live with your storefront and showroom manager hubs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
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

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Wood & Finish</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading products from Neon DB...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No products found in database. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      {prod.images?.[0] && (
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                        />
                      )}
                      <div>
                        <span className="block">{prod.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{prod.dimensions || "Standard"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-amber-400 font-semibold">{prod.Category?.name || "General"}</td>
                    <td className="p-4 text-slate-300">
                      <div>{prod.woodType}</div>
                      <div className="text-[10px] text-slate-500">{prod.finishType}</div>
                    </td>
                    <td className="p-4 font-bold text-white">
                      ₹{prod.price.toLocaleString()}
                      {prod.compareAtPrice && (
                        <span className="text-[10px] text-slate-500 line-through ml-1.5">
                          ₹{prod.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.stock > 0 ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} in stock` : "Sold Out"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(prod.id, prod.title)}
                        className="p-2 bg-red-950/60 hover:bg-red-900 rounded-lg text-red-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-white">Add New Handcrafted Furniture</h3>
            <p className="text-xs text-slate-400">Creates a persistent database record synchronized across all portals.</p>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Furniture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Teak 7-Seater Sofa Suite"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category *</label>
                  <select
                    value={newProduct.categorySlug}
                    onChange={(e) => setNewProduct({ ...newProduct, categorySlug: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="living">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="dining">Dining Room</option>
                    <option value="office">Office & Study</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Wood Material *</label>
                  <select
                    value={newProduct.woodType}
                    onChange={(e) => setNewProduct({ ...newProduct, woodType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Grade-A Sagwan Teak">Grade-A Sagwan Teak</option>
                    <option value="Solid Sheesham Hardwood">Solid Sheesham Hardwood</option>
                    <option value="Indian Rosewood">Indian Rosewood</option>
                    <option value="American Walnut">American Walnut</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="85000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="110000"
                    value={newProduct.compareAtPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Stock Level *</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="78L x 36W x 34H inches"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Artisanal solid wood construction, 40D foam cushioning..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
