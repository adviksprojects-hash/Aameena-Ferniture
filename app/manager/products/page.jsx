"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Edit,
  Search,
  Archive,
  RotateCcw,
  Camera,
  Upload,
  Image as ImageIcon,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  getProducts,
  toggleStockStatus,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
  updateProductDisplayOptions,
} from "@/actions/productActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validateName, validateAmount } from "@/lib/validation";

const CATEGORY_OPTIONS = [
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining", label: "Dining Room" },
  { value: "office", label: "Office & Study" },
  { value: "outdoor", label: "Outdoor & Garden" },
];

const WOOD_OPTIONS = [
  { value: "Grade-A Sagwan Teak", label: "Grade-A Sagwan Teak" },
  { value: "Rajasthan Sheesham", label: "Rajasthan Sheesham" },
  { value: "Royal Rosewood (Shisham)", label: "Royal Rosewood (Shisham)" },
  { value: "American Walnut", label: "American Walnut" },
  { value: "African Mahogany", label: "African Mahogany" },
];

const FINISH_OPTIONS = [
  { value: "Natural Teak Honey Polish", label: "Natural Teak Honey Polish" },
  { value: "Hand-Rubbed Walnut Matte", label: "Hand-Rubbed Walnut Matte" },
  { value: "Royal Espresso High Gloss", label: "Royal Espresso High Gloss" },
  { value: "Raw Vintage Distressed", label: "Raw Vintage Distressed" },
  { value: "Melamine Silk Matt", label: "Melamine Silk Matt" },
];

