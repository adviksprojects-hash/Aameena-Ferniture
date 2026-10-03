"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Truck,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
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
  Archive,
  RotateCcw,
  Ban,
  ArrowRightCircle,
} from "lucide-react";
import {
  getOrders,
  updateOrderStage,
  createDirectOrder,
  updateOrderDetails,
  archiveOrder,
  restoreOrder,
  advanceOrderToNextStage,
  cancelOrderByManager,
} from "@/actions/orderActions";
import { getProducts } from "@/actions/productActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateName, validateAmount } from "@/lib/validation";

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

const STAGE_OPTIONS = [
  { value: "INQUIRY_RECEIVED", label: "Inquiry Received", status: "PENDING" },
  { value: "TIMBER_SELECTION", label: "1. Timber Selection", status: "IN_PRODUCTION" },
  { value: "CARVING_JOINERY", label: "2. Carving & Joinery", status: "IN_PRODUCTION" },
  { value: "SEVEN_STEP_POLISHING", label: "3. 7-Step Polishing", status: "IN_PRODUCTION" },
  { value: "QUALITY_INSPECTION", label: "4. Quality Inspection", status: "IN_PRODUCTION" },
  { value: "DISPATCHED_WHITE_GLOVE", label: "5. Dispatched (White-Glove)", status: "SHIPPED" },
  { value: "DELIVERED", label: "6. Delivered & Installed", status: "DELIVERED" },
];

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "archived"

  // Validation error states
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [customStageFilter, setCustomStageFilter] = useState("");
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [selectedOrderForNotify, setSelectedOrderForNotify] = useState(null);
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
    // If Catalog item:
    selectedProductId: "",
    // If Custom item:
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
      if (productsRes.data.length > 0) {
        setNewOrder((prev) => ({ ...prev, selectedProductId: productsRes.data[0].id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStageUpdate = async (orderId, stage, status) => {
    setUpdatingId(orderId);
    const res = await updateOrderStage(orderId, { stage, status });
    if (res.success) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, productionStage: stage, status } : o))
      );
      showBanner("success", `Order #${orders.find((o) => o.id === orderId)?.orderNumber} stage updated!`);
    }
    setUpdatingId(null);
  };

  const handleArchiveOrder = async (order) => {
    setUpdatingId(order.id);
    const res = await archiveOrder(order.id);
    if (res.success) {
      setOrders(orders.map((o) => (o.id === order.id ? { ...o, isArchived: true } : o)));
      showBanner("success", `Order #${order.orderNumber} has been archived.`);
    }
    setUpdatingId(null);
  };

  const handleRestoreOrder = async (order) => {
    setUpdatingId(order.id);
    const res = await restoreOrder(order.id);
    if (res.success) {
      setOrders(orders.map((o) => (o.id === order.id ? { ...o, isArchived: false } : o)));
      showBanner("success", `Order #${order.orderNumber} restored to active orders.`);
    }
    setUpdatingId(null);
  };

  const getNextStageDetails = (currentStage) => {
    const sequence = [
      { key: "INQUIRY_RECEIVED", next: "TIMBER_SELECTION", label: "Timber Selection" },
      { key: "TIMBER_SELECTION", next: "CARVING_JOINERY", label: "Carving & Joinery" },
      { key: "CARVING_JOINERY", next: "SEVEN_STEP_POLISHING", label: "7-Step Polishing" },
      { key: "SEVEN_STEP_POLISHING", next: "QUALITY_INSPECTION", label: "Quality Inspection" },
      { key: "QUALITY_INSPECTION", next: "DISPATCHED_WHITE_GLOVE", label: "White-Glove Dispatch" },
      { key: "DISPATCHED_WHITE_GLOVE", next: "DELIVERED", label: "Delivered & Installed" },
    ];
    return sequence.find((s) => s.key === currentStage) || null;
  };

  const handleAdvanceStage = async (orderId) => {
    setUpdatingId(orderId);
    const res = await advanceOrderToNextStage(orderId);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, productionStage: res.nextStage, status: res.newStatus }
            : o
        )
      );
      showBanner(
        "success",
        `Order advanced to stage: ${res.nextStage.replace(/_/g, " ")}${
          res.newStatus === "DELIVERED" ? " (Marked DELIVERED & inventory updated)" : ""
        }`
      );
    } else {
      showBanner("error", res.error || "Failed to advance stage.");
    }
    setUpdatingId(null);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancelling this order.");
      return;
    }
    setCancelling(true);
    const res = await cancelOrderByManager(cancelModalOrder.id, cancelReason);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelModalOrder.id
            ? {
                ...o,
                status: "CANCELLED",
                productionStage: "CANCELLED",
                customerNotes: o.customerNotes
                  ? `${o.customerNotes} | [CANCELLED: ${cancelReason.trim()}]`
                  : `[CANCELLED: ${cancelReason.trim()}]`,
              }
            : o
        )
      );
      showBanner("success", `Order #${cancelModalOrder.orderNumber} cancelled. Reason recorded.`);
      setCancelModalOrder(null);
      setCancelReason("");
    } else {
      showBanner("error", res.error || "Failed to cancel order.");
    }
    setCancelling(false);
  };

  const handleCustomStagePrompt = async (orderId) => {
    const customStage = prompt("Enter custom manufacturing milestone / stage name (e.g. CNC 3D Carving, Velvet Tufting):");
    if (!customStage || !customStage.trim()) return;
    await handleStageUpdate(orderId, customStage.trim(), "IN_PRODUCTION");
  };

  const showBanner = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Open Edit Modal
  const openEditModal = (order) => {
    setSelectedOrderForEdit(order);
    setEditFormData({
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      customerEmail: order.customerEmail || "",
      shippingAddress: order.shippingAddress || "",
      city: order.city || "Mumbai",
      postalCode: order.postalCode || "400050",
      totalAmount: order.totalAmount || "",
      productionStage: order.productionStage || "TIMBER_SELECTION",
      trackingNumber: order.trackingNumber || "",
      customerNotes: order.customerNotes || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Order
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForEdit) return;

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
      showBanner("success", `Order #${selectedOrderForEdit.orderNumber} updated successfully!`);
      setShowEditModal(false);
      await loadData();
    } else {
      showBanner("error", res.error || "Failed to update order.");
    }
    setIsSubmitting(false);
  };

  // Submit New Direct Order (Catalog or Custom Furniture)
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
        quantity: 1,
        woodType: newOrder.woodType,
        finishType: newOrder.finishType,
        productId: null,
      };
    } else {
      const selectedProd = catalogProducts.find((p) => p.id === newOrder.selectedProductId);
      itemPayload = {
        title: selectedProd ? selectedProd.title : "Catalog Furniture",
        price: parseFloat(newOrder.totalAmount || (selectedProd ? selectedProd.price : 0)),
        quantity: 1,
        woodType: selectedProd ? selectedProd.woodType : "Grade-A Sagwan Teak",
        finishType: selectedProd ? selectedProd.finishType : "Natural Teak Honey Polish",
        productId: selectedProd ? selectedProd.id : null,
      };
    }

    const payload = {
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail || "direct.client@aameenafurniture.com",
      shippingAddress: newOrder.shippingAddress,
      city: newOrder.city || "Solapur",
      postalCode: newOrder.postalCode || "413005",
      totalAmount: newOrder.totalAmount,
      productionStage: newOrder.productionStage,
      customerNotes: isCustom
        ? `[Custom Furniture Spec]: ${newOrder.dimensions} | ${newOrder.customNotes}`
        : newOrder.customerNotes,
      isCustomFurniture: isCustom,
      item: itemPayload,
    };

    const res = await createDirectOrder(payload);
    if (res.success) {
      showBanner("success", `Direct order #${res.data.orderNumber} created successfully!`);
      setShowCreateModal(false);
      // Reset form
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
      await loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      showBanner("error", res.error || "Failed to create direct order.");
    }
    setIsSubmitting(false);
  };

  // Open WhatsApp Notify Preview Modal
  const openNotifyModal = (order) => {
    setSelectedOrderForNotify(order);
    setShowNotifyModal(true);
  };

  // Generate WhatsApp Message text incorporating Product ID / Name and Custom Furniture Details
  const generateWhatsAppMessage = (order) => {
    if (!order) return "";
    const items = order.OrderItem || [];
    const itemDetails = items
      .map((item, idx) => {
        if (item.productId) {
          return `   ${idx + 1}. Product: ${item.title}\n      • Product ID: ${item.productId.slice(0, 10)}...\n      • Timber: ${item.woodType || "Solid Teak"}\n      • Finish: ${item.finishType || "Natural Polish"}`;
        } else {
          return `   ${idx + 1}. [Custom Bespoke Furniture]: ${item.title}\n      • Timber: ${item.woodType || "Grade-A Sagwan Teak"}\n      • Finish: ${item.finishType || "Hand-Rubbed Polish"}\n      • Notes: ${order.customerNotes || "Handcrafted to custom specs"}`;
        }
      })
      .join("\n\n");

    const stageFormatted = (order.productionStage || "INQUIRY_RECEIVED").replace(/_/g, " ");

    return (
      `*AAMEENA FURNITURE MANUFACTURER*\n` +
      `*Order Production & Dispatch Notice*\n\n` +
      `Hello ${order.customerName},\n\n` +
      `Your custom furniture order *#${order.orderNumber}* has been updated!\n\n` +
      `📍 *Current Crafting Stage:* ${stageFormatted}\n` +
      `🚚 *Tracking ID:* ${order.trackingNumber || "AF-MFG-" + order.orderNumber}\n` +
      `🏢 *Manufacturer Unit:* AMEENA Distributors’s Sofa Set Furniture Company, Solapur\n\n` +
      `🪵 *Furniture Project Details:*\n` +
      `${itemDetails || "   • Handcrafted Luxury Solid Wood Furniture"}\n\n` +
      `Our master artisans ensure every mortise-and-tenon joint and polish coat meets heirloom quality standards.\n\n` +
      `Track live anytime: http://localhost:3000/orders\n` +
      `Thank you for trusting Aameena Furniture Manufacturer!`
    );
  };

  const dispatchWhatsApp = (order) => {
    const phone = (order.customerPhone || "").replace(/[^0-9]/g, "");
    const msg = generateWhatsAppMessage(order);
    window.open(`https://wa.me/${phone || "919876500001"}?text=${encodeURIComponent(msg)}`, "_blank");
    setShowNotifyModal(false);
  };

  const STAGES = [
    { value: "INQUIRY_RECEIVED", label: "Inquiry Received", status: "PENDING" },
    { value: "TIMBER_SELECTION", label: "Timber Seasoning", status: "IN_PRODUCTION" },
    { value: "CARVING_JOINERY", label: "Carving & Joinery", status: "IN_PRODUCTION" },
    { value: "SEVEN_STEP_POLISHING", label: "Polishing & Coating", status: "IN_PRODUCTION" },
    { value: "DISPATCHED_WHITE_GLOVE", label: "Out for Delivery", status: "SHIPPED" },
    { value: "DELIVERED", label: "Delivered & Installed", status: "DELIVERED" },
  ];

  // Filter orders with archive tabs and custom stage filter
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.customerPhone && ord.customerPhone.includes(searchQuery)) ||
      (ord.city && ord.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.productionStage && ord.productionStage.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStage = true;
    if (stageFilter === "ALL") {
      matchesStage = true;
    } else if (stageFilter === "OTHER") {
      if (customStageFilter.trim()) {
        matchesStage = (ord.productionStage || "").toLowerCase().includes(customStageFilter.toLowerCase().trim());
      } else {
        const standardKeys = STAGES.map((s) => s.value);
        matchesStage = !standardKeys.includes(ord.productionStage);
      }
    } else {
      matchesStage = ord.productionStage === stageFilter;
    }

    const matchesTab = activeTab === "archived" ? ord.isArchived === true : !ord.isArchived;
    return matchesSearch && matchesStage && matchesTab;
  });

  const activeOrdersCount = orders.filter((o) => !o.isArchived).length;
  const archivedOrdersCount = orders.filter((o) => o.isArchived).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
            Furniture Manufacturer Logistics • Solapur Facility
          </span>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
            Manufacturer Order & Dispatch Control
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Create direct walk-in customer orders, manage custom furniture crafting stages, edit order specs, archive delivered orders, and send rich WhatsApp project updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-amber-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Direct Customer Order</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs & Filter Bar */}
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
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Active Orders ({activeOrdersCount})</span>
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
            <span>Archived Orders ({archivedOrdersCount})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-amber-50/40 border border-amber-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-amber-800 shrink-0" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full sm:w-auto py-2 px-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="ALL">All Stages</option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
                <option value="OTHER">Other / Custom Stage Filter...</option>
              </select>
            </div>
            {stageFilter === "OTHER" && (
              <input
                type="text"
                value={customStageFilter}
                onChange={(e) => setCustomStageFilter(e.target.value)}
                placeholder="Type custom stage name..."
                className="py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-700 w-full sm:w-48"
              />
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Project / Furniture Item</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Manufacturing Stage</th>
                <th className="p-4 text-center">WhatsApp Alert</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                    Fetching manufacturer orders from database...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No orders matching your filter. Click "Create Direct Customer Order" above.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;
                  const firstItem = ord.OrderItem?.[0];
                  const isCustom = !firstItem?.productId;

                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/50 transition-colors">
                      {/* Order # */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block font-mono">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-slate-500 text-[10px] block">{ord.customerPhone}</span>
                        <span className="text-slate-400 text-[10px]">{ord.city || "Mumbai"}</span>
                      </td>

                      {/* Item Details */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {isCustom ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-900 uppercase">
                                Custom Bespoke
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 uppercase">
                                Catalog Piece
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 text-xs line-clamp-1">
                            {firstItem?.title || "Handcrafted Furniture"}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {firstItem?.woodType} • {firstItem?.finishType}
                          </p>
                          {ord.customerNotes && (
                            <p className="text-[10px] text-amber-800 italic line-clamp-1">
                              Note: {ord.customerNotes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-medium">Paid / In Production</span>
                      </td>

                      {/* Stage dropdown & Custom Milestone */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <select
                            disabled={isUpdating || ord.status === "DELIVERED" || ord.status === "CANCELLED"}
                            value={STAGES.some((s) => s.value === currentStage) ? currentStage : "OTHER"}
                            onChange={(e) => {
                              if (e.target.value === "OTHER") {
                                handleCustomStagePrompt(ord.id);
                                return;
                              }
                              const opt = STAGES.find((s) => s.value === e.target.value);
                              handleStageUpdate(ord.id, e.target.value, opt?.status || ord.status);
                            }}
                            className="bg-amber-50/80 text-slate-900 border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-700 max-w-[190px]"
                          >
                            {STAGES.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            <option value="OTHER">
                              {!STAGES.some((s) => s.value === currentStage) && currentStage !== "CANCELLED"
                                ? `Milestone: ${currentStage}`
                                : "+ Other (Custom Milestone)..."}
                            </option>
                          </select>

                          {ord.status === "CANCELLED" && (
                            <span className="block px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-900 border border-red-200">
                              Order Cancelled
                            </span>
                          )}
                          {!STAGES.some((s) => s.value === currentStage) && ord.status !== "CANCELLED" && (
                            <span className="block px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200 truncate max-w-[180px]">
                              Custom: {currentStage}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WhatsApp Notify */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openNotifyModal(ord)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                          title="Send detailed WhatsApp notification with product/custom furniture info"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Notify</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          {/* 1-Click Advance to Next Stage */}
                          {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (() => {
                            const nextInfo = getNextStageDetails(ord.productionStage);
                            if (!nextInfo) return null;
                            return (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStage(ord.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-50 font-bold text-xs inline-flex items-center gap-1 transition-all shadow-sm"
                                title={`1-Click: Advance to ${nextInfo.label}`}
                              >
                                <ArrowRightCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Next ➔ {nextInfo.label.split(" ")[0]}</span>
                              </button>
                            );
                          })()}

                          {/* Cancel Order with Reason Modal */}
                          {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => {
                                setCancelModalOrder(ord);
                                setCancelReason("");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              title="Cancel order (mandatory reason required)"
                            >
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(ord)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3 text-amber-800" />
                            <span>Edit</span>
                          </button>

                          {ord.isArchived ? (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleRestoreOrder(ord)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              title="Restore order"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-700" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            (ord.status === "DELIVERED" || ord.status === "CANCELLED" || ord.productionStage === "DELIVERED") && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleArchiveOrder(ord)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-900 text-slate-600 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                                title="Archive completed or cancelled order"
                              >
                                <Archive className="w-3 h-3" />
                                <span>Archive</span>
                              </button>
                            )
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
      {/* 🚀 MODAL 1: CREATE DIRECT CUSTOMER ORDER (Custom Furniture)   */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 my-8">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Walk-In / Direct Consultation
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                  Create Direct Customer Order
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5 text-xs">
              {/* Toggle Order Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Order Category:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("custom")}
                    className={`py-3 px-4 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-2 ${
                      orderType === "custom"
                        ? "bg-amber-950 text-amber-50 border-amber-950 shadow-sm"
                        : "bg-amber-50 text-slate-700 border-amber-200"
                    }`}
                  >
                    <Hammer className="w-4 h-4 text-amber-400" />
                    <span>Custom Bespoke Furniture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("catalog")}
                    className={`py-3 px-4 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-2 ${
                      orderType === "catalog"
                        ? "bg-amber-950 text-amber-50 border-amber-950 shadow-sm"
                        : "bg-amber-50 text-slate-700 border-amber-200"
                    }`}
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Standard Catalog Piece</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Fields for Custom vs Catalog */}
              {orderType === "custom" ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="font-bold text-amber-950 block text-xs">Custom Furniture Specifications:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Custom Furniture Title:</label>
                      <input
                        type="text"
                        required
                        value={newOrder.customTitle}
                        onChange={(e) => {
                          setNewOrder({ ...newOrder, customTitle: e.target.value });
                          if (createErrors.customTitle) setCreateErrors((prev) => ({ ...prev, customTitle: null }));
                        }}
                        placeholder="e.g. Bespoke 8-Seater Fluted Teak Dining Set"
                        className={`w-full p-2.5 rounded-xl border ${
                          createErrors.customTitle ? "border-red-500" : "border-amber-200"
                        } bg-white`}
                      />
                      {createErrors.customTitle && <p className="text-red-500 text-[10px] mt-1">{createErrors.customTitle}</p>}
                    </div>
                    <div>
                      <SearchableSelect
                        label="Timber Selection:"
                        options={WOOD_OPTIONS}
                        value={newOrder.woodType}
                        onChange={(val) => setNewOrder({ ...newOrder, woodType: val })}
                        allowOther={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Custom Dimensions:</label>
                      <input
                        type="text"
                        value={newOrder.dimensions}
                        onChange={(e) => setNewOrder({ ...newOrder, dimensions: e.target.value })}
                        placeholder='e.g. 84" L x 40" W x 30" H'
                        className="w-full p-2.5 rounded-xl border border-amber-200 bg-white"
                      />
                    </div>
                    <div>
                      <SearchableSelect
                        label="Finishing Polish:"
                        options={FINISH_OPTIONS}
                        value={newOrder.finishType}
                        onChange={(val) => setNewOrder({ ...newOrder, finishType: val })}
                        allowOther={true}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Special Crafting Notes:</label>
                    <textarea
                      rows="2"
                      value={newOrder.customNotes}
                      onChange={(e) => setNewOrder({ ...newOrder, customNotes: e.target.value })}
                      placeholder="e.g. Client requested beveled tabletop edges, brass leg caps, and extra lumbar cushion firmness..."
                      className="w-full p-2.5 rounded-xl border border-amber-200 bg-white"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <SearchableSelect
                    label="Select Catalog Furniture Piece:"
                    options={catalogProducts.map((p) => ({
                      value: p.id,
                      label: `${p.title} — ₹${p.price.toLocaleString("en-IN")} (${p.woodType})`,
                    }))}
                    value={newOrder.selectedProductId}
                    onChange={(val) => {
                      const p = catalogProducts.find((item) => item.id === val);
                      setNewOrder({
                        ...newOrder,
                        selectedProductId: val,
                        totalAmount: p ? String(p.price) : newOrder.totalAmount,
                      });
                    }}
                    allowOther={false}
                  />
                </div>
              )}

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customerName}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, customerName: e.target.value });
                      if (createErrors.customerName) setCreateErrors((prev) => ({ ...prev, customerName: null }));
                    }}
                    placeholder="e.g. Rahul Singhania"
                    className={`w-full p-2.5 rounded-xl border ${
                      createErrors.customerName ? "border-red-500" : "border-amber-200"
                    }`}
                  />
                  {createErrors.customerName && <p className="text-red-500 text-[10px] mt-1">{createErrors.customerName}</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newOrder.customerPhone}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, customerPhone: e.target.value });
                      if (createErrors.customerPhone) setCreateErrors((prev) => ({ ...prev, customerPhone: null }));
                    }}
                    placeholder="e.g. +91 98201 12345"
                    className={`w-full p-2.5 rounded-xl border ${
                      createErrors.customerPhone ? "border-red-500" : "border-amber-200"
                    }`}
                  />
                  {createErrors.customerPhone && <p className="text-red-500 text-[10px] mt-1">{createErrors.customerPhone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.shippingAddress}
                    onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
                    placeholder="e.g. Penthouse 14, Sea Green Apartments, Worli"
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solapur"
                    value={newOrder.city}
                    onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Agreed Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newOrder.totalAmount}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, totalAmount: e.target.value });
                      if (createErrors.totalAmount) setCreateErrors((prev) => ({ ...prev, totalAmount: null }));
                    }}
                    placeholder="e.g. 85000"
                    className={`w-full p-2.5 rounded-xl border ${
                      createErrors.totalAmount ? "border-red-500" : "border-amber-200"
                    } font-bold text-amber-900`}
                  />
                  {createErrors.totalAmount && <p className="text-red-500 text-[10px] mt-1">{createErrors.totalAmount}</p>}
                </div>
                <div>
                  <SearchableSelect
                    label="Initial Production Stage"
                    options={[
                      ...STAGE_OPTIONS,
                      { value: "OTHER", label: "Other (Type custom milestone...)" },
                    ]}
                    value={newOrder.productionStage}
                    onChange={(val) => setNewOrder({ ...newOrder, productionStage: val })}
                    allowOther={true}
                    otherPlaceholder="Type custom milestone / stage (e.g. CNC 3D Carving)..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Registering Order in Database..." : "Register Order & Start Manufacturing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ✏️ MODAL 2: EDIT ORDER DETAILS                                */}
      {/* ============================================================== */}
      {showEditModal && selectedOrderForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Update Database Record
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                  Edit Order #{selectedOrderForEdit.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerName}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, customerName: e.target.value });
                      if (editErrors.customerName) setEditErrors((prev) => ({ ...prev, customerName: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      editErrors.customerName ? "border-red-500" : "border-amber-200"
                    }`}
                  />
                  {editErrors.customerName && <p className="text-red-500 text-[10px] mt-1">{editErrors.customerName}</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Phone:</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.customerPhone}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, customerPhone: e.target.value });
                      if (editErrors.customerPhone) setEditErrors((prev) => ({ ...prev, customerPhone: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      editErrors.customerPhone ? "border-red-500" : "border-amber-200"
                    }`}
                  />
                  {editErrors.customerPhone && <p className="text-red-500 text-[10px] mt-1">{editErrors.customerPhone}</p>}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Address:</label>
                <input
                  type="text"
                  required
                  value={editFormData.shippingAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, shippingAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Postal Code:</label>
                  <input
                    type="text"
                    value={editFormData.postalCode}
                    onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Amount (₹):</label>
                  <input
                    type="number"
                    required
                    value={editFormData.totalAmount}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, totalAmount: e.target.value });
                      if (editErrors.totalAmount) setEditErrors((prev) => ({ ...prev, totalAmount: null }));
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      editErrors.totalAmount ? "border-red-500" : "border-amber-200"
                    } font-bold`}
                  />
                  {editErrors.totalAmount && <p className="text-red-500 text-[10px] mt-1">{editErrors.totalAmount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <SearchableSelect
                    label="Manufacturing Stage:"
                    options={[
                      ...STAGE_OPTIONS,
                      { value: "OTHER", label: "Other (Type custom milestone...)" },
                    ]}
                    value={editFormData.productionStage}
                    onChange={(val) => setEditFormData({ ...editFormData, productionStage: val })}
                    allowOther={true}
                    otherPlaceholder="Type custom milestone / stage (e.g. Velvet Tufting)..."
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tracking Number:</label>
                  <input
                    type="text"
                    value={editFormData.trackingNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, trackingNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order / Crafting Notes:</label>
                <textarea
                  rows="2"
                  value={editFormData.customerNotes}
                  onChange={(e) => setEditFormData({ ...editFormData, customerNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-200"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Updating Database..." : "Save Order Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 💬 MODAL 3: WHATSAPP NOTIFICATION PREVIEW                     */}
      {/* ============================================================== */}
      {showNotifyModal && selectedOrderForNotify && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-900">
                    Send WhatsApp Project Update
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Recipient: {selectedOrderForNotify.customerName} ({selectedOrderForNotify.customerPhone})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Formatted WhatsApp Message (Includes Product ID & Custom Furniture Details):
              </span>
              <pre className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {generateWhatsAppMessage(selectedOrderForNotify)}
              </pre>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => dispatchWhatsApp(selectedOrderForNotify)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🛑 MODAL 4: CANCEL ORDER WITH MANDATORY REASON                 */}
      {/* ============================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-800">
                  Cancel Order
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Cancel Order #{cancelModalOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Customer: <strong className="text-slate-900">{cancelModalOrder.customerName}</strong> ({cancelModalOrder.customerPhone})
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter detailed reason why the order is cancelled (e.g. Customer requested size changes, relocated, timber out of stock)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-medium"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Customer requested specification change",
                  "Customer relocated / timeline conflict",
                  "Raw timber stock shortage",
                  "Duplicate order created by mistake",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCancelReason(tag)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
