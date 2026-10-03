"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  RefreshCw,
  Truck,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Archive,
  RotateCcw,
  Plus,
  Edit,
  X,
  Sparkles,
  Search,
  Filter,
  Package,
  Layers,
  Phone,
  MapPin,
  FileText,
  Hammer,
  Ban,
  Printer,
} from "lucide-react";
import {
  getOrders,
  updateOrderStage,
  createDirectOrder,
  updateOrderDetails,
  archiveOrder,
  restoreOrder,
  cancelCustomerOrder,
} from "@/actions/orderActions";
import { getProducts } from "@/actions/productActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateName, validateAmount } from "@/lib/validation";

const WOOD_OPTIONS = [
  { value: "Grade-A Sagwan Teak", label: "Grade-A Sagwan Teak" },
  { value: "Solid Sheesham Hardwood", label: "Solid Sheesham Hardwood" },
  { value: "Indian Rosewood", label: "Indian Rosewood" },
  { value: "American Walnut", label: "American Walnut" },
  { value: "Steam Beechwood", label: "Steam Beechwood" },
];

const FINISH_OPTIONS = [
  { value: "Natural Teak Honey Polish", label: "Natural Teak Honey Polish" },
  { value: "Dark Walnut Matte Finish", label: "Dark Walnut Matte Finish" },
  { value: "High Gloss Melamine", label: "High Gloss Melamine" },
  { value: "Raw Antique Wax Polish", label: "Raw Antique Wax Polish" },
  { value: "Distressed White Wash", label: "Distressed White Wash" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "archived"

  // Validation error states
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [selectedOrderForNotify, setSelectedOrderForNotify] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Direct Order Form State (Clean initial state without demo text)
  const [orderType, setOrderType] = useState("custom"); // "custom" | "catalog"
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
    totalAmount: "",
    productionStage: "TIMBER_SELECTION",
    customerNotes: "",
    selectedProductId: "",
    customTitle: "",
    woodType: "Grade-A Sagwan Teak",
    finishType: "Natural Teak Honey Polish",
    dimensions: "",
    customNotes: "",
  });

  // Edit Order Form State
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
    totalAmount: "",
    productionStage: "TIMBER_SELECTION",
    trackingNumber: "",
    customerNotes: "",
  });

  // WhatsApp Alert Form State
  const [notifyNotes, setNotifyNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, productsRes] = await Promise.all([
      getOrders({ includeArchived: true }),
      getProducts(),
    ]);

    if (ordersRes.success) {
      setOrders(ordersRes.data);
    }
    if (productsRes.success) {
      setCatalogProducts(productsRes.data);
      if (productsRes.data.length > 0 && !newOrder.selectedProductId) {
        setNewOrder((prev) => ({ ...prev, selectedProductId: productsRes.data[0].id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const STAGE_OPTIONS = [
    { value: "INQUIRY_RECEIVED", label: "Inquiry Received", status: "PENDING" },
    { value: "TIMBER_SELECTION", label: "1. Timber Selection", status: "IN_PRODUCTION" },
    { value: "CARVING_JOINERY", label: "2. Carving & Joinery", status: "IN_PRODUCTION" },
    { value: "SEVEN_STEP_POLISHING", label: "3. 7-Step Polishing", status: "IN_PRODUCTION" },
    { value: "QUALITY_INSPECTION", label: "4. Quality Inspection", status: "IN_PRODUCTION" },
    { value: "DISPATCHED_WHITE_GLOVE", label: "5. Dispatched (White-Glove)", status: "SHIPPED" },
    { value: "DELIVERED", label: "6. Delivered & Installed", status: "DELIVERED" },
  ];

  const handleUpdate = async (orderId, stage, status) => {
    setUpdatingId(orderId);
    const res = await updateOrderStage(orderId, { stage, status });
    if (res.success) {
      setActionMessage({
        type: "success",
        text: `Order updated to "${stage.replace(/_/g, " ")}" ${status === "DELIVERED" ? "(Stock automatically reduced)" : ""}`,
      });
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to update order stage." });
    }
    setUpdatingId(null);
  };

  const handleCancel = async (orderId, orderNumber) => {
    if (!confirm(`Cancel order #${orderNumber}? This will mark it as CANCELLED and restore stock if already delivered.`)) return;
    const res = await cancelCustomerOrder(orderId, "Cancelled by Admin");
    if (res.success) {
      setActionMessage({ type: "success", text: `Order #${orderNumber} marked as CANCELLED.` });
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to cancel order." });
    }
  };

  const handleArchive = async (orderId, orderNumber) => {
    if (!confirm(`Archive order #${orderNumber}? It will be moved from active dispatch to archive records.`)) return;
    const res = await archiveOrder(orderId);
    if (res.success) {
      setActionMessage({ type: "success", text: `Order #${orderNumber} moved to archive.` });
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to archive order." });
    }
  };

  const handleRestore = async (orderId, orderNumber) => {
    const res = await restoreOrder(orderId);
    if (res.success) {
      setActionMessage({ type: "success", text: `Order #${orderNumber} restored to active orders.` });
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to restore order." });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (order) => {
    setSelectedOrderForEdit(order);
    setEditFormData({
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      customerEmail: order.customerEmail || "",
      shippingAddress: order.shippingAddress || "",
      city: order.city || "Solapur",
      postalCode: order.postalCode || "413005",
      totalAmount: order.totalAmount || "",
      productionStage: order.productionStage || "TIMBER_SELECTION",
      trackingNumber: order.trackingNumber || "",
      customerNotes: order.customerNotes || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEditOrder = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameCheck = validateName(editFormData.customerName, "Customer Name");
    if (!nameCheck.valid) errors.customerName = nameCheck.error;

    const phoneCheck = validatePhone(editFormData.customerPhone);
    if (!phoneCheck.valid) errors.customerPhone = phoneCheck.error;

    const amountCheck = validateAmount(editFormData.totalAmount, "Total Amount");
    if (!amountCheck.valid) errors.totalAmount = amountCheck.error;

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    setIsSubmitting(true);
    const res = await updateOrderDetails(selectedOrderForEdit.id, editFormData);
    if (res.success) {
      setActionMessage({ type: "success", text: `Order #${selectedOrderForEdit.orderNumber} updated successfully!` });
      setShowEditModal(false);
      loadData();
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to update order." });
    }
    setIsSubmitting(false);
  };

  // Create Direct Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameCheck = validateName(newOrder.customerName, "Customer Name");
    if (!nameCheck.valid) errors.customerName = nameCheck.error;

    const phoneCheck = validatePhone(newOrder.customerPhone);
    if (!phoneCheck.valid) errors.customerPhone = phoneCheck.error;

    const amountCheck = validateAmount(newOrder.totalAmount, "Total Agreed Amount");
    if (!amountCheck.valid) errors.totalAmount = amountCheck.error;

    const isCustom = orderType === "custom";
    if (isCustom) {
      const titleCheck = validateName(newOrder.customTitle, "Custom Furniture Title");
      if (!titleCheck.valid) errors.customTitle = titleCheck.error;
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    setIsSubmitting(true);

    let itemPayload = {};

    if (isCustom) {
      itemPayload = {
        title: newOrder.customTitle,
        price: parseFloat(newOrder.totalAmount),
        specs: `${newOrder.woodType} | ${newOrder.finishType} | Dim: ${newOrder.dimensions}`,
      };
    } else {
      const selectedProd = catalogProducts.find((p) => p.id === newOrder.selectedProductId);
      itemPayload = {
        productId: selectedProd?.id,
        title: selectedProd?.title || "Catalog Furniture",
        price: selectedProd?.price || parseFloat(newOrder.totalAmount),
        specs: `${selectedProd?.woodType} | Finish: ${selectedProd?.finishType || "Natural Teak"}`,
      };
    }

    const payload = {
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail || `${newOrder.customerName.toLowerCase().replace(/\s+/g, "")}@customer.com`,
      shippingAddress: newOrder.shippingAddress,
      city: newOrder.city || "Solapur",
      postalCode: newOrder.postalCode || "413005",
      totalAmount: parseFloat(newOrder.totalAmount),
      productionStage: newOrder.productionStage,
      customerNotes: isCustom
        ? `[Custom Order] ${newOrder.customTitle} | ${newOrder.customNotes} | Specs: ${newOrder.dimensions}`
        : `[Catalog Order] ${itemPayload.title} | ${newOrder.customerNotes}`,
      isCustomFurniture: isCustom,
      item: itemPayload,
    };

    const res = await createDirectOrder(payload);
    if (res.success) {
      setActionMessage({
        type: "success",
        text: `New order #${res.data.orderNumber} created successfully!`,
      });
      setShowCreateModal(false);
      setNewOrder({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        shippingAddress: "",
        city: "",
        postalCode: "",
        totalAmount: "",
        productionStage: "TIMBER_SELECTION",
        customerNotes: "",
        selectedProductId: catalogProducts[0]?.id || "",
        customTitle: "",
        woodType: "Grade-A Sagwan Teak",
        finishType: "Natural Teak Honey Polish",
        dimensions: "",
        customNotes: "",
      });
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to create direct order." });
    }
    setIsSubmitting(false);
  };

  // WhatsApp Alert Generation
  const handleOpenNotifyModal = (order) => {
    setSelectedOrderForNotify(order);
    setNotifyNotes("");
    setShowNotifyModal(true);
  };

  const getWhatsAppNotifyUrl = () => {
    if (!selectedOrderForNotify) return "";
    const cleanPhone = (selectedOrderForNotify.customerPhone || "").replace(/\D/g, "");
    const phoneWithCode = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

    const stageLabel =
      STAGE_OPTIONS.find((s) => s.value === selectedOrderForNotify.productionStage)?.label ||
      selectedOrderForNotify.productionStage;

    const firstItem = selectedOrderForNotify.OrderItem?.[0];
    const isCustom = !firstItem?.productId;

    let productDetails = "";
    if (isCustom) {
      productDetails = `*Custom Crafting Specs:* ${firstItem?.title || "Bespoke Furniture"}\n*Manufacturing Facility:* Solapur Central Workshop\n*Notes:* ${selectedOrderForNotify.customerNotes || "Master handcrafted joinery"}`;
    } else {
      productDetails = `*Item:* ${firstItem?.title || "Handcrafted Furniture"}\n*Product ID:* ${firstItem?.productId || "CAT-PROD"}\n*Finish:* ${firstItem?.Product?.finishType || "Natural Teak Honey Polish"}`;
    }

    const message = `Namaste ${selectedOrderForNotify.customerName}! 🪑

Update from *AMEENA Distributors’s Sofa Set Furniture Company, Solapur*:
Your order *#${selectedOrderForNotify.orderNumber}* is currently at milestone:
*➡️ ${stageLabel}*

${productDetails}

*Tracking ID:* ${selectedOrderForNotify.trackingNumber || "AF-SOLAPUR-DISPATCH"}
*Amount:* ₹${selectedOrderForNotify.totalAmount?.toLocaleString()}
*Delivery Destination:* ${selectedOrderForNotify.shippingAddress}, ${selectedOrderForNotify.city}

${notifyNotes ? `*Important Update:* ${notifyNotes}\n\n` : ""}Thank you for choosing AMEENA Distributors!
📍 Location: Near Old Poona Naka, Ring Road, Solapur.`;

    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "archived" ? o.isArchived === true : !o.isArchived;
    const matchesStage = stageFilter === "ALL" || o.productionStage === stageFilter;
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Dispatch & Logistics</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create direct orders, track 7 production stages, trigger stock deduction on delivery, and dispatch WhatsApp alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Create Direct Order</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "active"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Active Orders ({orders.filter((o) => !o.isArchived).length})</span>
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
              <span>Archived Orders ({orders.filter((o) => o.isArchived).length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Production Stages</option>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            actionMessage.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order # & Item</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Crafting Stage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    {activeTab === "archived" ? "No archived orders found." : "No orders found matching filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;
                  const canArchive = ord.status === "DELIVERED" || ord.status === "CANCELLED";
                  const firstItem = ord.OrderItem?.[0];
                  const isCustom = !firstItem?.productId;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{ord.orderNumber}</span>
                          {isCustom && (
                            <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                              Bespoke
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-400 font-normal mt-0.5 truncate max-w-[180px]">
                          {firstItem?.title || "Handcrafted Furniture"}
                        </div>
                        {ord.trackingNumber && (
                          <div className="text-[9px] text-slate-500 font-mono">{ord.trackingNumber}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{ord.customerName}</span>
                        <span className="text-slate-500 text-[10px]">{ord.customerPhone || ord.customerEmail}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{ord.city || "Solapur"}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{ord.shippingAddress}</div>
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
                              : ord.status === "CANCELLED"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stage Dropdown */}
                          <select
                            disabled={isUpdating || ord.status === "CANCELLED"}
                            value={currentStage}
                            onChange={(e) => {
                              const selected = STAGE_OPTIONS.find((s) => s.value === e.target.value);
                              handleUpdate(ord.id, e.target.value, selected?.status || ord.status);
                            }}
                            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {STAGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(ord)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                            title="Edit full order details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Alert */}
                          <button
                            onClick={() => handleOpenNotifyModal(ord)}
                            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                            title="Send WhatsApp milestone update"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Receipt Summary */}
                          <button
                            onClick={() => {
                              setSelectedOrderForReceipt(ord);
                              setShowReceiptModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-400 border border-blue-800 transition-colors"
                            title="View receipt & invoice summary"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Cancel Button (Admin Power Action) */}
                          {ord.status !== "CANCELLED" && ord.status !== "DELIVERED" && (
                            <button
                              onClick={() => handleCancel(ord.id, ord.orderNumber)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 transition-colors"
                              title="Cancel order immediately"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Archive / Restore Button */}
                          {ord.isArchived ? (
                            <button
                              onClick={() => handleRestore(ord.id, ord.orderNumber)}
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                              title="Restore order to active dispatch"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : canArchive ? (
                            <button
                              onClick={() => handleArchive(ord.id, ord.orderNumber)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                              title="Archive delivered or cancelled order"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
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

      {/* Modal 1: Create Direct Order */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Create Direct Customer Order</h3>
                <p className="text-xs text-slate-400">For showroom walk-ins or bespoke custom furniture projects.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType("custom")}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  orderType === "custom" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Bespoke Custom Furniture</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("catalog")}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  orderType === "catalog" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Catalog Product</span>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newOrder.customerName}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, customerName: e.target.value });
                      if (createErrors.customerName) setCreateErrors((prev) => ({ ...prev, customerName: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      createErrors.customerName ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                  {createErrors.customerName && <p className="text-red-400 text-[10px] mt-1">{createErrors.customerName}</p>}
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00001"
                    value={newOrder.customerPhone}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, customerPhone: e.target.value });
                      if (createErrors.customerPhone) setCreateErrors((prev) => ({ ...prev, customerPhone: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      createErrors.customerPhone ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                  {createErrors.customerPhone && <p className="text-red-400 text-[10px] mt-1">{createErrors.customerPhone}</p>}
                </div>
              </div>

              {/* Dynamic Item Details */}
              {orderType === "custom" ? (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Custom Woodcraft Specifications</span>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Custom Furniture Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal 7-Seater Sagwan L-Shape Sofa"
                      value={newOrder.customTitle}
                      onChange={(e) => {
                        setNewOrder({ ...newOrder, customTitle: e.target.value });
                        if (createErrors.customTitle) setCreateErrors((prev) => ({ ...prev, customTitle: null }));
                      }}
                      className={`w-full p-2.5 rounded-xl bg-slate-900 border ${
                        createErrors.customTitle ? "border-red-500" : "border-slate-800"
                      } text-white focus:outline-none`}
                    />
                    {createErrors.customTitle && <p className="text-red-400 text-[10px] mt-1">{createErrors.customTitle}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <SearchableSelect
                      label="Wood Type"
                      options={WOOD_OPTIONS}
                      value={newOrder.woodType}
                      onChange={(val) => setNewOrder({ ...newOrder, woodType: val })}
                      allowOther={true}
                      dark={true}
                    />

                    <SearchableSelect
                      label="Polish / Finish"
                      options={FINISH_OPTIONS}
                      value={newOrder.finishType}
                      onChange={(val) => setNewOrder({ ...newOrder, finishType: val })}
                      allowOther={true}
                      dark={true}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. 78L x 36W x 34H inches"
                      value={newOrder.dimensions}
                      onChange={(e) => setNewOrder({ ...newOrder, dimensions: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <SearchableSelect
                    label="Select Catalog Furniture Item *"
                    options={catalogProducts.map((p) => ({
                      value: p.id,
                      label: `${p.title} - ₹${p.price.toLocaleString()} (${p.stock} in stock)`,
                    }))}
                    value={newOrder.selectedProductId}
                    onChange={(val) => {
                      const prod = catalogProducts.find((p) => p.id === val);
                      setNewOrder({
                        ...newOrder,
                        selectedProductId: val,
                        totalAmount: prod ? prod.price.toString() : newOrder.totalAmount,
                      });
                    }}
                    allowOther={false}
                    dark={true}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Total Agreed Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 85000"
                    value={newOrder.totalAmount}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, totalAmount: e.target.value });
                      if (createErrors.totalAmount) setCreateErrors((prev) => ({ ...prev, totalAmount: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      createErrors.totalAmount ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {createErrors.totalAmount && <p className="text-red-400 text-[10px] mt-1">{createErrors.totalAmount}</p>}
                </div>

                <div>
                  <SearchableSelect
                    label="Initial Milestone Stage *"
                    options={STAGE_OPTIONS}
                    value={newOrder.productionStage}
                    onChange={(val) => setNewOrder({ ...newOrder, productionStage: val })}
                    allowOther={false}
                    dark={true}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot No. 45, MIDC Industrial Area, Solapur"
                  value={newOrder.shippingAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Order..." : "Confirm & Save Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Order Details */}
      {showEditModal && selectedOrderForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Edit Order #{selectedOrderForEdit.orderNumber}</h3>
                <p className="text-xs text-slate-400">Update customer information, production milestone, and pricing.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerName}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, customerName: e.target.value });
                      if (editErrors.customerName) setEditErrors((prev) => ({ ...prev, customerName: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      editErrors.customerName ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {editErrors.customerName && <p className="text-red-400 text-[10px] mt-1">{editErrors.customerName}</p>}
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.customerPhone}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, customerPhone: e.target.value });
                      if (editErrors.customerPhone) setEditErrors((prev) => ({ ...prev, customerPhone: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      editErrors.customerPhone ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {editErrors.customerPhone && <p className="text-red-400 text-[10px] mt-1">{editErrors.customerPhone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.totalAmount}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, totalAmount: e.target.value });
                      if (editErrors.totalAmount) setEditErrors((prev) => ({ ...prev, totalAmount: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-slate-950 border ${
                      editErrors.totalAmount ? "border-red-500" : "border-slate-800"
                    } text-white focus:outline-none`}
                  />
                  {editErrors.totalAmount && <p className="text-red-400 text-[10px] mt-1">{editErrors.totalAmount}</p>}
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={editFormData.trackingNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, trackingNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={editFormData.shippingAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, shippingAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Internal Order Notes</label>
                <textarea
                  rows="2"
                  value={editFormData.customerNotes}
                  onChange={(e) => setEditFormData({ ...editFormData, customerNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Updates"}
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

      {/* Modal 3: WhatsApp Notification Dispatch */}
      {showNotifyModal && selectedOrderForNotify && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-bold font-serif text-white">WhatsApp Customer Update</h3>
              </div>
              <button onClick={() => setShowNotifyModal(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Send personalized WhatsApp notification to <span className="text-white font-bold">{selectedOrderForNotify.customerName}</span> ({selectedOrderForNotify.customerPhone}) regarding stage update.
            </p>

            <div>
              <label className="text-slate-300 font-bold block mb-1 text-xs">Custom Note / Milestone Details (Optional):</label>
              <textarea
                rows="2"
                placeholder="e.g. 7-step Italian PU polish completed. Frame ready for final white-glove inspection."
                value={notifyNotes}
                onChange={(e) => setNotifyNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
              ></textarea>
            </div>

            <a
              href={getWhatsAppNotifyUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowNotifyModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open WhatsApp & Send Update</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal 4: Invoice / Receipt Breakdown Summary */}
      {showReceiptModal && selectedOrderForReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest block">Official Workshop Invoice</span>
                <h3 className="text-lg font-bold font-serif text-white">Order Receipt #{selectedOrderForReceipt.orderNumber}</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Client Name:</span>
                  <span className="font-bold text-white block">{selectedOrderForReceipt.customerName}</span>
                  <span className="text-slate-400 text-[10px]">{selectedOrderForReceipt.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Manufacturing Store:</span>
                  <span className="font-bold text-amber-400 block">AMEENA Distributors, Solapur</span>
                  <span className="text-slate-400 text-[10px]">Tracking ID: {selectedOrderForReceipt.trackingNumber || "N/A"}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-2">Order Line Items:</span>
                <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2">
                  {(selectedOrderForReceipt.OrderItem || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                      <div>
                        <span className="font-bold text-white block">{item.title}</span>
                        <span className="text-slate-500 text-[10px]">
                          {item.Product ? `${item.Product.woodType} | ${item.Product.finishType}` : "Bespoke Joinery"}
                        </span>
                      </div>
                      <span className="font-bold text-white">₹{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrderForReceipt.totalAmount / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18% Hardwood Furnishing):</span>
                  <span>₹{(selectedOrderForReceipt.totalAmount - selectedOrderForReceipt.totalAmount / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                  <span>Total Amount Paid / Payable:</span>
                  <span className="text-amber-400">₹{selectedOrderForReceipt.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
