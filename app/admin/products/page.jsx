"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Archive,
  RotateCcw,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Minus,
  MessageSquare,
  X,
  Edit3,
  ExternalLink,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
  restoreProduct,
  updateProductDisplayOptions,
  adjustProductStock,
  toggleProductVisibility,
} from "@/actions/productActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validateName, validateAmount } from "@/lib/validation";

const CATEGORY_OPTIONS = [
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining", label: "Dining Room" },
  { value: "office", label: "Office & Study" },
  { value: "outdoor", label: "Outdoor & Garden" },
  { value: "fabrics", label: "Loose Cloth & Fabrics" },
  { value: "custom", label: "Custom Artisanal Pieces" },
];

const WOOD_OPTIONS = [
  { value: "Grade-A Sagwan Teak", label: "Grade-A Sagwan Teak" },
  { value: "Solid Sheesham Hardwood", label: "Solid Sheesham Hardwood" },
  { value: "Indian Rosewood", label: "Indian Rosewood" },
  { value: "American Walnut", label: "American Walnut" },
  { value: "Steam Beechwood", label: "Steam Beechwood" },
  { value: "100% Pure Breathable Cotton", label: "100% Pure Breathable Cotton" },
  { value: "Textured Chenille-Cotton", label: "Textured Chenille-Cotton" },
  { value: "Royal Velvet Upholstery Cloth", label: "Royal Velvet Upholstery Cloth" },
  { value: "Turkish Floral Jacquard Fabric", label: "Turkish Floral Jacquard Fabric" },
];

const FINISH_OPTIONS = [
  { value: "Natural Teak Honey Polish", label: "Natural Teak Honey Polish" },
  { value: "Dark Walnut Matte Finish", label: "Dark Walnut Matte Finish" },
  { value: "High Gloss Melamine", label: "High Gloss Melamine" },
  { value: "Raw Antique Wax Polish", label: "Raw Antique Wax Polish" },
  { value: "Distressed White Wash", label: "Distressed White Wash" },
  { value: "Natural Soft Matte Weave", label: "Natural Soft Matte Weave" },
  { value: "Water-Repellent Velvet Sheen", label: "Water-Repellent Velvet Sheen" },
  { value: "Heritage Jacquard Woven Texture", label: "Heritage Jacquard Woven Texture" },
];

