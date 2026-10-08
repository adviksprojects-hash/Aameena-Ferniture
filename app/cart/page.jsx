"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/context/CartContext";
import { createCartOrder } from "@/actions/orderActions";
import { getOwnerWhatsAppUrl, formatOrderWhatsAppMessage } from "@/lib/whatsappOrderFormat";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  PackageCheck,
  MapPin,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Info,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user } = useUser();
  const {
    items,
    savedForLater,
    isLoaded,
    totalItems,
    subtotal,
    totalMRP,
    totalSavings,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeFromSavedForLater,
    clearCart,
  } = useCart();

  // Checkout form modal / panel state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);
  const [orderError, setOrderError] = useState("");
  const [copiedOrderMsg, setCopiedOrderMsg] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.fullName || "",
    customerPhone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    customerEmail: user?.primaryEmailAddress?.emailAddress || "",
    shippingAddress: "",
    city: "Mumbai",
    postalCode: "400050",
    customerNotes: "",
  });

  // Pre-fill user data when user loads if not filled
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.fullName || "",
        customerEmail: prev.customerEmail || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Direct checkout order submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.shippingAddress.trim()) {
      setOrderError("Please enter your Name, Phone Number, and Delivery Address.");
      return;
    }

    if (!items.length) {
      setOrderError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsSnapshot = [...items];
      const formSnapshot = { ...formData };
      const subtotalSnapshot = subtotal;

      const res = await createCartOrder({
        ...formSnapshot,
        items: itemsSnapshot,
        totalAmount: subtotalSnapshot,
      });

      if (res.success) {
        const orderInfo = {
          orderNumber: res.orderNumber || res.data?.orderNumber || `AF-ORD-${Date.now().toString().slice(-6)}`,
          trackingNumber: res.trackingNumber || res.data?.trackingNumber || "",
          customerName: formSnapshot.customerName,
          customerPhone: formSnapshot.customerPhone,
          customerEmail: formSnapshot.customerEmail,
          shippingAddress: formSnapshot.shippingAddress,
          city: formSnapshot.city,
          postalCode: formSnapshot.postalCode,
          totalAmount: subtotalSnapshot,
          customerNotes: formSnapshot.customerNotes,
          items: itemsSnapshot,
          status: "CONFIRMED",
          productionStage: "INQUIRY_RECEIVED",
        };

        setLastOrderInfo(orderInfo);
        setOrderSuccess(res);
        clearCart();

        // 🚀 Automatically trigger WhatsApp order message to factory owner (+91 97303 92917)
        const ownerWhatsAppUrl = getOwnerWhatsAppUrl(orderInfo);
        try {
          window.open(ownerWhatsAppUrl, "_blank");
        } catch {
          // Handled via prominent button in success screen
        }
      } else {
        setOrderError(res.error || "Unable to place order. Please try again or order via WhatsApp.");
      }
    } catch (err) {
      setOrderError(err.message || "Something went wrong while processing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp Order Generator (Item 1, Item 2 separately)
  const handleWhatsAppOrder = () => {
    if (!items.length) return;

    const directInfo = {
      orderNumber: "DIRECT-INQUIRY",
      customerName: formData.customerName || "Valued Customer",
      customerPhone: formData.customerPhone || "",
      customerEmail: formData.customerEmail || "",
      shippingAddress: formData.shippingAddress || "Factory Direct Consultation",
      city: formData.city || "Solapur",
      postalCode: formData.postalCode || "",
      totalAmount: subtotal,
      customerNotes: formData.customerNotes || "Direct WhatsApp inquiry from cart",
      items: [...items],
      status: "CART_INQUIRY",
      productionStage: "INQUIRY_RECEIVED",
    };

    const whatsappUrl = getOwnerWhatsAppUrl(directInfo);
    window.open(whatsappUrl, "_blank");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 py-24 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-300">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 pt-4 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-amber-400 transition-colors">
            Furniture Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-amber-300 font-medium">Shopping Cart</span>
        </nav>

        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 flex items-center gap-3 flex-wrap">
              <ShoppingCart className="w-7 h-7 text-amber-400" />
              <span>Shopping Cart</span>
              {totalItems > 0 && (
                <span className="text-sm font-sans font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              )}
              {savedForLater && savedForLater.length > 0 && (
                <span className="text-xs font-sans font-medium bg-stone-800 text-stone-300 border border-stone-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  <span>{savedForLater.length} Saved for Later</span>
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Direct from factory workshop • 100% Solid Grade-A Sagwan Teak Wood
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="text-xs sm:text-sm font-medium text-amber-400 hover:text-amber-300 bg-stone-800/80 hover:bg-stone-800 border border-amber-500/20 px-3.5 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track Existing Orders</span>
            </Link>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-medium text-stone-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/40 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Order Success State */}
        {orderSuccess && (
          <div className="bg-gradient-to-r from-emerald-950/80 to-stone-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-emerald-300">
                Order Confirmed Successfully!
              </h2>
              <p className="text-sm text-stone-300 max-w-xl mx-auto">
                Thank you for trusting Aameena Furniture. Your handcrafted teak wood order has been registered at our Solapur manufacturing facility.
              </p>
            </div>

            {/* Quick Order Header */}
            <div className="bg-stone-950/80 border border-emerald-500/30 rounded-xl p-4 max-w-lg mx-auto space-y-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Order Number:</span>
                <span className="font-mono font-bold text-amber-300">{orderSuccess.orderNumber || lastOrderInfo?.orderNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Tracking Code:</span>
                <span className="font-mono font-bold text-amber-300">{orderSuccess.trackingNumber || lastOrderInfo?.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Delivery Destination:</span>
                <span className="text-stone-200 font-medium">{lastOrderInfo?.shippingAddress}, {lastOrderInfo?.city}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Production Status:</span>
                <span className="text-emerald-400 font-medium">Timber Selection Started</span>
              </div>
            </div>

            {/* Itemized Breakdown (Item 1, Item 2...) */}
            {lastOrderInfo?.items && lastOrderInfo.items.length > 0 && (
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Ordered Furniture Pieces ({lastOrderInfo.items.length})
                  </span>
                  <span className="text-xs font-bold text-white">
                    Total: ₹{Number(lastOrderInfo.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="space-y-2 divide-y divide-stone-850">
                  {lastOrderInfo.items.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="text-stone-400 text-[11px] block">
                          Qty: {item.quantity || 1} • {item.woodType || "Grade-A Sagwan Teak"} • {item.finishType || "Honey Polish"}
                        </span>
                      </div>
                      <span className="font-semibold text-amber-300 whitespace-nowrap ml-2">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct WhatsApp Send / Resend to Owner Action */}
            {lastOrderInfo && (
              <div className="max-w-lg mx-auto bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 font-medium">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp details prepared for Factory Owner (+91 97303 92917)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={getOwnerWhatsAppUrl(lastOrderInfo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = formatOrderWhatsAppMessage({ ...lastOrderInfo, senderRole: "customer" });
                        await navigator.clipboard.writeText(text);
                        setCopiedOrderMsg(true);
                        setTimeout(() => setCopiedOrderMsg(false), 2500);
                      } catch (err) {
                        console.warn("Failed to copy order details:", err);
                      }
                    }}
                    className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white font-bold text-xs sm:text-sm transition-all border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy complete formatted order message to clipboard"
                  >
                    {copiedOrderMsg ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-400" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/orders"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Track Your Order Now</span>
              </Link>
              <Link
                href="/products"
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium px-6 py-2.5 rounded-xl text-sm transition-all border border-stone-700"
              >
                Continue Browsing Catalog
              </Link>
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {!orderSuccess && items.length === 0 && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-10 sm:p-16 text-center space-y-6">
            <div className="w-24 h-24 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <ShoppingCart className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200">
                Your Shopping Cart is Empty
              </h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">
                Explore our master-crafted Grade-A Sagwan Teak collections and find the perfect centerpiece for your living room, bedroom, or dining area.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Browse Furniture Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto bg-stone-800 hover:bg-stone-750 text-stone-200 font-medium px-8 py-3.5 rounded-xl text-sm transition-all border border-stone-700 flex items-center justify-center gap-2"
              >
                <span>View Full Home Packages</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Cart Content Grid (Flipkart/Amazon Layout) */}
        {!orderSuccess && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Deliver-To banner & Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Flipkart/Amazon Deliver-to location pill */}
              <div className="bg-stone-850 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-stone-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Direct Factory Delivery to: <strong className="text-stone-100">All India (Solapur Workshop)</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Free White-Glove Installation Included</span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-stone-850 border border-stone-800 rounded-2xl divide-y divide-stone-800/80 overflow-hidden shadow-sm">
                {items.map((item) => {
                  const unitPrice = parseFloat(item.price) || 0;
                  const itemMRP = Math.round(unitPrice * 1.25); // Factory direct discount calculation
                  const itemTotal = unitPrice * (item.quantity || 1);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-stone-800/30 transition-colors"
                    >
                      {/* Product Thumbnail (Clickable to Product Page) */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative w-full sm:w-36 h-40 sm:h-36 rounded-xl overflow-hidden bg-stone-900 border border-stone-750 shrink-0 group block"
                      >
                        <Image
                          src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-amber-300 bg-stone-950/80 px-2 py-1 rounded">
                            View Piece
                          </span>
                        </div>
                      </Link>

                      {/* Product Information & Controls */}
                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          {/* Title with link */}
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-base sm:text-lg font-serif font-bold text-stone-100 hover:text-amber-300 transition-colors line-clamp-2"
                            >
                              {item.title}
                            </Link>
                          </div>

                          {/* Category & Specifications */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                            {(item.category || item.categoryName) && (
                              <span className="bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded text-[11px] font-medium">
                                {item.category || item.categoryName}
                              </span>
                            )}
                            <span className="text-stone-300 font-medium">
                              {item.woodType || "Grade-A Sagwan Teak"}
                            </span>
                            <span>•</span>
                            <span className="text-stone-400">
                              {item.finishType || "Natural Teak Honey Polish"}
                            </span>
                          </div>

                          {/* Price & Savings */}
                          <div className="flex items-baseline gap-2.5 pt-1">
                            <span className="text-lg sm:text-xl font-bold text-amber-300">
                              ₹{unitPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-stone-500 line-through">
                              ₹{itemMRP.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              20% Factory Direct Off
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Increment Stepper Quantity Controls & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-stone-800/60">
                          {/* Flipkart / Amazon style Quantity Increment Stepper */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 font-medium">Quantity:</span>
                            <div className="flex items-center border border-amber-500/30 bg-stone-900 rounded-lg overflow-hidden shadow-xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center text-xs font-bold text-amber-200 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal for item */}
                          <div className="text-xs text-stone-400">
                            Item Total: <strong className="text-amber-200 font-bold font-mono">₹{itemTotal.toLocaleString("en-IN")}</strong>
                          </div>

                          {/* Action Links: Save for Later, View, Remove */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            {/* Save for Later Button */}
                            <button
                              type="button"
                              onClick={() => saveForLater(item.id)}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-all px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer shadow-2xs"
                              title="Save this item for later (preserved and never erased upon checkout)"
                            >
                              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                              <span>Save for Later</span>
                            </button>

                            <Link
                              href={`/products/${item.productId}`}
                              className="text-xs text-stone-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
                            >
                              <span>View Specs</span>
                              <ExternalLink className="w-3 h-3 text-stone-400" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-rose-950/30"
                              title="Remove from Cart"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Solid Sagwan Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>White Glove Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>10-Year Anti-Borer Warranty</span>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Price Details & Checkout (Flipkart/Amazon style) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 space-y-5 shadow-lg">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 pb-3">
                  PRICE DETAILS ({totalItems} {totalItems === 1 ? "Item" : "Items"})
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-300">
                    <span>Total MRP</span>
                    <span>₹{totalMRP.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-emerald-400">
                    <span>Factory Direct Discount</span>
                    <span>- ₹{totalSavings.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-stone-300">
                    <span className="flex items-center gap-1">
                      <span>Delivery & White-Glove Installation</span>
                      <Info className="w-3 h-3 text-stone-500" />
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      <span className="line-through text-stone-500 text-xs mr-1.5">₹2,500</span>
                      FREE
                    </span>
                  </div>

                  <div className="border-t border-dashed border-stone-700/80 pt-3 flex justify-between items-baseline font-bold text-base text-stone-100">
                    <span>Total Amount</span>
                    <span className="text-xl text-amber-300">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Savings Pill */}
                <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 font-medium text-center">
                  You will save ₹{totalSavings.toLocaleString("en-IN")} on this factory direct order
                </div>

                {/* Primary Checkout Actions */}
                <div className="space-y-3 pt-2">
                  {/* Option 1: Direct Order Form */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen((prev) => !prev)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{isCheckoutOpen ? "Close Checkout Form" : "PROCEED TO CHECKOUT"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Option 2: Order on WhatsApp */}
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>ORDER ALL ON WHATSAPP</span>
                  </button>
                </div>
              </div>

              {/* Direct Checkout Form Accordion / Card */}
              {isCheckoutOpen && (
                <div className="bg-stone-850 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                      Delivery & Contact Details
                    </h3>
                    <span className="text-xs text-stone-400">Step 2 of 2</span>
                  </div>

                  {orderError && (
                    <div className="bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs p-3 rounded-lg">
                      {orderError}
                    </div>
                  )}

                  <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-stone-300 font-medium mb-1">
                        Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">
                          Phone Number <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="tel"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 9822123456"
                          className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">
                          Email (For Tracking Updates)
                        </label>
                        <input
                          type="email"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          placeholder="rajesh@example.com"
                          className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-medium mb-1">
                        Delivery Address <span className="text-amber-400">*</span>
                      </label>
                      <textarea
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        required
                        rows={2}
                        placeholder="Flat No, Building, Street, Landmark..."
                        className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Mumbai"
                          className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">Pincode</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="400050"
                          className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-medium mb-1">
                        Special Instructions / Wood Customization
                      </label>
                      <input
                        type="text"
                        name="customerNotes"
                        value={formData.customerNotes}
                        onChange={handleInputChange}
                        placeholder="e.g. Call before delivery, Walnut finish shade preferred"
                        className="w-full bg-stone-900 border border-stone-750 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* WhatsApp Auto-Dispatch Assurance Banner */}
                    <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-200">
                      <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Automatic WhatsApp Owner Notification</span>
                        Upon confirming your order, an itemized specification (Item 1, Item 2..., timber specs, and destination address) will automatically be sent to the factory owner (+91 97303 92917).
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {isSubmitting ? (
                        <span>Registering Order at Factory...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>CONFIRM & PLACE FACTORY ORDER</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-stone-400 text-center">
                      Cash on Delivery / Direct Bank Transfer supported upon timber inspection.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved for Later Section - Persistently saved on device, never erased upon checkout */}
        {savedForLater && savedForLater.length > 0 && (
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
                    <span>Saved for Later</span>
                    <span className="text-xs font-sans font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {savedForLater.length} {savedForLater.length === 1 ? "Item" : "Items"}
                    </span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Items here are saved safely and will not be cleared when other orders are placed.
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-400">
                You can move items back to your active cart whenever you are ready.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedForLater.map((item) => {
                const unitPrice = parseFloat(item.price) || 0;
                const itemMRP = item.compareAtPrice || Math.round(unitPrice * 1.25);

                return (
                  <div
                    key={item.id}
                    className="bg-stone-850 border border-stone-800 rounded-xl p-4 flex gap-4 hover:border-amber-500/40 transition-all shadow-xs"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative w-28 h-28 rounded-xl overflow-hidden bg-stone-900 border border-stone-750 shrink-0 group block"
                    >
                      <Image
                        src={
                          item.imageUrl ||
                          item.image ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Details & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-serif font-bold text-stone-100 hover:text-amber-300 transition-colors line-clamp-1 text-sm sm:text-base"
                        >
                          {item.title}
                        </Link>
                        <div className="text-xs text-stone-400 mt-0.5">
                          <span>{item.woodType || "Grade-A Sagwan Teak"}</span> •{" "}
                          <span>{item.finishType || "Natural Teak Honey Polish"}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-base font-bold text-amber-300 font-mono">
                            ₹{unitPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-stone-500 line-through">
                            ₹{itemMRP.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-stone-800/60 mt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => moveToCart(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          title="Move back to active shopping cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromSavedForLater(item.id)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove from Saved for Later"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
