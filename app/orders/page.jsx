"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Search,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Ban,
  Lock,
  UserCheck,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  Layers,
} from "lucide-react";
import { getMyOrders, trackOrderByToken, cancelCustomerOrder } from "@/actions/orderActions";
import { getOwnerWhatsAppUrl, formatOrderWhatsAppMessage } from "@/lib/whatsappOrderFormat";
import { SignInButton, useUser } from "@clerk/nextjs";

const ARTISANAL_STAGES = [
  { id: "INQUIRY_RECEIVED", num: 1, label: "Order Confirmed", shortDesc: "Order & specs verified" },
  { id: "TIMBER_SELECTION", num: 2, label: "Timber Seasoning", shortDesc: "Seasoned Grade-A timber picked" },
  { id: "CARVING_JOINERY", num: 3, label: "Hand Carving", shortDesc: "Artisanal joinery & shaping" },
  { id: "SEVEN_STEP_POLISHING", num: 4, label: "7-Step Polish", shortDesc: "Hand-rubbed PU lacquer finish" },
  { id: "QUALITY_INSPECTION", num: 5, label: "Master Inspection", shortDesc: "Strict structural audit passed" },
  { id: "DISPATCHED_WHITE_GLOVE", num: 6, label: "Dispatched", shortDesc: "En route via white-glove transport" },
  { id: "DELIVERED", num: 7, label: "Delivered & Setup", shortDesc: "Assembled in customer home" },
];

