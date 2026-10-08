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
  Eye,
  Printer,
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
  const [mounted, setMounted] = useState(false);
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
  const [selectedOrderForInspect, setSelectedOrderForInspect] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
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
    setMounted(true);
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stageParam = params.get("stage");
      const searchParam = params.get("search");
      if (stageParam) {
        setStageFilter(stageParam);
      }
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }
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

  // Generate WhatsApp Message text incorporating all items, prices, and address
  const generateWhatsAppMessage = (order) => {
    if (!order) return "";
    const items = order.OrderItem || [];
    const itemDetails = items
      .map((item, idx) => {
        const title = item.title || "Handcrafted Furniture";
        const qty = item.quantity || 1;
        const wood = item.woodType || item.Product?.woodType || "Grade-A Sagwan Teak";
        const finish = item.finishType || item.Product?.finishType || "Natural Teak Honey Polish";
        const price = Number(item.price || 0);
        return `   ${idx + 1}. *${title}*\n      • Qty: ${qty} | Timber: ${wood}\n      • Polish: ${finish} | Price: ₹${(price * qty).toLocaleString("en-IN")}`;
      })
      .join("\n\n");

    const stageFormatted = (order.productionStage || "INQUIRY_RECEIVED").replace(/_/g, " ");

    return (
      `*AAMEENA FURNITURE MANUFACTURER, SOLAPUR*\n` +
      `*Official Order Production & Dispatch Notice*\n\n` +
      `Hello ${order.customerName},\n\n` +
      `Your handcrafted furniture order *#${order.orderNumber}* has been updated!\n\n` +
      `📍 *Current Crafting Stage:* ${stageFormatted}\n` +
      `🚚 *Tracking ID:* ${order.trackingNumber || "AF-MFG-" + order.orderNumber}\n` +
      `🏡 *Delivery Destination:* ${order.shippingAddress || "Solapur"}, ${order.city || "Solapur"}${order.postalCode ? " - " + order.postalCode : ""}\n` +
      `🏢 *Manufacturer Unit:* AMEENA Distributors’s Sofa Set Furniture Company, Solapur\n\n` +
      `🪵 *Ordered Furniture Items (${items.length}):*\n` +
      `${itemDetails || "   • Handcrafted Luxury Solid Wood Furniture"}\n\n` +
      `💰 *Total Order Amount:* ₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}\n\n` +
      `Our master artisans ensure every mortise-and-tenon joint and polish coat meets heirloom quality standards.\n\n` +
      `Track live anytime: https://aameenafurniture.com/orders\n` +
      `Thank you for trusting Aameena Furniture Manufacturer!`
    );
  };

  const dispatchWhatsApp = (order) => {
    const phone = (order.customerPhone || "").replace(/[^0-9]/g, "");
    const formattedPhone = phone.startsWith("91") ? phone : (phone ? `91${phone}` : "919730392917");
    const msg = generateWhatsAppMessage(order);
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`, "_blank");
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

  if (!mounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" suppressHydrationWarning>
          <div className="space-y-2">
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
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 w-10 h-10" />
            <div className="px-5 py-2.5 rounded-xl bg-amber-900/60 w-48 h-10" />
          </div>
        </div>

        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-white border border-amber-200 p-8 shadow-sm" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-800" />
          <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
            Loading Workshop Orders & Dispatch Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" suppressHydrationWarning>
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
            suppressHydrationWarning
            onClick={loadData}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            suppressHydrationWarning
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
      <div className="bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4" suppressHydrationWarning>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            suppressHydrationWarning
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
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-amber-100">
          <table className="w-full text-left text-xs text-slate-700 min-w-[920px]">
            <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Delivery Destination (Where From)</th>
                <th className="p-4">Project / Furniture Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Manufacturing Stage</th>
                <th className="p-4 text-center">WhatsApp Alert</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
                    Fetching manufacturer orders from database...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No orders matching your filter. Click "Create Direct Customer Order" above.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;
                  const firstItem = ord.OrderItem?.[0];
                  const isCustom = !firstItem?.productId;
                  const itemsCount = ord.OrderItem?.length || 0;

                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/50 transition-colors">
                      {/* Order # */}
                      <td className="p-4 align-top">
                        <span className="font-bold text-slate-900 block font-mono">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {ord.trackingNumber && (
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                            Track: {ord.trackingNumber}
                          </span>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td className="p-4 align-top">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-slate-600 text-[11px] block">{ord.customerPhone}</span>
                        {ord.customerEmail && (
                          <span className="text-slate-400 text-[10px] block truncate max-w-[140px]">
                            {ord.customerEmail}
                          </span>
                        )}
                      </td>

                      {/* Delivery Destination (Where From) */}
                      <td className="p-4 align-top max-w-[200px]">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{ord.city || "Solapur"}</span>
                          {ord.postalCode && <span className="text-slate-400 text-xs font-normal">({ord.postalCode})</span>}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2" title={ord.shippingAddress}>
                          {ord.shippingAddress}
                        </div>
                      </td>

                      {/* Item Details: Multi-item display */}
                      <td className="p-4 align-top max-w-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isCustom ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-900 uppercase">
                                Custom Bespoke
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 uppercase">
                                Catalog Piece
                              </span>
                            )}
                            {itemsCount > 1 && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-200 text-amber-950 uppercase">
                                {itemsCount} Items Ordered
                              </span>
                            )}
                          </div>

                          {/* All Ordered Items Itemized */}
                          <div className="space-y-1 mt-1 max-w-[260px]">
                            {(ord.OrderItem || []).map((item, idx) => (
                              <div key={idx} className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-1.5 text-[11px] leading-tight">
                                <div className="font-bold text-slate-900 flex items-start gap-1">
                                  <span className="text-amber-800 font-mono font-bold shrink-0">{idx + 1}.</span>
                                  <span className="line-clamp-1">{item.title}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                                  <span>Qty: {item.quantity || 1} • {item.woodType ? item.woodType.split(" ")[0] : "Teak"}</span>
                                  <span className="text-slate-800 font-mono font-medium">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {ord.customerNotes && (
                            <p className="text-[10px] text-amber-800 italic line-clamp-2 mt-1">
                              Note: {ord.customerNotes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 align-top">
                        <span className="font-bold text-slate-900 text-sm block">
                          ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-medium">
                          {itemsCount} {itemsCount === 1 ? "Item" : "Items"} • Confirmed
                        </span>
                      </td>

                      {/* Stage dropdown & Custom Milestone */}
                      <td className="p-4 align-top">
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
                      <td className="p-4 text-center align-top">
                        <button
                          onClick={() => openNotifyModal(ord)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                          title="Send detailed WhatsApp notification with all ordered items"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Notify</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right align-top">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          {/* 1-Click Advance to Next Stage */}
                          {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (() => {
                            const nextInfo = getNextStageDetails(ord.productionStage);
                            if (!nextInfo) return null;
                            return (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStage(ord.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-50 font-bold text-xs inline-flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                                title={`1-Click: Advance to ${nextInfo.label}`}
                              >
                                <ArrowRightCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Next ➔ {nextInfo.label.split(" ")[0]}</span>
                              </button>
                            );
                          })()}

                          {/* Inspect Full Order Dossier */}
                          <button
                            onClick={() => setSelectedOrderForInspect(ord)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Inspect full order dossier with all items, client details & delivery destination"
                          >
                            <Eye className="w-3 h-3 text-indigo-700" />
                            <span>Inspect</span>
                          </button>

                          {/* Receipt / Invoice Modal */}
                          <button
                            onClick={() => {
                              setSelectedOrderForReceipt(ord);
                              setShowReceiptModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="View official workshop receipt & invoice breakdown"
                          >
                            <FileText className="w-3 h-3 text-blue-700" />
                            <span>Receipt</span>
                          </button>

                          {/* Cancel Order with Reason Modal */}
                          {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => {
                                setCancelModalOrder(ord);
                                setCancelReason("");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Cancel order (mandatory reason required)"
                            >
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(ord)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-amber-800" />
                            <span>Edit</span>
                          </button>

                          {ord.isArchived ? (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleRestoreOrder(ord)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
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
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-900 text-slate-600 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 📄 MODAL 5: OFFICIAL WORKSHOP INVOICE / RECEIPT SUMMARY         */}
      {/* ============================================================== */}
      {showReceiptModal && selectedOrderForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-bold tracking-widest block">Official Workshop Invoice</span>
                <h3 className="text-lg font-bold font-serif text-slate-900">Order Receipt #{selectedOrderForReceipt.orderNumber}</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">Client Name:</span>
                  <span className="font-bold text-slate-900 block">{selectedOrderForReceipt.customerName}</span>
                  <span className="text-slate-600 text-[10px]">{selectedOrderForReceipt.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Manufacturing Store:</span>
                  <span className="font-bold text-amber-900 block">AMEENA Distributors, Solapur</span>
                  <span className="text-slate-500 text-[10px]">Tracking ID: {selectedOrderForReceipt.trackingNumber || "N/A"}</span>
                </div>
              </div>

              {/* Delivery Destination in Receipt */}
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
                <span className="text-slate-500 block text-[10px]">Delivery Destination (Where Ordered From):</span>
                <span className="font-semibold text-slate-800 block">{selectedOrderForReceipt.shippingAddress}</span>
                <span className="text-slate-500 text-[10px]">{selectedOrderForReceipt.city} {selectedOrderForReceipt.postalCode ? `- ${selectedOrderForReceipt.postalCode}` : ""}</span>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-2">Order Line Items ({selectedOrderForReceipt.OrderItem?.length || 0}):</span>
                <div className="divide-y divide-amber-100 bg-amber-50/40 rounded-2xl border border-amber-200/80 p-3 space-y-2">
                  {(selectedOrderForReceipt.OrderItem || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="text-slate-600 text-[10px]">
                          Qty: {item.quantity || 1} • {item.woodType || item.Product?.woodType || "Grade-A Sagwan Teak"} • {item.finishType || item.Product?.finishType || "Honey Polish"}
                        </span>
                      </div>
                      <span className="font-bold text-amber-900 font-mono">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrderForReceipt.totalAmount / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Hardwood Furnishing):</span>
                  <span>₹{(selectedOrderForReceipt.totalAmount - selectedOrderForReceipt.totalAmount / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-amber-200">
                  <span>Total Amount Paid / Payable:</span>
                  <span className="text-amber-900 font-mono">₹{Number(selectedOrderForReceipt.totalAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🔍 MODAL 6: FULL ORDER DOSSIER & MULTI-ITEM INSPECTION MODAL   */}
      {/* ============================================================== */}
      {selectedOrderForInspect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Showroom Dossier
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedOrderForInspect.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-1">
                  Order #{selectedOrderForInspect.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForInspect(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Milestone Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                <span className="font-bold text-emerald-800">{selectedOrderForInspect.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Crafting Milestone</span>
                <span className="font-bold text-amber-900 capitalize">
                  {(selectedOrderForInspect.productionStage || "Inquiry").replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Tracking Number</span>
                <span className="font-mono text-slate-800">{selectedOrderForInspect.trackingNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Value</span>
                <span className="font-bold text-slate-900 font-mono">₹{Number(selectedOrderForInspect.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Customer Profile & White-Glove Destination */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>Customer Profile & White-Glove Destination (Where Ordered From)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Client Name & Contact:</span>
                  <span className="font-bold text-slate-900 block text-sm">{selectedOrderForInspect.customerName}</span>
                  <a
                    href={`tel:${selectedOrderForInspect.customerPhone}`}
                    className="text-amber-800 hover:underline inline-block mt-0.5 font-semibold"
                  >
                    📞 {selectedOrderForInspect.customerPhone}
                  </a>
                  {selectedOrderForInspect.customerEmail && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      ✉️ {selectedOrderForInspect.customerEmail}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">White-Glove Shipping Address:</span>
                  <span className="font-medium text-slate-800 block">
                    {selectedOrderForInspect.shippingAddress}
                  </span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    City / Pin: {selectedOrderForInspect.city || "Solapur"} {selectedOrderForInspect.postalCode ? `- ${selectedOrderForInspect.postalCode}` : ""}
                  </span>
                </div>
              </div>
              {selectedOrderForInspect.customerNotes && (
                <div className="pt-2 border-t border-amber-200/60 text-xs">
                  <span className="text-slate-500 block text-[10px]">Special Instructions / Notes:</span>
                  <span className="text-amber-900 italic">{selectedOrderForInspect.customerNotes}</span>
                </div>
              )}
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-800" />
                  <span>All Ordered Furniture Pieces ({selectedOrderForInspect.OrderItem?.length || 0})</span>
                </h4>
              </div>

              <div className="divide-y divide-amber-100 bg-amber-50/40 rounded-2xl border border-amber-200/80 overflow-hidden">
                {(selectedOrderForInspect.OrderItem || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900 font-mono text-sm">#{idx + 1}</span>
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        {item.productId ? (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            Catalog: {item.productId.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded">
                            Bespoke Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                        <span>🪵 <strong>Timber:</strong> {item.woodType || "Grade-A Sagwan Teak"}</span>
                        <span>✨ <strong>Finish:</strong> {item.finishType || "Natural Teak Honey Polish"}</span>
                        <span>🔢 <strong>Quantity:</strong> {item.quantity || 1}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-400 text-[10px] block">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")} × {item.quantity || 1}
                      </span>
                      <span className="font-bold text-amber-900 font-mono text-sm">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Base Value):</span>
                <span>₹{(selectedOrderForInspect.totalAmount / 1.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Teakwood Manufacturing):</span>
                <span>₹{(selectedOrderForInspect.totalAmount - selectedOrderForInspect.totalAmount / 1.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-amber-200">
                <span>Total Amount Paid / Payable:</span>
                <span className="text-amber-900 font-mono">₹{Number(selectedOrderForInspect.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Modal Quick Actions */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  openNotifyModal(selectedOrderForInspect);
                }}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForReceipt(selectedOrderForInspect);
                  setShowReceiptModal(true);
                }}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice / Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openEditModal(selectedOrderForInspect);
                  setSelectedOrderForInspect(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForInspect(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
