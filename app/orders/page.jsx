"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, FileText, Search, RefreshCw, MessageSquare, AlertCircle, Ban, Lock, UserCheck } from "lucide-react";
import { getMyOrders, trackOrderByToken, cancelCustomerOrder } from "@/actions/orderActions";
import { SignInButton, useUser } from "@clerk/nextjs";

export default function OrdersPage() {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);

  const loadInitialOrders = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    loadInitialOrders();
  }, [isSignedIn]);

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

  const getStageStep = (stage) => {
    switch (stage) {
      case "TIMBER_SELECTION":
        return 1;
      case "CARVING_JOINERY":
        return 2;
      case "SEVEN_STEP_POLISHING":
        return 3;
      case "QUALITY_INSPECTION":
        return 4;
      case "DISPATCHED_WHITE_GLOVE":
        return 5;
      case "DELIVERED":
        return 6;
      default:
        return 1;
    }
  };

  const STAGES = [
    { num: 1, label: "Timber Seasoning" },
    { num: 2, label: "Hand Carving" },
    { num: 3, label: "7-Step Polish" },
    { num: 4, label: "Inspection" },
    { num: 5, label: "Out for Setup" },
  ];

  const displayedOrders = searchedOrder ? [searchedOrder] : orders;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Live Workshop Tracking</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Track Your Handcrafted Furniture</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
          Follow your bespoke furniture through our 7 artisanal crafting stages from raw Sagwan timber seasoning to
          white-glove installation.
        </p>

        {/* Live Search Bar */}
        <form onSubmit={handleSearch} className="pt-4 max-w-xl relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="Enter Order # or Tracking Code (e.g. AF-2026-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
          >
            {searching ? "Searching..." : "Track"}
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Cancel Action Message Banner */}
      {cancelMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            cancelMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{cancelMessage.text}</span>
          <button onClick={() => setCancelMessage(null)} className="text-xs font-bold underline ml-3">
            Dismiss
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              {searchedOrder
                ? `Search Result for "${searchQuery}"`
                : "My Handcrafted Orders"}
            </h2>
            {!searchedOrder && customerUser && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Showing personal orders for <strong>{customerUser.name || customerUser.email}</strong></span>
              </p>
            )}
          </div>

          {searchedOrder && (
            <button
              onClick={() => {
                setSearchedOrder(null);
                setSearchQuery("");
              }}
              className="text-xs font-bold text-amber-900 hover:underline"
            >
              ← Back to My Orders
            </button>
          )}
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
                <button className="px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-md">
                  Sign In to My Account
                </button>
              </SignInButton>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-amber-100">
              Tracking a guest showroom receipt? Use the search bar above with your Order # or Tracking Code.
            </p>
          </div>
        ) : loading && orders.length === 0 && !searchedOrder ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-slate-600 text-xs font-medium">Fetching your custom orders from Solapur workshop...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4">
            <Package className="w-12 h-12 mx-auto text-amber-800/40" />
            <div className="space-y-1">
              <p className="text-slate-700 text-base font-bold font-serif">
                {searchedOrder ? "No orders matched your search." : "You have no active orders yet."}
              </p>
              <p className="text-slate-500 text-xs">
                {searchedOrder
                  ? "Please check the spelling of your Order # or Tracking code."
                  : "Explore our Grade-A Sagwan Teak collections to place your first handcrafted furniture order."}
              </p>
            </div>
            {!searchedOrder && (
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/products"
                  className="px-5 py-2.5 rounded-full bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors"
                >
                  Browse Furniture Catalog
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  Custom Design Inquiry
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => {
              const currentStep = getStageStep(order.productionStage);
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const isDelivered = order.status === "DELIVERED";
              const isCancelled = order.status === "CANCELLED";
              const canCancel = !isCancelled && !isDelivered && order.productionStage !== "DISPATCHED_WHITE_GLOVE";

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl p-6 lg:p-8 border shadow-sm space-y-6 transition-all ${
                    isCancelled ? "border-red-200 opacity-80" : "border-amber-200/70"
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-serif text-slate-900">{order.orderNumber}</span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                            isDelivered
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : isCancelled
                              ? "bg-red-100 border-red-300 text-red-800"
                              : "bg-amber-100 border-amber-300 text-amber-900"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                        {order.productionStage && !isCancelled && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Stage: {order.productionStage.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Placed on {formattedDate} • Client: {order.customerName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                      <p className="text-xs text-slate-500">Destination: {order.city || "Solapur"}</p>
                    </div>
                  </div>

                  {/* If Cancelled, show cancellation alert */}
                  {isCancelled && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
                      <Ban className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-bold block">Order Cancelled</span>
                        <p className="mt-0.5 text-red-700">
                          {order.cancelReason || "This order was cancelled. Workshop production has been stopped."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 5-Step Progress Timeline (Show active stages if not cancelled) */}
                  {!isCancelled ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-700">Artisanal Production Timeline:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                        {STAGES.map((s) => {
                          const isDoneOrCurrent = currentStep >= s.num;
                          const isCurrent = currentStep === s.num;

                          return (
                            <div
                              key={s.num}
                              className={`p-2.5 rounded-xl transition-all ${
                                isCurrent
                                  ? "bg-amber-900 text-amber-50 shadow-md ring-2 ring-amber-500/50"
                                  : isDoneOrCurrent
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <span className="block text-[10px] opacity-75">Step 0{s.num}</span>
                              <span>{s.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Items & Shipping */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Custom Furniture Specs:</span>
                      <p className="text-slate-600 font-medium">
                        {order.customerNotes || "Handcrafted Sagwan teak structure with custom joinery."}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-slate-500 mt-1 text-[11px]">
                          Dispatch Tracking ID: <span className="font-mono font-bold text-slate-800">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Delivery Destination:</span>
                      <p className="text-slate-600 font-medium">{order.shippingAddress || "Solapur Workshop Pickup"}</p>
                      <p className="text-slate-500 text-[11px] mt-1">Phone: {order.customerPhone || "On file"}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <a
                      href={`https://wa.me/919876500001?text=Hi%20Aameena%20Furniture,%20checking%20status%20for%20order%20${order.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Message Furniture Manufacturer on WhatsApp
                    </a>

                    <div className="flex items-center gap-3">
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                          disabled={cancellingId === order.id}
                          className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}

                      <Link
                        href="/contact"
                        className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-colors"
                      >
                        Need Carpenter Modification / Help
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
