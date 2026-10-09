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
  ArrowRightCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getOrders,
  updateOrderStage,
  createDirectOrder,
  updateOrderDetails,
  archiveOrder,
  restoreOrder,
  cancelCustomerOrder,
  advanceOrderToNextStage,
  cancelOrderByManager,
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
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed" | "archived" | "cancelled" | "all"
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Validation error states
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [customStageFilter, setCustomStageFilter] = useState("");
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [selectedOrderForNotify, setSelectedOrderForNotify] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [selectedOrderForInspect, setSelectedOrderForInspect] = useState(null);
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
    setMounted(true);
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
      setActionMessage({
        type: "success",
        text: `Order advanced to stage: ${res.nextStage.replace(/_/g, " ")}${
          res.newStatus === "DELIVERED" ? " (Marked DELIVERED & inventory updated)" : ""
        }`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to advance stage." });
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
      setActionMessage({
        type: "success",
        text: `Order #${cancelModalOrder.orderNumber} cancelled. Reason recorded in database.`,
      });
      setCancelModalOrder(null);
      setCancelReason("");
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ type: "error", text: res.error || "Failed to cancel order." });
    }
    setCancelling(false);
  };

  const handleCustomStagePrompt = async (orderId) => {
    const customStage = prompt("Enter custom manufacturing milestone / stage name (e.g. CNC 3D Carving, Velvet Tufting):");
    if (!customStage || !customStage.trim()) return;
    await handleUpdate(orderId, customStage.trim(), "IN_PRODUCTION");
  };

  const handleCancel = async (orderId, orderNumber) => {
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setCancelModalOrder(ord);
      setCancelReason("");
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

    const items = selectedOrderForNotify.OrderItem || [];
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

    const stageLabel =
      STAGE_OPTIONS.find((s) => s.value === selectedOrderForNotify.productionStage)?.label ||
      selectedOrderForNotify.productionStage;

    const message = `Namaste ${selectedOrderForNotify.customerName}! 🪑

Update from *AMEENA Distributors’s Sofa Set Furniture Company, Solapur*:
Your order *#${selectedOrderForNotify.orderNumber}* is currently at milestone:
*➡️ ${stageLabel}*

*Ordered Furniture Pieces (${items.length}):*
${itemDetails || "   • Handcrafted Luxury Solid Wood Furniture"}

*Tracking ID:* ${selectedOrderForNotify.trackingNumber || "AF-SOLAPUR-DISPATCH"}
*Amount:* ₹${Number(selectedOrderForNotify.totalAmount || 0).toLocaleString("en-IN")}
*Delivery Destination:* ${selectedOrderForNotify.shippingAddress}, ${selectedOrderForNotify.city}

${notifyNotes ? `*Important Update:* ${notifyNotes}\n\n` : ""}Thank you for choosing AMEENA Distributors!
📍 Location: Near Old Poona Naka, Ring Road, Solapur.`;

    return `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(message)}`;
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    let matchesTab = true;
    if (activeTab === "active") {
      matchesTab = !o.isArchived && o.status !== "CANCELLED" && o.productionStage !== "DELIVERED" && o.status !== "DELIVERED";
    } else if (activeTab === "completed") {
      matchesTab = !o.isArchived && (o.productionStage === "DELIVERED" || o.status === "DELIVERED");
    } else if (activeTab === "archived") {
      matchesTab = o.isArchived === true;
    } else if (activeTab === "cancelled") {
      matchesTab = !o.isArchived && (o.status === "CANCELLED" || o.productionStage === "CANCELLED");
    } else if (activeTab === "all") {
      matchesTab = true;
    }

    let matchesStage = true;
    if (stageFilter === "ALL") {
      matchesStage = true;
    } else if (stageFilter === "OTHER") {
      if (customStageFilter.trim()) {
        matchesStage = (o.productionStage || "").toLowerCase().includes(customStageFilter.toLowerCase().trim());
      } else {
        const standardKeys = STAGE_OPTIONS.map((s) => s.value);
        matchesStage = !standardKeys.includes(o.productionStage);
      }
    } else {
      matchesStage = o.productionStage === stageFilter;
    }

    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.productionStage && o.productionStage.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesStage && matchesSearch;
  });

  const activeOrdersCount = orders.filter((o) => !o.isArchived && o.status !== "CANCELLED" && o.productionStage !== "DELIVERED" && o.status !== "DELIVERED").length;
  const completedOrdersCount = orders.filter((o) => !o.isArchived && (o.productionStage === "DELIVERED" || o.status === "DELIVERED")).length;
  const archivedOrdersCount = orders.filter((o) => o.isArchived).length;
  const cancelledOrdersCount = orders.filter((o) => !o.isArchived && (o.status === "CANCELLED" || o.productionStage === "CANCELLED")).length;
  const allOrdersCount = orders.length;

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedOrders = filteredOrders.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);


  if (!mounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        {/* Header Skeleton */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" suppressHydrationWarning>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Dispatch & Logistics</span>
            <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Order Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create direct orders, track 7 production stages, trigger stock deduction on delivery, and dispatch WhatsApp alerts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 w-10 h-10" />
            <div className="px-5 py-2.5 rounded-xl bg-amber-500/70 w-36 h-10" />
          </div>
        </div>

        {/* Loading Spinner Area */}
        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-slate-950 border border-slate-800 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Loading Live Orders & Production Pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" suppressHydrationWarning>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Order Dispatch & Logistics</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Admin Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create direct orders, track 7 production stages, trigger stock deduction on delivery, and dispatch WhatsApp alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            suppressHydrationWarning
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Create Direct Order</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3" suppressHydrationWarning>
          <div className="flex flex-wrap items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Active ({activeOrdersCount})</span>
            </button>

            <button
              suppressHydrationWarning
              onClick={() => { setActiveTab("completed"); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "completed"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed ({completedOrdersCount})</span>
            </button>

            <button
              suppressHydrationWarning
              onClick={() => { setActiveTab("cancelled"); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "cancelled"
                  ? "bg-red-500 text-slate-950 shadow-md shadow-red-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-red-400" />
              <span>Cancelled ({cancelledOrdersCount})</span>
            </button>

            <button
              suppressHydrationWarning
              onClick={() => { setActiveTab("archived"); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "archived"
                  ? "bg-slate-700 text-white shadow-md shadow-slate-700/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived ({archivedOrdersCount})</span>
            </button>

            <button
              suppressHydrationWarning
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>All ({allOrdersCount})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto" suppressHydrationWarning>
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search by client, ID, phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                suppressHydrationWarning
                value={stageFilter}
                onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
              >
                <option value="ALL">All Production Stages</option>
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                <option value="OTHER">Other / Custom Stage Filter...</option>
              </select>
              {stageFilter === "OTHER" && (
                <input
                  suppressHydrationWarning
                  type="text"
                  value={customStageFilter}
                  onChange={(e) => { setCustomStageFilter(e.target.value); setCurrentPage(1); }}
                  placeholder="Type custom stage name..."
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-600 text-slate-100 text-xs focus:outline-none w-44"
                />
              )}
            </div>
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
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
          <table className="w-full text-left text-xs text-slate-300 min-w-[920px]">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order # & Items</th>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Delivery Destination (Where From)</th>
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
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    {activeTab === "archived" ? "No archived orders found." : "No orders found matching filter criteria."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const currentStage = ord.productionStage || "INQUIRY_RECEIVED";
                  const isUpdating = updatingId === ord.id;
                  const canArchive = ord.status === "DELIVERED" || ord.status === "CANCELLED";
                  const firstItem = ord.OrderItem?.[0];
                  const isCustom = !firstItem?.productId;
                  const itemsCount = ord.OrderItem?.length || 0;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Order # and All Items */}
                      <td className="p-4 font-bold text-white align-top">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono">{ord.orderNumber}</span>
                          {isCustom && (
                            <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                              Bespoke
                            </span>
                          )}
                          {itemsCount > 1 && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold">
                              {itemsCount} Items Ordered
                            </span>
                          )}
                        </div>

                        {/* All Items Itemized in Admin Table */}
                        <div className="mt-2 space-y-1.5 max-w-[240px]">
                          {(ord.OrderItem || []).map((item, idx) => (
                            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-1.5 text-[11px] leading-tight font-normal">
                              <div className="font-bold text-amber-300 flex items-start gap-1">
                                <span className="text-amber-400 font-mono shrink-0">{idx + 1}.</span>
                                <span className="line-clamp-1">{item.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                                <span>Qty: {item.quantity || 1} • {item.woodType ? item.woodType.split(" ")[0] : "Teak"}</span>
                                <span className="text-slate-200 font-mono">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {ord.trackingNumber && (
                          <div className="text-[9px] text-slate-500 font-mono mt-1">Track: {ord.trackingNumber}</div>
                        )}
                      </td>

                      {/* Client Contact */}
                      <td className="p-4 align-top">
                        <span className="font-bold text-white block">{ord.customerName}</span>
                        <span className="text-slate-400 text-[11px] block">{ord.customerPhone}</span>
                        {ord.customerEmail && (
                          <span className="text-slate-500 text-[10px] block truncate max-w-[150px]">{ord.customerEmail}</span>
                        )}
                      </td>

                      {/* Delivery Destination (Where From) */}
                      <td className="p-4 text-slate-300 align-top">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{ord.city || "Solapur"}</span>
                          {ord.postalCode && <span className="text-slate-400 text-xs font-normal">({ord.postalCode})</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-snug max-w-[190px]" title={ord.shippingAddress}>
                          {ord.shippingAddress}
                        </div>
                        {ord.customerNotes && (
                          <div className="text-[10px] text-amber-300/80 italic mt-1 max-w-[190px] line-clamp-2" title={ord.customerNotes}>
                            Note: {ord.customerNotes}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-bold text-white align-top">
                        <span className="text-sm">₹{ord.totalAmount.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-slate-500 block font-normal">
                          ({itemsCount} {itemsCount === 1 ? "item" : "items"})
                        </span>
                      </td>

                      {/* Crafting Stage */}
                      <td className="p-4 align-top">
                        <span className="text-amber-400 font-medium capitalize">
                          {currentStage.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 align-top">
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

                      {/* Actions */}
                      <td className="p-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1-Click Advance to Next Stage */}
                          {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (() => {
                            const nextInfo = getNextStageDetails(ord.productionStage);
                            if (!nextInfo) return null;
                            return (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStage(ord.id)}
                                className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 transition-all shadow-sm"
                                title={`1-Click: Advance directly to ${nextInfo.label}`}
                              >
                                <ArrowRightCircle className="w-3.5 h-3.5" />
                                <span>Next ➔ {nextInfo.label.split(" ")[0]}</span>
                              </button>
                            );
                          })()}

                          {/* Stage Dropdown */}
                          <select
                            disabled={isUpdating || ord.status === "CANCELLED" || ord.status === "DELIVERED"}
                            value={STAGE_OPTIONS.some((s) => s.value === currentStage) ? currentStage : "OTHER"}
                            onChange={(e) => {
                              if (e.target.value === "OTHER") {
                                handleCustomStagePrompt(ord.id);
                                return;
                              }
                              const selected = STAGE_OPTIONS.find((s) => s.value === e.target.value);
                              handleUpdate(ord.id, e.target.value, selected?.status || ord.status);
                            }}
                            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[140px]"
                          >
                            {STAGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            <option value="OTHER">
                              {!STAGE_OPTIONS.some((s) => s.value === currentStage) && currentStage !== "CANCELLED"
                                ? `Milestone: ${currentStage}`
                                : "+ Other (Custom Milestone)..."}
                            </option>
                          </select>

                          {/* Inspect Full Order Dossier */}
                          <button
                            onClick={() => setSelectedOrderForInspect(ord)}
                            className="p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 transition-colors"
                            title="Inspect full order dossier with all items, client details & delivery destination"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

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

                          {/* Cancel Button (Opens Modal with Mandatory Reason) */}
                          {ord.status !== "CANCELLED" && ord.status !== "DELIVERED" && (
                            <button
                              onClick={() => handleCancel(ord.id, ord.orderNumber)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 transition-colors"
                              title="Cancel order (mandatory reason required)"
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

        {/* Pagination Controls (10 orders per page) */}
        {filteredOrders.length > ITEMS_PER_PAGE && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-bold text-white">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> of{" "}
              <span className="font-bold text-white">{filteredOrders.length}</span> orders
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                if (
                  num === 1 ||
                  num === totalPages ||
                  (num >= safeCurrentPage - 1 && num <= safeCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        safeCurrentPage === num
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {num}
                    </button>
                  );
                }
                if (num === safeCurrentPage - 2 || num === safeCurrentPage + 2) {
                  return (
                    <span key={num} className="px-1 text-slate-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
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
                    options={[
                      ...STAGE_OPTIONS,
                      { value: "OTHER", label: "Other (Type custom milestone...)" },
                    ]}
                    value={newOrder.productionStage}
                    onChange={(val) => setNewOrder({ ...newOrder, productionStage: val })}
                    allowOther={true}
                    otherPlaceholder="Type custom milestone / stage (e.g. CNC 3D Carving)..."
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
                  <SearchableSelect
                    label="Manufacturing Milestone"
                    options={[
                      ...STAGE_OPTIONS,
                      { value: "OTHER", label: "Other (Type custom milestone...)" },
                    ]}
                    value={editFormData.productionStage}
                    onChange={(val) => setEditFormData({ ...editFormData, productionStage: val })}
                    allowOther={true}
                    otherPlaceholder="Type custom milestone..."
                    dark={true}
                  />
                </div>
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

              {/* Delivery Destination in Receipt */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Delivery Destination (Where Ordered From):</span>
                <span className="font-medium text-slate-200 block">{selectedOrderForReceipt.shippingAddress}</span>
                <span className="text-slate-400 text-[10px]">{selectedOrderForReceipt.city} {selectedOrderForReceipt.postalCode ? `- ${selectedOrderForReceipt.postalCode}` : ""}</span>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-2">Order Line Items ({selectedOrderForReceipt.OrderItem?.length || 0}):</span>
                <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2">
                  {(selectedOrderForReceipt.OrderItem || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                      <div>
                        <span className="font-bold text-white block">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Qty: {item.quantity || 1} • {item.woodType || item.Product?.woodType || "Grade-A Sagwan Teak"} • {item.finishType || item.Product?.finishType || "Honey Polish"}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
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
                  <span className="text-amber-400">₹{Number(selectedOrderForReceipt.totalAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Full Order Dossier & Multi-Item Breakdown */}
      {selectedOrderForInspect && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                    Order Dossier
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedOrderForInspect.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-white mt-1">
                  Order #{selectedOrderForInspect.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForInspect(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Stage Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                <span className="font-bold text-emerald-400">{selectedOrderForInspect.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Crafting Stage</span>
                <span className="font-bold text-amber-400 capitalize">
                  {(selectedOrderForInspect.productionStage || "Inquiry").replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Tracking Number</span>
                <span className="font-mono text-slate-200">{selectedOrderForInspect.trackingNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Value</span>
                <span className="font-bold text-white">₹{Number(selectedOrderForInspect.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Customer & Destination: Where user ordered from */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Client Profile & Delivery Destination (Where User Ordered From)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Client Name & Contact:</span>
                  <span className="font-bold text-white block text-sm">{selectedOrderForInspect.customerName}</span>
                  <a
                    href={`tel:${selectedOrderForInspect.customerPhone}`}
                    className="text-amber-400 hover:underline inline-block mt-0.5"
                  >
                    📞 {selectedOrderForInspect.customerPhone}
                  </a>
                  {selectedOrderForInspect.customerEmail && (
                    <span className="text-slate-400 block text-[11px] mt-0.5">
                      ✉️ {selectedOrderForInspect.customerEmail}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">White-Glove Shipping Address:</span>
                  <span className="font-medium text-slate-200 block">
                    {selectedOrderForInspect.shippingAddress}
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    City / Pin: {selectedOrderForInspect.city || "Solapur"} {selectedOrderForInspect.postalCode ? `- ${selectedOrderForInspect.postalCode}` : ""}
                  </span>
                </div>
              </div>
              {selectedOrderForInspect.customerNotes && (
                <div className="pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500 block text-[10px]">Special Instructions / Notes:</span>
                  <span className="text-amber-200 italic">{selectedOrderForInspect.customerNotes}</span>
                </div>
              )}
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>All Ordered Furniture Pieces ({selectedOrderForInspect.OrderItem?.length || 0})</span>
                </h4>
              </div>

              <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                {(selectedOrderForInspect.OrderItem || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 font-mono text-sm">#{idx + 1}</span>
                        <span className="font-bold text-white text-sm">{item.title}</span>
                        {item.productId ? (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                            Catalog: {item.productId.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                            Bespoke Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span>🪵 <strong>Timber:</strong> {item.woodType || "Grade-A Sagwan Teak"}</span>
                        <span>✨ <strong>Finish:</strong> {item.finishType || "Natural Teak Honey Polish"}</span>
                        <span>🔢 <strong>Quantity:</strong> {item.quantity || 1}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-400 text-[10px] block">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")} × {item.quantity || 1}
                      </span>
                      <span className="font-bold text-amber-300 text-sm">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Base Value):</span>
                <span>₹{(selectedOrderForInspect.totalAmount / 1.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% Teakwood Manufacturing):</span>
                <span>₹{(selectedOrderForInspect.totalAmount - selectedOrderForInspect.totalAmount / 1.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                <span>Total Amount Paid / Payable:</span>
                <span className="text-amber-400">₹{Number(selectedOrderForInspect.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Modal Quick Actions */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForNotify(selectedOrderForInspect);
                  setShowNotifyModal(true);
                }}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice / Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(selectedOrderForInspect);
                  setSelectedOrderForInspect(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForInspect(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Cancel Order with Mandatory Reason */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-900 space-y-4">
            <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                  Cancel Order
                </span>
                <h3 className="text-lg font-bold font-serif text-white">
                  Cancel Order #{cancelModalOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Customer: <strong className="text-white">{cancelModalOrder.customerName}</strong> ({cancelModalOrder.customerPhone})
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter detailed reason why the order is cancelled (e.g. Customer requested size changes, relocated, timber out of stock)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-red-900 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs font-medium text-white"
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
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
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