export default function AdminProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "archived"

  // Form error states
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Add Product State (Clean initial state without pre-selected defaults)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    categorySlug: "",
    woodType: "",
    materialPurity: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    dimensions: "",
    description: "",
    images: [],
    finishType: "",
    showInquiryBtn: true,
    showDetailsBtn: true,
  });

  // Edit Product State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductImages, setEditProductImages] = useState([]);

  const loadProducts = async () => {
    setLoading(true);
    const res = await getProducts();
    if (res.success) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadProducts();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (newProduct.images.length + files.length > 3) {
      alert("A maximum of 3 images can be uploaded per product.");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, reader.result].slice(0, 3),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameCheck = validateName(newProduct.title, "Product title", 3);
    if (!nameCheck.valid) errors.title = nameCheck.error;

    if (!newProduct.categorySlug || !newProduct.categorySlug.trim()) {
      errors.categorySlug = "Please select a product category.";
    }

    if (!newProduct.woodType || !newProduct.woodType.trim()) {
      errors.woodType = "Please select a wood or fabric material type.";
    }

    const priceCheck = validateAmount(newProduct.price, "Price");
    if (!priceCheck.valid) errors.price = priceCheck.error;

    const stockCheck = validateAmount(newProduct.stock, "Stock level");
    if (!stockCheck.valid) errors.stock = stockCheck.error;

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});

    if (newProduct.images.length === 0) {
      alert("Please upload at least 1 image from your device or camera (up to 3 images max).");
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const res = await createProduct({
      ...newProduct,
      images: newProduct.images,
    });

    if (res.success) {
      setMessage({ type: "success", text: "Product added to catalog and synchronized with database!" });
      setShowAddModal(false);
      setNewProduct({
        title: "",
        categorySlug: "",
        woodType: "",
        materialPurity: "",
        price: "",
        compareAtPrice: "",
        stock: "",
        dimensions: "",
        description: "",
        images: [],
        finishType: "",
        showInquiryBtn: true,
        showDetailsBtn: true,
      });
      loadProducts();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create product" });
    }
    setSubmitting(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (prod) => {
    setEditErrors({});
    setEditingProduct({
      id: prod.id,
      title: prod.title,
      categorySlug: prod.Category?.slug || "living",
      woodType: prod.woodType || "Grade-A Sagwan Teak",
      materialPurity: prod.materialPurity || "",
      finishType: prod.finishType || "Natural Teak Honey Polish",
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || "",
      stock: prod.stock,
      dimensions: prod.dimensions || "",
      description: prod.description || "",
      showInquiryBtn: prod.showInquiryBtn !== false,
      showDetailsBtn: prod.showDetailsBtn !== false,
    });
    setEditProductImages(Array.isArray(prod.images) ? [...prod.images] : []);
    setShowEditModal(true);
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (editProductImages.length + files.length > 3) {
      alert("A maximum of 3 images can be uploaded per product.");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProductImages((prev) => [...prev, reader.result].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditImage = (index) => {
    setEditProductImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameCheck = validateName(editingProduct.title, "Product title", 3);
    if (!nameCheck.valid) errors.title = nameCheck.error;

    const priceCheck = validateAmount(editingProduct.price, "Price");
    if (!priceCheck.valid) errors.price = priceCheck.error;

    const stockCheck = validateAmount(editingProduct.stock, "Stock level");
    if (!stockCheck.valid) errors.stock = stockCheck.error;

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    if (editProductImages.length === 0) {
      alert("Please keep at least 1 image for the product (up to 3 max).");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await updateProduct(editingProduct.id, {
      ...editingProduct,
      images: editProductImages,
    });

    if (res.success) {
      setMessage({ type: "success", text: `Product "${editingProduct.title}" updated successfully in database!` });
      setShowEditModal(false);
      loadProducts();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update product details." });
    }
    setSubmitting(false);
  };

  const handleArchive = async (productId, title) => {
    if (!confirm(`Are you sure you want to archive "${title}"? It will be hidden from the public store catalog.`)) return;
    const res = await archiveProduct(productId);
    if (res.success) {
      setMessage({ type: "success", text: `Product "${title}" moved to archive.` });
      loadProducts();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to archive product." });
    }
  };

  const handleRestore = async (productId, title) => {
    const res = await restoreProduct(productId);
    if (res.success) {
      setMessage({ type: "success", text: `Product "${title}" restored to active catalog.` });
      loadProducts();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to restore product." });
    }
  };

  const handleStockDelta = async (productId, delta) => {
    const res = await adjustProductStock(productId, delta);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: res.newStock } : p))
      );
      setMessage({ type: "success", text: `Stock updated to ${res.newStock} units.` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to adjust stock." });
    }
  };

  const handleToggleStoreVisibility = async (prod) => {
    const res = await toggleProductVisibility(prod.id);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isArchived: res.isArchived } : p))
      );
      setMessage({
        type: "success",
        text: res.isArchived
          ? `"${prod.title}" is now hidden from customer storefront.`
          : `"${prod.title}" is now LIVE on customer storefront!`,
      });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to toggle storefront visibility." });
    }
  };

  const handleToggleDisplay = async (productId, field, currentVal) => {
    const nextVal = !currentVal;
    const res = await updateProductDisplayOptions(productId, { [field]: nextVal });
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, [field]: nextVal } : p))
      );
    } else {
      alert(res.error || "Failed to update display option");
    }
  };

  const handleDelete = async (productId, title) => {
    if (!confirm(`Permanently delete "${title}"? This action cannot be undone.`)) return;
    const res = await deleteProduct(productId);
    if (res.success) {
      setMessage({ type: "success", text: `Product "${title}" deleted permanently.` });
      setProducts(products.filter((p) => p.id !== productId));
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete product." });
    }
  };

  const filteredProducts = products.filter((p) =>
    activeTab === "archived" ? p.isArchived === true : !p.isArchived
  );

  if (!mounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800" suppressHydrationWarning>
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Inventory Management</span>
            <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Product Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Add & edit furniture specifications, Device Photo Upload (1-3 camera images), configure inquiry/detail buttons, and Archive management.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 w-10 h-10" />
            <div className="px-5 py-2.5 rounded-xl bg-amber-500/70 w-36 h-10" />
          </div>
        </div>

        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-slate-950 border border-slate-800 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Loading Catalog Inventory & Specifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800" suppressHydrationWarning>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Inventory Management</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Product Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add & edit furniture specifications, Device Photo Upload (1-3 camera images), configure inquiry/detail buttons, and Archive management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            suppressHydrationWarning
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3" suppressHydrationWarning>
        <button
          suppressHydrationWarning
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "active"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Active Catalog ({products.filter((p) => !p.isArchived).length})</span>
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "archived"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived Products ({products.filter((p) => p.isArchived).length})</span>
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

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
          <table className="w-full text-left text-xs text-slate-300 min-w-[880px]">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Item & Photos</th>
                <th className="p-4">Category</th>
                <th className="p-4">Wood & Finish</th>
                <th className="p-4">Price & Stock</th>
                <th className="p-4">Button Visibility</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    {activeTab === "archived" ? "No archived products." : "No active products found."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="flex -space-x-3 overflow-hidden">
                        {(prod.images || []).slice(0, 3).map((img, iIdx) => (
                          <img
                            key={iIdx}
                            src={img}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border-2 border-slate-900 shrink-0"
                          />
                        ))}
                      </div>
                      <div>
                        <span className="block">{prod.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {prod.images?.length || 0} photo(s) • {prod.dimensions || "Standard"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-amber-400 font-semibold">{prod.Category?.name || "General"}</td>
                    <td className="p-4 text-slate-300">
                      <div>{prod.woodType}</div>
                      <div className="text-[10px] text-slate-500">{prod.finishType}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        ₹{prod.price.toLocaleString()}
                        {prod.compareAtPrice && (
                          <span className="text-[10px] text-slate-500 line-through ml-1.5">
                            ₹{prod.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-block ${
                            prod.stock > 0
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {prod.stock > 0 ? `${prod.stock} in stock` : "Sold Out"}
                        </span>
                      </div>
                    </td>

                    {/* Storefront Visibility & Buttons */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStoreVisibility(prod)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                            !prod.isArchived
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                              : "bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800"
                          }`}
                          title={!prod.isArchived ? "Currently LIVE on storefront (click to hide)" : "Currently HIDDEN from storefront (click to show)"}
                        >
                          {!prod.isArchived ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                          <span>{!prod.isArchived ? "Live on Store" : "Hidden from Store"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleDisplay(prod.id, "showDetailsBtn", prod.showDetailsBtn !== false)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border transition-colors ${
                              prod.showDetailsBtn !== false
                                ? "bg-amber-950/60 text-amber-400 border-amber-900"
                                : "bg-slate-900 text-slate-600 border-slate-800 line-through"
                            }`}
                            title="Toggle 'See Details' Button"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDisplay(prod.id, "showInquiryBtn", prod.showInquiryBtn !== false)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border transition-colors ${
                              prod.showInquiryBtn !== false
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-900"
                                : "bg-slate-900 text-slate-600 border-slate-800 line-through"
                            }`}
                            title="Toggle 'Direct Inquiry' Button"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${prod.slug || prod.id}`}
                          target="_blank"
                          className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-amber-400 border border-slate-700/80 transition-colors"
                          title="View public storefront page (/products/{id})"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 bg-amber-950/80 hover:bg-amber-900 rounded-lg text-amber-400 border border-amber-800 transition-colors"
                          title="Edit product specifications and photos"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {prod.isArchived ? (
                          <button
                            onClick={() => handleRestore(prod.id, prod.title)}
                            className="p-2 bg-emerald-950/80 hover:bg-emerald-900 rounded-lg text-emerald-400 border border-emerald-800 transition-colors"
                            title="Restore product to public catalog"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(prod.id, prod.title)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-700 transition-colors"
                            title="Archive product (hides from storefront)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="p-2 bg-red-950/60 hover:bg-red-900 rounded-lg text-red-400 transition-colors"
                          title="Permanently delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal with Device / Camera Photo Upload */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-white">Add New Handcrafted Furniture</h3>
            <p className="text-xs text-slate-400">
              Upload 1 to 3 device/camera photos, configure pricing, and select storefront buttons.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Furniture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solapur Sagwan Teak 7-Seater Sofa Set"
                  value={newProduct.title}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, title: e.target.value });
                    if (addErrors.title) setAddErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border ${
                    addErrors.title ? "border-red-500" : "border-slate-800"
                  } text-white focus:outline-none focus:ring-1 focus:ring-amber-500`}
                />
                {addErrors.title && <p className="text-red-400 text-[10px] mt-1">{addErrors.title}</p>}
              </div>

              {/* Photo Upload: 1 to 3 device/camera images */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">
                  Product Photos (1 to 3 required from device/camera) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {newProduct.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {newProduct.images.length < 3 && (
                    <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all text-slate-400 hover:text-amber-400">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold text-center px-1">Take/Pick Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  {newProduct.images.length}/3 photos added. Photos are saved directly into the database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <SearchableSelect
                    label="Category *"
                    options={CATEGORY_OPTIONS}
                    value={newProduct.categorySlug}
                    onChange={(val) => {
                      setNewProduct({ ...newProduct, categorySlug: val });
                      if (addErrors.categorySlug) setAddErrors((prev) => ({ ...prev, categorySlug: null }));
                    }}
                    placeholder="-- Select Category (Required) --"
                    error={addErrors.categorySlug}
                    allowOther={true}
                    dark={true}
                    required={true}
                  />
                  {addErrors.categorySlug && <p className="text-red-400 text-[10px] mt-1">{addErrors.categorySlug}</p>}
                </div>

                <div>
                  <SearchableSelect
                    label="Wood / Fabric Material *"
                    options={WOOD_OPTIONS}
                    value={newProduct.woodType}
                    onChange={(val) => {
                      setNewProduct({ ...newProduct, woodType: val });
                      if (addErrors.woodType) setAddErrors((prev) => ({ ...prev, woodType: null }));
                    }}
                    placeholder="-- Select Material (Required) --"
                    error={addErrors.woodType}
                    allowOther={true}
                    dark={true}
                    required={true}
                  />
                  {addErrors.woodType && <p className="text-red-400 text-[10px] mt-1">{addErrors.woodType}</p>}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Material / Timber Purity & Authenticity (%)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Pure Cotton, 100% Grade-A Sagwan Teak, 95% Organic Cotton"
                  value={newProduct.materialPurity}
                  onChange={(e) => setNewProduct({ ...newProduct, materialPurity: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Optional badge (e.g. "✓ 100% Pure Cotton" or "✓ 100% Genuine Sagwan"). Left blank if unspecified.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 85000"
                    value={newProduct.price}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, price: e.target.value });
                      if (addErrors.price) setAddErrors((prev) => ({ ...prev, price: null }));
                    }}
                    className={`w-full p-3 rounded-xl bg-slate-950 border ${
                      addErrors.price ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {addErrors.price && <p className="text-red-400 text-[10px] mt-1">{addErrors.price}</p>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Original Price (₹) (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 110000 (Optional)"
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
                    placeholder="e.g. 5"
                    value={newProduct.stock}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, stock: e.target.value });
                      if (addErrors.stock) setAddErrors((prev) => ({ ...prev, stock: null }));
                    }}
                    className={`w-full p-3 rounded-xl bg-slate-950 border ${
                      addErrors.stock ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {addErrors.stock && <p className="text-red-400 text-[10px] mt-1">{addErrors.stock}</p>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Dimensions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 78L x 36W x 34H inches"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <SearchableSelect
                  label="Polish / Finish Type (Optional)"
                  options={[
                    { value: "", label: "-- None / Natural Unfinished --" },
                    ...FINISH_OPTIONS,
                  ]}
                  value={newProduct.finishType}
                  onChange={(val) => setNewProduct({ ...newProduct, finishType: val })}
                  placeholder="-- Select Polish / Finish (Optional) --"
                  allowOther={true}
                  dark={true}
                />
              </div>

              {/* Display Options for Product Card */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Product Card Display Options (Storefront):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newProduct.showDetailsBtn}
                      onChange={(e) => setNewProduct({ ...newProduct, showDetailsBtn: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>"See Details" Button</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newProduct.showInquiryBtn}
                      onChange={(e) => setNewProduct({ ...newProduct, showInquiryBtn: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>"Direct Inquiry" Button</span>
                  </label>
                </div>
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

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Edit Handcrafted Product</h3>
                <p className="text-xs text-slate-400">Update specifications, stock, photos, and storefront display toggles.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Furniture Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => {
                    setEditingProduct({ ...editingProduct, title: e.target.value });
                    if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border ${
                    editErrors.title ? "border-red-500" : "border-slate-800"
                  } text-white focus:outline-none focus:ring-1 focus:ring-amber-500`}
                />
                {editErrors.title && <p className="text-red-400 text-[10px] mt-1">{editErrors.title}</p>}
              </div>

              {/* Photos Edit with preview and device upload */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">
                  Product Photos (1 to 3 photos saved in database) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {editProductImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeEditImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {editProductImages.length < 3 && (
                    <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all text-slate-400 hover:text-amber-400">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold text-center px-1">Take/Pick Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleEditImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  {editProductImages.length}/3 photos currently attached.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Wood Material *"
                  options={WOOD_OPTIONS}
                  value={editingProduct.woodType}
                  onChange={(val) => setEditingProduct({ ...editingProduct, woodType: val })}
                  allowOther={true}
                  dark={true}
                />

                <SearchableSelect
                  label="Polish / Finish Type"
                  options={FINISH_OPTIONS}
                  value={editingProduct.finishType}
                  onChange={(val) => setEditingProduct({ ...editingProduct, finishType: val })}
                  allowOther={true}
                  dark={true}
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Material / Timber Purity & Authenticity (%)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Pure Cotton, 100% Grade-A Sagwan Teak, 95% Organic Cotton"
                  value={editingProduct.materialPurity || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, materialPurity: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Appears on product badge (e.g. "✓ 100% Pure Cotton" or "✓ 100% Genuine Sagwan"). Defaults to 100% Genuine Quality if left blank.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      setEditingProduct({ ...editingProduct, price: e.target.value });
                      if (editErrors.price) setEditErrors((prev) => ({ ...prev, price: null }));
                    }}
                    className={`w-full p-3 rounded-xl bg-slate-950 border ${
                      editErrors.price ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {editErrors.price && <p className="text-red-400 text-[10px] mt-1">{editErrors.price}</p>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.compareAtPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value })}
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
                    value={editingProduct.stock}
                    onChange={(e) => {
                      setEditingProduct({ ...editingProduct, stock: e.target.value });
                      if (editErrors.stock) setEditErrors((prev) => ({ ...prev, stock: null }));
                    }}
                    className={`w-full p-3 rounded-xl bg-slate-950 border ${
                      editErrors.stock ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {editErrors.stock && <p className="text-red-400 text-[10px] mt-1">{editErrors.stock}</p>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={editingProduct.dimensions}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Display Options in Edit Modal */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Product Card Display Options (Storefront):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingProduct.showDetailsBtn}
                      onChange={(e) => setEditingProduct({ ...editingProduct, showDetailsBtn: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>"See Details" Button</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingProduct.showInquiryBtn}
                      onChange={(e) => setEditingProduct({ ...editingProduct, showInquiryBtn: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>"Direct Inquiry" Button</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50 shadow-md"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