export default function ManagerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "archived"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Validation errors
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // New product images array (1 to 3 images from device / camera)
  const [newProductImages, setNewProductImages] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    categorySlug: "living",
    woodType: "Grade-A Sagwan Teak",
    price: "",
    compareAtPrice: "",
    stock: "",
    dimensions: "",
    description: "",
    finishType: "Natural Teak Honey Polish",
    showInquiryBtn: true,
    showDetailsBtn: true,
  });

  // Edit product images & form state
  const [editProductImages, setEditProductImages] = useState([]);
  const [editProductData, setEditProductData] = useState({
    title: "",
    woodType: "Grade-A Sagwan Teak",
    price: "",
    compareAtPrice: "",
    stock: "",
    dimensions: "",
    description: "",
    finishType: "Natural Teak Honey Polish",
    showInquiryBtn: true,
    showDetailsBtn: true,
  });

  const loadProducts = async () => {
    setLoading(true);
    const res = await getProducts({ includeArchived: true });
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

  // Archive / Restore product
  const handleArchive = async (product) => {
    setUpdatingId(product.id);
    const res = await archiveProduct(product.id);
    if (res.success) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, isArchived: true } : p))
      );
      setMessage({ type: "success", text: `"${product.title}" has been archived and hidden from customer store.` });
      setTimeout(() => setMessage(null), 4000);
    }
    setUpdatingId(null);
  };

  const handleRestore = async (product) => {
    setUpdatingId(product.id);
    const res = await restoreProduct(product.id);
    if (res.success) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, isArchived: false } : p))
      );
      setMessage({ type: "success", text: `"${product.title}" restored and now visible on store.` });
      setTimeout(() => setMessage(null), 4000);
    }
    setUpdatingId(null);
  };

  // Handle image files from device or camera
  const handleFiles = (files, isEdit = false) => {
    const fileList = Array.from(files);
    const currentImages = isEdit ? editProductImages : newProductImages;

    if (currentImages.length + fileList.length > 3) {
      alert("A maximum of 3 images can be uploaded per product.");
      return;
    }

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditProductImages((prev) => [...prev, reader.result].slice(0, 3));
        } else {
          setNewProductImages((prev) => [...prev, reader.result].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditProductImages(editProductImages.filter((_, i) => i !== index));
    } else {
      setNewProductImages(newProductImages.filter((_, i) => i !== index));
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditErrors({});
    setSelectedProductForEdit(product);
    setEditProductImages(product.images || []);
    setEditProductData({
      title: product.title || "",
      woodType: product.woodType || "Grade-A Sagwan Teak",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
      stock: product.stock !== undefined ? product.stock : "",
      dimensions: product.dimensions || "",
      description: product.description || "",
      finishType: product.finishType || "Natural Teak Honey Polish",
      showInquiryBtn: product.showInquiryBtn !== false,
      showDetailsBtn: product.showDetailsBtn !== false,
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProductForEdit) return;

    const errors = {};
    const nameCheck = validateName(editProductData.title, "Product title", 3);
    if (!nameCheck.valid) errors.title = nameCheck.error;

    const priceCheck = validateAmount(editProductData.price, "Price");
    if (!priceCheck.valid) errors.price = priceCheck.error;

    const stockCheck = validateAmount(editProductData.stock, "Stock level");
    if (!stockCheck.valid) errors.stock = stockCheck.error;

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    if (editProductImages.length === 0) {
      alert("Please upload at least 1 image for this furniture piece.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await updateProduct(selectedProductForEdit.id, {
      ...editProductData,
      images: editProductImages.slice(0, 3),
    });

    if (res.success) {
      setMessage({ type: "success", text: "Product details and display options updated successfully!" });
      setShowEditModal(false);
      await loadProducts();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update product." });
    }
    setSubmitting(false);
  };

  // Handle Create Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();

    const errors = {};
    const nameCheck = validateName(newProduct.title, "Product title", 3);
    if (!nameCheck.valid) errors.title = nameCheck.error;

    const priceCheck = validateAmount(newProduct.price, "Price");
    if (!priceCheck.valid) errors.price = priceCheck.error;

    const stockCheck = validateAmount(newProduct.stock, "Stock level");
    if (!stockCheck.valid) errors.stock = stockCheck.error;

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});

    if (newProductImages.length === 0) {
      alert("Please upload at least 1 image (maximum 3) from your device or camera.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await createProduct({
      ...newProduct,
      images: newProductImages.slice(0, 3),
    });

    if (res.success) {
      setMessage({ type: "success", text: "Product added to manufacturer inventory and synchronized with database!" });
      setShowAddModal(false);
      setNewProductImages([]);
      setNewProduct({
        title: "",
        categorySlug: "living",
        woodType: "Grade-A Sagwan Teak",
        price: "",
        compareAtPrice: "",
        stock: "",
        dimensions: "",
        description: "",
        finishType: "Natural Teak Honey Polish",
        showInquiryBtn: true,
        showDetailsBtn: true,
      });
      await loadProducts();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add product." });
    }
    setSubmitting(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.woodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.Category?.name && p.Category.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab = activeTab === "archived" ? p.isArchived === true : !p.isArchived;
    return matchesSearch && matchesTab;
  });

  const activeCount = products.filter((p) => !p.isArchived).length;
  const archivedCount = products.filter((p) => p.isArchived).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
            Furniture Manufacturer Inventory Control • Solapur Facility
          </span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
            Manufacturer Product & Catalog Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload device photos (1-3 images), manage storefront inquiry/details buttons, archive out-of-production models, and toggle facility stock.
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
            onClick={() => {
              setNewProductImages([]);
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-amber-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manufacturer Product</span>
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
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "active"
                ? "bg-amber-950 text-amber-50 shadow-sm"
                : "bg-amber-50 text-slate-700 hover:bg-amber-100"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Active Products ({activeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("archived")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "archived"
                ? "bg-amber-950 text-amber-50 shadow-sm"
                : "bg-amber-50 text-slate-700 hover:bg-amber-100"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived Products ({archivedCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, wood type, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-amber-50/40 border border-amber-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="p-4">Furniture Piece (1-3 Photos)</th>
                <th className="p-4">Timber & Finish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Facility Price</th>
                <th className="p-4">Stock Units</th>
                <th className="p-4">Storefront Buttons</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                    Fetching manufacturer catalog from database...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    {activeTab === "archived"
                      ? "No archived products. All products are currently active on the storefront."
                      : "No products found. Click 'Add Manufacturer Product' above."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const inStock = p.stock > 0;
                  const isUpdating = updatingId === p.id;
                  const images = p.images && p.images.length > 0 ? p.images : [];

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                      {/* Photos & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={
                                images[0] ||
                                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80"
                              }
                              alt={p.title}
                              className="w-14 h-14 rounded-xl object-cover border border-amber-200 shrink-0"
                            />
                            {images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                                +{images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{p.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {p.id.slice(0, 10)}... • {images.length} {images.length === 1 ? "photo" : "photos"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{p.woodType}</span>
                        <span className="text-[10px] text-slate-500">{p.finishType || "Natural Teak Honey Polish"}</span>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {p.Category?.name || "Solid Wood"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 text-sm">₹{p.price.toLocaleString("en-IN")}</span>
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            ₹{p.compareAtPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleStock(p)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                            inStock
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {inStock ? `${p.stock} In Stock` : "Sold Out"}
                        </button>
                      </td>

                      {/* Display Controls badges */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-[10px] font-medium">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              p.showInquiryBtn !== false ? "text-emerald-700" : "text-slate-400 line-through"
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp Inquiry</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 ${
                              p.showDetailsBtn !== false ? "text-blue-700" : "text-slate-400 line-through"
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>See Details</span>
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3 text-amber-800" />
                            <span>Edit</span>
                          </button>

                          {p.isArchived ? (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleRestore(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              title="Restore to active storefront"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-700" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleArchive(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-900 text-slate-600 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              title="Archive product (hides from customer store)"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 MODAL 1: ADD PRODUCT (With 1-3 Device/Camera Image Upload)  */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 my-8">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Solapur Facility Inventory Entry
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                  Add New Manufacturer Furniture Piece
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Furniture Piece Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal 7-Seater Sagwan Teak Living Set"
                  value={newProduct.title}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, title: e.target.value });
                    if (addErrors.title) setAddErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`w-full p-2.5 rounded-xl border ${
                    addErrors.title ? "border-red-500" : "border-amber-200"
                  }`}
                />
                {addErrors.title && <p className="text-red-500 text-[10px] mt-1">{addErrors.title}</p>}
              </div>

              {/* 📸 Image Upload from Device / Camera (Min 1, Max 3) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-800" />
                    <span>Upload Product Photos from Device / Camera (1 to 3 images) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-900">
                    {newProductImages.length} of 3 added
                  </span>
                </div>

                {/* Upload Button & File Input */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label
                    className={`cursor-pointer px-4 py-2.5 rounded-xl border border-dashed font-bold flex items-center gap-2 transition-all ${
                      newProductImages.length >= 3
                        ? "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed"
                        : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span>Choose File / Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      disabled={newProductImages.length >= 3}
                      onChange={(e) => handleFiles(e.target.files, false)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Accepts JPEG/PNG from phone camera or computer. Minimum 1, up to 3 photos.
                  </span>
                </div>

                {/* Thumbnail Previews */}
                {newProductImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {newProductImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-amber-300 group">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Photo {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx, false)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Room Category *"
                  options={CATEGORY_OPTIONS}
                  value={newProduct.categorySlug}
                  onChange={(val) => setNewProduct({ ...newProduct, categorySlug: val })}
                  allowOther={true}
                />

                <SearchableSelect
                  label="Timber Selection *"
                  options={WOOD_OPTIONS}
                  value={newProduct.woodType}
                  onChange={(val) => setNewProduct({ ...newProduct, woodType: val })}
                  allowOther={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Finish Type"
                  options={FINISH_OPTIONS}
                  value={newProduct.finishType}
                  onChange={(val) => setNewProduct({ ...newProduct, finishType: val })}
                  allowOther={true}
                />

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder='e.g. 78" W x 34" D x 32" H'
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Facility Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 74999"
                    value={newProduct.price}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, price: e.target.value });
                      if (addErrors.price) setAddErrors((prev) => ({ ...prev, price: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      addErrors.price ? "border-red-500" : "border-amber-200"
                    } font-bold`}
                  />
                  {addErrors.price && <p className="text-red-500 text-[10px] mt-1">{addErrors.price}</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 89999"
                    value={newProduct.compareAtPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock Units *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={newProduct.stock}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, stock: e.target.value });
                      if (addErrors.stock) setAddErrors((prev) => ({ ...prev, stock: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      addErrors.stock ? "border-red-500" : "border-amber-200"
                    } font-bold`}
                  />
                  {addErrors.stock && <p className="text-red-500 text-[10px] mt-1">{addErrors.stock}</p>}
                </div>
              </div>

              {/* 🎛️ Storefront Buttons Controls */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  Storefront Button Visibility Controls:
                </span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.showInquiryBtn}
                      onChange={(e) => setNewProduct({ ...newProduct, showInquiryBtn: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-900"
                    />
                    <span className="font-semibold text-slate-700">Show "Direct WhatsApp Inquiry" Button</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.showDetailsBtn}
                      onChange={(e) => setNewProduct({ ...newProduct, showDetailsBtn: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-900"
                    />
                    <span className="font-semibold text-slate-700">Show "See Details" Button</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Artisan Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe wood seasoning, joint stability, cushion density, and hand-rubbed finish..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-200"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? "Saving Photos to Database..." : "Save Product to Manufacturer Catalog"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ✏️ MODAL 2: EDIT PRODUCT (With Photo Edit & Button Controls)  */}
      {/* ============================================================== */}
      {showEditModal && selectedProductForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 my-8">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Update Manufacturer Catalog
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                  Edit Furniture Piece
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title:</label>
                <input
                  type="text"
                  required
                  value={editProductData.title}
                  onChange={(e) => {
                    setEditProductData({ ...editProductData, title: e.target.value });
                    if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`w-full p-2.5 rounded-xl border ${
                    editErrors.title ? "border-red-500" : "border-amber-200"
                  }`}
                />
                {editErrors.title && <p className="text-red-500 text-[10px] mt-1">{editErrors.title}</p>}
              </div>

              {/* 📸 Edit Photos (1-3 images) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-800" />
                    <span>Manage Product Photos (1 to 3 images) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-900">
                    {editProductImages.length} of 3 photos
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    className={`cursor-pointer px-4 py-2 rounded-xl border border-dashed font-bold flex items-center gap-2 transition-all ${
                      editProductImages.length >= 3
                        ? "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed"
                        : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span>Add New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      disabled={editProductImages.length >= 3}
                      onChange={(e) => handleFiles(e.target.files, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                {editProductImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {editProductImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-amber-300">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Photo {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx, true)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Timber Selection:"
                  options={WOOD_OPTIONS}
                  value={editProductData.woodType}
                  onChange={(val) => setEditProductData({ ...editProductData, woodType: val })}
                  allowOther={true}
                />

                <SearchableSelect
                  label="Finishing Polish:"
                  options={FINISH_OPTIONS}
                  value={editProductData.finishType}
                  onChange={(val) => setEditProductData({ ...editProductData, finishType: val })}
                  allowOther={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={editProductData.price}
                    onChange={(e) => {
                      setEditProductData({ ...editProductData, price: e.target.value });
                      if (editErrors.price) setEditErrors((prev) => ({ ...prev, price: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      editErrors.price ? "border-red-500" : "border-amber-200"
                    } font-bold`}
                  />
                  {editErrors.price && <p className="text-red-500 text-[10px] mt-1">{editErrors.price}</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Compare Price (₹):</label>
                  <input
                    type="number"
                    value={editProductData.compareAtPrice}
                    onChange={(e) => setEditProductData({ ...editProductData, compareAtPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Units:</label>
                  <input
                    type="number"
                    required
                    value={editProductData.stock}
                    onChange={(e) => {
                      setEditProductData({ ...editProductData, stock: e.target.value });
                      if (editErrors.stock) setEditErrors((prev) => ({ ...prev, stock: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      editErrors.stock ? "border-red-500" : "border-amber-200"
                    } font-bold`}
                  />
                  {editErrors.stock && <p className="text-red-500 text-[10px] mt-1">{editErrors.stock}</p>}
                </div>
              </div>

              {/* 🎛️ Storefront Buttons Controls */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  Storefront Button Visibility Controls:
                </span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editProductData.showInquiryBtn}
                      onChange={(e) => setEditProductData({ ...editProductData, showInquiryBtn: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-900"
                    />
                    <span className="font-semibold text-slate-700">Show "Direct WhatsApp Inquiry" Button</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editProductData.showDetailsBtn}
                      onChange={(e) => setEditProductData({ ...editProductData, showDetailsBtn: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-900"
                    />
                    <span className="font-semibold text-slate-700">Show "See Details" Button</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description:</label>
                <textarea
                  rows="2"
                  value={editProductData.description}
                  onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-200"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? "Updating Database..." : "Save Product Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
