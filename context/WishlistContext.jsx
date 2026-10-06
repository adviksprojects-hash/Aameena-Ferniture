"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [wishlist, setWishlist] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Determine storage key based on authenticated user ID or guest
  const getStorageKey = (userId) => {
    return userId ? `aameena_wishlist_${userId}` : "aameena_wishlist_guest";
  };

  // Load wishlist when user changes or on first mount
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    try {
      const currentKey = getStorageKey(user?.id);
      const saved = localStorage.getItem(currentKey);
      let items = saved ? JSON.parse(saved) : [];

      // If user just logged in, merge any guest items into their personal wishlist
      if (user?.id) {
        const guestSaved = localStorage.getItem("aameena_wishlist_guest");
        if (guestSaved) {
          try {
            const guestItems = JSON.parse(guestSaved);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const existingIds = new Set(items.map((i) => i.id));
              const merged = [...items];
              guestItems.forEach((g) => {
                if (!existingIds.has(g.id)) {
                  merged.push(g);
                  existingIds.add(g.id);
                }
              });
              items = merged;
              localStorage.setItem(currentKey, JSON.stringify(items));
              localStorage.removeItem("aameena_wishlist_guest"); // Clean up guest cache
            }
          } catch (e) {
            console.error("Error merging guest wishlist:", e);
          }
        }
      }

      setWishlist(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setWishlist([]);
    }
  }, [user?.id, isLoaded]);

  // Save wishlist to localStorage whenever it changes
  const saveWishlist = (newItems) => {
    setWishlist(newItems);
    if (typeof window !== "undefined") {
      try {
        const key = getStorageKey(user?.id);
        localStorage.setItem(key, JSON.stringify(newItems));
      } catch (err) {
        console.error("Error saving wishlist:", err);
      }
    }
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const toggleWishlist = (product) => {
    if (!product || !product.id) return false;
    const exists = isInWishlist(product.id);

    if (exists) {
      const filtered = wishlist.filter((item) => String(item.id) !== String(product.id));
      saveWishlist(filtered);
      return false; // removed
    } else {
      const itemToAdd = {
        id: product.id,
        title: product.title || "Handcrafted Furniture",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || null,
        woodType: product.woodType || "Grade-A Sagwan Teak",
        finishType: product.finishType || "Natural Teak Honey Polish",
        dimensions: product.dimensions || "Standard Dimensions",
        slug: product.slug || product.id,
        image:
          (product.images && product.images[0]) ||
          product.image ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        addedAt: new Date().toISOString(),
      };
      const updated = [itemToAdd, ...wishlist];
      saveWishlist(updated);
      return true; // added
    }
  };

  const addToWishlist = (product) => {
    if (!product || !product.id) return;
    if (!isInWishlist(product.id)) {
      toggleWishlist(product);
    }
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    const filtered = wishlist.filter((item) => String(item.id) !== String(productId));
    saveWishlist(filtered);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: mounted ? wishlist.length : 0,
        mounted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
