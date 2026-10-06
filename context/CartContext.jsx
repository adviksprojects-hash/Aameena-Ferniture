"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "aameena_cart_items_v1";
const SAVED_FOR_LATER_KEY = "aameena_cart_saved_for_later_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  // Load cart & saved-for-later from localStorage upon mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const storedSaved = localStorage.getItem(SAVED_FOR_LATER_KEY);
      if (storedSaved) {
        const parsedSaved = JSON.parse(storedSaved);
        if (Array.isArray(parsedSaved)) {
          setSavedForLater(parsedSaved);
        }
      }
    } catch (e) {
      console.warn("Failed to load cart/saved items from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save items to localStorage when active items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
  }, [items, isLoaded]);

  // Save savedForLater to localStorage when savedForLater changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(savedForLater));
    } catch (e) {
      console.warn("Failed to save saved-for-later items to localStorage:", e);
    }
  }, [savedForLater, isLoaded]);

  // Trigger brief feedback toast
  const showToast = (message, item = null) => {
    setToast({ message, item });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /**
   * Add a product to the cart
   */
  const addToCart = (product, options = {}) => {
    if (!product || !product.id) return;

    const finishType = options.finishType || product.finishType || "Natural Teak Honey Polish";
    const woodType = options.woodType || product.woodType || "Grade-A Sagwan Teak";
    const quantity = Math.max(1, Number(options.quantity) || 1);
    const cartItemId = `${product.id}__${finishType.replace(/\s+/g, "_")}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        // Increment quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Add new item
      const comparePrice = product.compareAtPrice || Math.round((product.price || 0) * 1.32);
      const newItem = {
        id: cartItemId,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price) || 0,
        compareAtPrice: comparePrice,
        image:
          product.images?.[0] ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
        woodType,
        finishType,
        quantity,
        categoryName: product.Category?.name || "Solid Wood Collection",
        categorySlug: product.Category?.slug || "all",
      };

      return [...prev, newItem];
    });

    showToast(`"${product.title}" added to your cart!`, product);
  };

  /**
   * Remove item from cart by cartItemId
   */
  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    showToast("Item removed from cart");
  };

  /**
   * Update quantity of an item
   */
  const updateQuantity = (cartItemId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: qty } : i))
    );
  };

  /**
   * Increment quantity helper
   */
  const incrementQuantity = (cartItemId) => {
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  /**
   * Decrement quantity helper
   */
  const decrementQuantity = (cartItemId) => {
    const item = items.find((i) => i.id === cartItemId);
    if (item && item.quantity <= 1) {
      removeFromCart(cartItemId);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity - 1 } : i))
      );
    }
  };

  /**
   * Save item for later: moves item from cart into savedForLater
   */
  const saveForLater = (cartItemId) => {
    const itemToSave = items.find((i) => i.id === cartItemId || i.productId === cartItemId);
    if (!itemToSave) return;

    // Remove from active cart items immediately & persist
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== itemToSave.id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // Add to saved for later (avoid duplicates) & persist
    setSavedForLater((prev) => {
      const exists = prev.some((i) => i.id === itemToSave.id);
      const next = exists ? prev : [itemToSave, ...prev];
      try {
        localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    showToast(`"${itemToSave.title}" saved for later!`, itemToSave);
  };

  /**
   * Move item from savedForLater back into active cart
   */
  const moveToCart = (savedItemId) => {
    const itemToMove = savedForLater.find((i) => i.id === savedItemId || i.productId === savedItemId);
    if (!itemToMove) return;

    // Remove from saved for later immediately & persist
    setSavedForLater((prev) => {
      const next = prev.filter((i) => i.id !== itemToMove.id);
      try {
        localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // Add to active cart items (or increase qty if already exists) & persist
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === itemToMove.id);
      let next;
      if (existingIdx > -1) {
        next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + (itemToMove.quantity || 1),
        };
      } else {
        next = [...prev, itemToMove];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    showToast(`"${itemToMove.title}" moved to cart!`, itemToMove);
  };

  /**
   * Remove item from savedForLater
   */
  const removeFromSavedForLater = (savedItemId) => {
    setSavedForLater((prev) => {
      const next = prev.filter((i) => i.id !== savedItemId && i.productId !== savedItemId);
      try {
        localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    showToast("Item removed from Saved for Later");
  };

  /**
   * Clear active cart items (after successful checkout or explicit clear)
   * NOTE: Does NOT erase savedForLater items!
   */
  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Notice clearing cart:", e);
    }
    showToast("Cart emptied");
  };

  /**
   * Check if a product ID exists in active cart
   */
  const isInCart = (productId) => {
    if (!productId) return false;
    return items.some((i) => i.productId === productId);
  };

  /**
   * Get quantity of a product ID in active cart
   */
  const getItemQuantity = (productId) => {
    return items
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  // Aggregated totals for ACTIVE cart items only
  const totalItems = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  const totalMRP = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.compareAtPrice || i.price) * i.quantity, 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return Math.max(0, totalMRP - subtotal);
  }, [totalMRP, subtotal]);

  const value = {
    items,
    savedForLater,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    saveForLater,
    moveToCart,
    removeFromSavedForLater,
    clearCart,
    isInCart,
    getItemQuantity,
    totalItems,
    totalSavedForLater: savedForLater.length,
    subtotal,
    totalMRP,
    totalSavings,
    toast,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Real-time Toast Feedback Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-stone-900 text-amber-50 px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-600/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs sm:text-sm font-semibold max-w-sm backdrop-blur-md"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="flex-1 truncate">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
