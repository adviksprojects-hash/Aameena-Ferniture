"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Eye,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, mounted } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [movedItems, setMovedItems] = useState({});

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-semibold">Loading your saved artisan collection...</p>
      </div>
    );
  }

  const handleMoveToCart = (item) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      woodType: item.woodType,
      finishType: item.finishType,
      image: item.image,
      dimensions: item.dimensions,
    });
    setMovedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setMovedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 lg:py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-10 text-amber-50 shadow-xl space-y-3 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-400" />
              <span>Personal Saved Collection</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif">
              My Handcrafted Wishlist
            </h1>
            <p className="text-amber-200/90 text-xs sm:text-sm max-w-xl">
              Curate your dream heirloom pieces. Saved securely for your account and accessible across visits.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your entire wishlist?")) {
                  clearWishlist();
                }
              }}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-rose-950/80 text-amber-200 hover:text-rose-200 border border-amber-800/80 hover:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-amber-200/80 text-center space-y-5 max-w-xl mx-auto shadow-sm">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-rose-500 flex items-center justify-center mx-auto border border-amber-200/70 shadow-inner">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Explore our solid Sagwan Teak living sets, bespoke beds, dining suites, and loose upholstery fabrics, and tap the heart icon on any piece to save it here.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 hover:scale-102 cursor-pointer"
            >
              <span>Explore Master Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>
              Showing {wishlist.length} saved handcrafted piece{wishlist.length === 1 ? "" : "s"}
            </span>
            <Link
              href="/cart"
              className="text-amber-800 hover:text-amber-950 flex items-center gap-1 underline font-extrabold"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>View Shopping Cart</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const inCartAlready = isInCart(item.id);
              const isJustMoved = movedItems[item.id];
              const compare = item.compareAtPrice || Math.round((item.price || 0) * 1.3);
              const discount =
                compare > item.price
                  ? Math.round(((compare - item.price) / compare) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Image Container with Badges & Remove Button */}
                  <div className="relative h-56 overflow-hidden bg-slate-50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Timber Badge */}
                    <div className="absolute top-3 left-3 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                      {item.woodType}
                    </div>

                    {/* Remove from Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold font-serif text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {item.dimensions || "Standard"} • {item.finishType || "Natural Teak Honey Polish"}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg font-black text-slate-900">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </span>
                        {compare > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{compare.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {discount}% off
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Move / Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(item)}
                          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            isJustMoved || inCartAlready
                              ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                              : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950"
                          }`}
                        >
                          {isJustMoved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : inCartAlready ? (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>In Cart</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>

                        {/* View Details Link */}
                        <Link
                          href={`/products/${item.id}`}
                          className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Specs</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