export default function OrdersPage() {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadInitialOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getMyOrders();
      if (res.success) {
        if (res.requiresLogin) {
          setRequiresLogin(true);
          setOrders([]);
          setCustomerUser(null);
        } else {
          setRequiresLogin(false);
          setOrders(res.data || []);
          setCustomerUser(res.user);
        }
      } else {
        setOrders([]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialOrders();
  }, [loadInitialOrders, isSignedIn]);

  // Real-time polling every 30 seconds for live order status sync
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(() => {
      loadInitialOrders(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, loadInitialOrders]);

  const handleCopy = (text, id) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchedOrder(null);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);

    const res = await trackOrderByToken(searchQuery);
    if (res.success) {
      setSearchedOrder(res.data);
    } else {
      setSearchedOrder(null);
      setSearchError(res.error || "Order not found");
    }
    setSearching(false);
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    const reason = prompt(
      `Are you sure you want to cancel order #${orderNumber}?\n\nPlease enter a reason for cancellation (optional):`,
      "Plan changed / Ordered by mistake"
    );
    if (reason === null) return;

    setCancellingId(orderId);
    setCancelMessage(null);
    const res = await cancelCustomerOrder(orderId, reason);
    if (res.success) {
      setCancelMessage({
        type: "success",
        text: `Order #${orderNumber} has been successfully cancelled.`,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED", productionStage: "CANCELLED" } : o
        )
      );
      if (searchedOrder && searchedOrder.id === orderId) {
        setSearchedOrder({ ...searchedOrder, status: "CANCELLED", productionStage: "CANCELLED" });
      }
    } else {
      setCancelMessage({
        type: "error",
        text: res.error || "Failed to cancel order.",
      });
    }
    setCancellingId(null);
  };

  const getStageStep = (stage, status) => {
    if (status === "DELIVERED" || stage === "DELIVERED") return 7;
    switch (stage) {
      case "INQUIRY_RECEIVED":
        return 1;
      case "TIMBER_SELECTION":
        return 2;
      case "CARVING_JOINERY":
        return 3;
      case "SEVEN_STEP_POLISHING":
        return 4;
      case "QUALITY_INSPECTION":
        return 5;
      case "DISPATCHED_WHITE_GLOVE":
        return 6;
      case "DELIVERED":
        return 7;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status, stage) => {
    if (status === "DELIVERED" || stage === "DELIVERED") {
      return {
        label: "Delivered & Installed",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-500",
      };
    }
    if (status === "CANCELLED" || stage === "CANCELLED") {
      return {
        label: "Cancelled",
        classes: "bg-red-100 text-red-800 border-red-300",
        dotColor: "bg-red-500",
      };
    }
    if (status === "SHIPPED" || stage === "DISPATCHED_WHITE_GLOVE") {
      return {
        label: "Dispatched (In Transit)",
        classes: "bg-blue-100 text-blue-900 border-blue-300",
        dotColor: "bg-blue-500 animate-pulse",
      };
    }
    return {
      label: "In Artisanal Production",
      classes: "bg-amber-100 text-amber-900 border-amber-300",
      dotColor: "bg-amber-600 animate-pulse",
    };
  };

  const displayedOrders = searchedOrder ? [searchedOrder] : orders;

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-10" suppressHydrationWarning>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 relative overflow-hidden" suppressHydrationWarning>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-300 bg-amber-900/80 px-3 py-1 rounded-full border border-amber-700/60 shadow-xs">
            Live Solapur Workshop Tracker
          </span>
          {lastUpdated && (
            <span suppressHydrationWarning className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Live Synced: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          Track Your Handcrafted Orders
        </h1>
        <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
          Follow your bespoke furniture pieces through our 7 artisanal crafting stages — from raw seasoned Sagwan timber carving to white-glove home installation across Solapur & India.
        </p>

        {/* Live Search & Token Tracking */}
        <form onSubmit={handleSearch} suppressHydrationWarning className="pt-4 max-w-xl relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Enter Order # (e.g. AF-ORD-123456) or Dispatch Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            suppressHydrationWarning
            className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-md"
          >
            {searching ? "Tracking..." : "Track"}
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Cancellation Notification Alert Banner */}
      {cancelMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            cancelMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{cancelMessage.text}</span>
          <button onClick={() => setCancelMessage(null)} className="text-xs font-bold underline ml-3 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Orders Container */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-amber-200/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {searchedOrder
                ? `Lookup Result for "${searchQuery}"`
                : "Active Orders & Workshop Status"}
            </h2>
            {!searchedOrder && customerUser && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account logged in as <strong>{customerUser.name || customerUser.email}</strong></span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!searchedOrder && (
              <button
                type="button"
                onClick={() => loadInitialOrders(true)}
                disabled={refreshing}
                suppressHydrationWarning
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-950 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Refresh order stages from Solapur server"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-900 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
              </button>
            )}

            {searchedOrder && (
              <button
                onClick={() => {
                  setSearchedOrder(null);
                  setSearchQuery("");
                }}
                suppressHydrationWarning
                className="text-xs font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
              >
                ← Return to All My Orders
              </button>
            )}
          </div>
        </div>

        {/* If user needs to sign in to see personal orders */}
        {!searchedOrder && requiresLogin ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7 text-amber-800" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-slate-900">Sign in to view your orders</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Only your personal custom orders will be displayed here. Please sign in to securely track your handcrafted furniture pieces.
              </p>
            </div>
            <div className="pt-2">
              <SignInButton mode="modal">
                <button className="px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-md cursor-pointer">
                  Sign In to My Account
                </button>
              </SignInButton>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-amber-100">
              Tracking a showroom receipt? Enter your Order # or Tracking Code in the search bar above.
            </p>
          </div>
        ) : loading && orders.length === 0 && !searchedOrder ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-slate-600 text-xs font-medium">Fetching your custom orders from Solapur workshop...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4 shadow-sm">
            <Package className="w-12 h-12 mx-auto text-amber-800/40" />
            <div className="space-y-1">
              <p className="text-slate-700 text-base font-bold font-serif">
                {searchedOrder ? "No orders matched your search query." : "You have no active orders yet."}
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {searchedOrder
                  ? "Please verify the spelling of your Order # or Tracking code."
                  : "Explore our authentic Sagwan Teak, Velvet Fabric, and custom furniture collections to place your first piece."}
              </p>
            </div>
            {!searchedOrder && (
              <div className="pt-3 flex justify-center gap-3">
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-full bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors shadow-sm"
                >
                  Browse Furniture Catalog
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold hover:bg-amber-200 transition-colors border border-amber-300"
                >
                  Custom Design Inquiry
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {displayedOrders.map((order) => {
              const currentStep = getStageStep(order.productionStage, order.status);
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const isDelivered = order.status === "DELIVERED" || order.productionStage === "DELIVERED";
              const isCancelled = order.status === "CANCELLED";
              const canCancel =
                !isCancelled &&
                !isDelivered &&
                order.productionStage !== "DISPATCHED_WHITE_GLOVE" &&
                order.status !== "SHIPPED";

              const badge = getStatusBadge(order.status, order.productionStage);
              const itemsList = order.OrderItem || [];
              const percentComplete = isCancelled ? 0 : Math.round((currentStep / 7) * 100);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl p-6 lg:p-8 border shadow-sm space-y-6 transition-all hover:shadow-md ${
                    isCancelled ? "border-red-200 bg-red-50/10" : "border-amber-200/80"
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-amber-100 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">
                          {order.orderNumber}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderNumber, order.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-900 hover:bg-amber-50 transition-colors"
                          title="Copy order number"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${badge.classes}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Placed on {formattedDate}
                        </span>
                        <span>•</span>
                        <span>Client: <strong className="text-slate-700">{order.customerName}</strong></span>
                        {order.trackingNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-600">
                              Tracking: <strong className="text-slate-800">{order.trackingNumber}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Total Order Value</span>
                      <span className="text-2xl font-black text-slate-900 font-serif">
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Dest: {order.city || "Solapur Facility"}
                      </span>
                    </div>
                  </div>

                  {/* Cancelled Banner */}
                  {isCancelled && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
                      <Ban className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-bold block">Order Cancelled</span>
                        <p className="mt-0.5 text-red-700">
                          {order.customerNotes?.includes("Cancellation Reason")
                            ? order.customerNotes
                            : "This order was cancelled. Workshop production has been stopped."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* 🌟 7-STAGE ARTISANAL PRODUCTION PROGRESS TRACKER                */}
                  {/* ============================================================== */}
                  {!isCancelled && (
                    <div className="space-y-3 bg-amber-50/40 p-5 rounded-2xl border border-amber-200/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-700" />
                          <span>Artisanal Production Timeline</span>
                        </span>
                        <span className="font-bold text-amber-900">
                          {percentComplete}% Completed • Step {currentStep} of 7
                        </span>
                      </div>

                      {/* Progress Bar Line */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${percentComplete}%` }}
                        />
                      </div>

                      {/* Desktop / Tablet Connected Stepper */}
                      <div className="hidden lg:grid grid-cols-7 gap-1.5 pt-2">
                        {ARTISANAL_STAGES.map((s) => {
                          const isDone = currentStep > s.num;
                          const isCurrent = currentStep === s.num;

                          return (
                            <div
                              key={s.id}
                              className={`p-2 rounded-xl text-center transition-all ${
                                isCurrent
                                  ? "bg-amber-900 text-amber-50 shadow-md ring-2 ring-amber-500/50"
                                  : isDone
                                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                  : "bg-white/80 text-slate-400 border border-slate-100"
                              }`}
                            >
                              <div className="flex items-center justify-center mb-1">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <span
                                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                      isCurrent ? "bg-amber-500 text-slate-950" : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {s.num}
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] font-bold leading-tight line-clamp-1">{s.label}</span>
                              <span className="text-[9px] opacity-75 line-clamp-1 mt-0.5">{s.shortDesc}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile / Compact Stepper Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:hidden gap-2 pt-1 text-xs">
                        {ARTISANAL_STAGES.map((s) => {
                          const isDone = currentStep > s.num;
                          const isCurrent = currentStep === s.num;

                          return (
                            <div
                              key={s.id}
                              className={`p-2.5 rounded-xl transition-all ${
                                isCurrent
                                  ? "bg-amber-900 text-amber-50 shadow-sm ring-1 ring-amber-500"
                                  : isDone
                                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                  : "bg-white text-slate-400 border border-slate-200/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                      isCurrent ? "bg-amber-500 text-slate-950" : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {s.num}
                                  </span>
                                )}
                                <span className="font-bold text-[11px] leading-tight truncate">{s.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* 📦 DETAILED ORDER ITEMS LIST WITH PHOTOS & CUSTOM WOOD DETAILS */}
                  {/* ============================================================== */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Handcrafted Furniture Pieces ({itemsList.length} {itemsList.length === 1 ? "Item" : "Items"})
                    </span>

                    <div className="divide-y divide-slate-100 rounded-2xl border border-amber-200/70 overflow-hidden bg-white">
                      {itemsList.map((item, idx) => {
                        const img =
                          item.imageUrl ||
                          item.Product?.images?.[0] ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
                        const targetLink = item.productId
                          ? `/products/${item.productId}`
                          : item.Product?.id
                          ? `/products/${item.Product.id}`
                          : null;

                        return (
                          <div
                            key={item.id || idx}
                            className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-amber-50/20 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0">
                                <img
                                  src={img}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-900 font-serif">
                                  {targetLink ? (
                                    <Link
                                      href={targetLink}
                                      className="hover:text-amber-800 hover:underline transition-colors"
                                    >
                                      {item.title}
                                    </Link>
                                  ) : (
                                    item.title
                                  )}
                                </h4>

                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]">
                                    {item.woodType || "Grade-A Sagwan Teak"}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                    Finish: {item.finishType || "Natural Teak Honey Polish"}
                                  </span>
                                  <span className="text-slate-500 text-[11px]">
                                    Qty: <strong>{item.quantity || 1}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
                              <span className="text-xs text-slate-400 sm:block hidden">Item Price</span>
                              <span className="text-base font-extrabold text-slate-900">
                                ₹{(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                              </span>
                              {targetLink && (
                                <Link
                                  href={targetLink}
                                  className="text-[11px] text-amber-900 hover:underline font-bold inline-flex items-center gap-1"
                                >
                                  <span>View Specs</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workshop Notes & Delivery Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-800" />
                        <span>Artisanal Workshop Notes:</span>
                      </span>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {order.customerNotes || "Handcrafted Sagwan teak structure with custom joinery and 7-step PU polish."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-800" />
                        <span>White-Glove Delivery Destination:</span>
                      </span>
                      <p className="text-slate-600 font-medium">
                        {order.shippingAddress || "Solapur Workshop Pickup"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Phone Contact: {order.customerPhone || "On file"}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={getOwnerWhatsAppUrl({
                          orderNumber: order.orderNumber,
                          trackingNumber: order.trackingNumber,
                          customerName: order.customerName,
                          customerPhone: order.customerPhone,
                          customerEmail: order.customerEmail,
                          shippingAddress: order.shippingAddress,
                          city: order.city,
                          postalCode: order.postalCode,
                          totalAmount: order.totalAmount,
                          status: order.status,
                          productionStage: order.productionStage,
                          customerNotes: order.customerNotes,
                          items: order.OrderItem || [],
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-emerald-600"
                        title="Send or resend complete order details (Item 1, Item 2...) to factory workshop owner on WhatsApp anytime"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-200" />
                        <span>Send / Resend to Owner (WhatsApp)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const msgText = formatOrderWhatsAppMessage({
                            orderNumber: order.orderNumber,
                            trackingNumber: order.trackingNumber,
                            customerName: order.customerName,
                            customerPhone: order.customerPhone,
                            customerEmail: order.customerEmail,
                            shippingAddress: order.shippingAddress,
                            city: order.city,
                            postalCode: order.postalCode,
                            totalAmount: order.totalAmount,
                            status: order.status,
                            productionStage: order.productionStage,
                            customerNotes: order.customerNotes,
                            items: order.OrderItem || [],
                            senderRole: "customer",
                          });
                          handleCopy(msgText, `msg_${order.id}`);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                        title="Copy formatted message text to clipboard"
                      >
                        {copiedId === `msg_${order.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-600" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                          disabled={cancellingId === order.id}
                          className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{cancellingId === order.id ? "Cancelling..." : "Cancel Order"}</span>
                        </button>
                      )}

                      <Link
                        href="/contact"
                        className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Carpenter Assistance
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
