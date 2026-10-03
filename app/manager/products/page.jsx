"use client";

import { useState, useEffect } from "react";
import { Package, Plus, RefreshCw, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import { getProducts, toggleStockStatus, createProduct } from "@/actions/productActions";

export default function ManagerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

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

  const handleToggleStock = async (product) => {
    setUpdatingId(product.id);
    const res = await toggleStockStatus(product.id);
    if (res.success) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, stock: res.data.stock } : p))
      );
    }
    setUpdatingId(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const res = await createProduct({
      ...newProduct,
      images: [newProduct.imageUrl],
    });

    if (res.success) {
      setMessage({ type: "success", text: "Product added to showroom inventory and synchronized with database!" });
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
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add product." });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Showroom Inventory Control</span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager Product & Catalog Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Add new showroom furniture pieces, manage floor pricing, and toggle instant online stock availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-amber-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Showroom Product</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="p-4">Furniture Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Wood & Dimensions</th>
                <th className="p-4">Display Price (₹)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Floor Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                    Fetching showroom catalog from database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No products found in database. Click "Add Showroom Product" above.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const inStock = p.stock > 0;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded-lg border border-amber-200"
                          />
                        )}
                        <div>
                          <span className="block">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{p.finishType}</span>
                        </div>
                      </td>
                      <td className="p-4 text-amber-900 font-semibold">{p.Category?.name || "General"}</td>
                      <td className="p-4 text-slate-600">
                        <div>{p.woodType}</div>
                        <div className="text-[10px] text-slate-400">{p.dimensions || "Standard"}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">₹{p.price.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-slate-700">{p.stock} Available</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {inStock ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {inStock ? "In Showroom" : "Sold Out"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStock(p)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-lg text-white font-bold text-[10px] transition-colors disabled:opacity-50 ${
                            inStock ? "bg-amber-800 hover:bg-amber-900" : "bg-emerald-700 hover:bg-emerald-800"
                          }`}
                        >
                          {isUpdating ? "Updating..." : inStock ? "Mark Sold Out" : "Mark Available"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal for Manager */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Showroom Inventory Entry
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">Add New Showroom Furniture Piece</h3>
              <p className="text-xs text-slate-500 mt-1">
                Adds a new handcrafted piece to the store inventory and syncs live across online catalog and admin portals.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Furniture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Teak 6-Seater Dining Table"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <select
                    value={newProduct.categorySlug}
                    onChange={(e) => setNewProduct({ ...newProduct, categorySlug: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                  >
                    <option value="living">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="dining">Dining Room</option>
                    <option value="office">Office & Study</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Wood Material *</label>
                  <select
                    value={newProduct.woodType}
                    onChange={(e) => setNewProduct({ ...newProduct, woodType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
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
                  <label className="text-slate-700 font-bold block mb-1">Display Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="54000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="68000"
                    value={newProduct.compareAtPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Available Units *</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="72L x 36W x 30H inches"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Finish Type</label>
                <input
                  type="text"
                  placeholder="e.g. Natural Teak Honey Polish, Warm Walnut Satin"
                  value={newProduct.finishType}
                  onChange={(e) => setNewProduct({ ...newProduct, finishType: e.target.value })}
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Display Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description & Craft Notes</label>
                <textarea
                  rows="2"
                  placeholder="High-density foam, termite proofed teak structure..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all disabled:opacity-50 shadow-md"
                >
                  {submitting ? "Saving to Database..." : "Save Product to Showroom"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
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
