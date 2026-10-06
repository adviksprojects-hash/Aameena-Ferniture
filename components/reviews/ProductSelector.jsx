"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Package,
  RefreshCw,
  Search,
  ChevronDown,
  Check,
  PenLine,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { getReviewProductsByCategory } from "@/actions/reviewActions";

const CUSTOM_EXAMPLES = [
  "Custom Sofa",
  "Temple",
  "Wardrobe",
  "Dining Table",
  "Office Chair",
  "Study Table",
  "Wooden Swing",
];

export default function ProductSelector({
  categorySlug,
  categoryName,
  selectedProductId,
  onProductChange,
  customProductName,
  onCustomProductChange,
  isCustomMode,
  onToggleCustomMode,
  error,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxRef = useRef(null);
  const customInputRef = useRef(null);

  // Fetch products whenever categorySlug changes
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!categorySlug) {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
          setFetchError(null);
        }
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const res = await getReviewProductsByCategory(categorySlug);
        if (isMounted) {
          if (res.success && Array.isArray(res.products)) {
            setProducts(res.products);
          } else {
            setFetchError("Unable to load products for this category.");
            setProducts([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading products:", err);
          setFetchError("Catalog connection error.");
          setProducts([]);
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Focus custom input when entering custom mode
  useEffect(() => {
    if (isCustomMode && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomMode]);

  // Find currently selected product object
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || selectedProductId === "other") return null;
    return products.find((p) => p.id === selectedProductId || p.slug === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Filter products by search query (title or woodType)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchTitle = p.title && p.title.toLowerCase().includes(q);
      const matchWood = p.woodType && p.woodType.toLowerCase().includes(q);
      return matchTitle || matchWood;
    });
  }, [products, searchQuery]);

  const handleSelectProduct = (product) => {
    onProductChange(product.id, product);
    onToggleCustomMode(false);
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  const handleSelectCustomMode = () => {
    onToggleCustomMode(true);
    onProductChange("other", null);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSwitchToCatalog = () => {
    onToggleCustomMode(false);
    if (selectedProductId === "other") {
      onProductChange("", null);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    // Number of items in list: filteredProducts + 1 for "Other / Custom Furniture"
    const totalOptions = filteredProducts.length + 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex === filteredProducts.length) {
        // Selected "Other / Custom Furniture"
        handleSelectCustomMode();
      } else if (activeIndex >= 0 && activeIndex < filteredProducts.length) {
        handleSelectProduct(filteredProducts[activeIndex]);
      }
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Product Section Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label
          id="product-selector-label"
          className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Package className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>
            Purchased Furniture Piece <span className="text-red-500">*</span>
          </span>
        </label>

        {/* Always visible "Other / Custom Furniture" button */}
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] text-amber-800 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> Loading catalog...
            </span>
          )}
          <button
            type="button"
            onClick={() => (isCustomMode ? handleSwitchToCatalog() : handleSelectCustomMode())}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isCustomMode
                ? "bg-amber-950 text-amber-100 border-amber-950 shadow-sm"
                : "bg-amber-100/70 text-amber-950 border-amber-300 hover:bg-amber-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>{isCustomMode ? "Switch to Catalog Models" : "Other / Custom Furniture"}</span>
          </button>
        </div>
      </div>

      {/* SKELETON LOADING STATE */}
      {loading ? (
        <div className="h-14 w-full bg-amber-50/70 border border-amber-200/80 rounded-2xl animate-pulse flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200/50" />
          <div className="space-y-1 flex-1">
            <div className="w-48 h-3.5 bg-amber-200/60 rounded" />
            <div className="w-24 h-2.5 bg-amber-200/40 rounded" />
          </div>
        </div>
      ) : isCustomMode ? (
        /* ============================================================ */
        /* STEP 5: CUSTOM FURNITURE INPUT (REPLACES DROPDOWN WHEN ACTIVE) */
        /* ============================================================ */
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-sm space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                <PenLine className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                  Enter Custom or Other Furniture
                </h3>
                <p className="text-[11px] text-slate-500">
                  For made-to-order, custom carved, or uncatalogued Solapur pieces.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwitchToCatalog}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              <span>Back to Catalog</span>
            </button>
          </div>

          <div>
            <input
              ref={customInputRef}
              type="text"
              id="custom-product-input"
              value={customProductName || ""}
              onChange={(e) => onCustomProductChange(e.target.value)}
              placeholder="Enter the furniture you purchased (e.g. Custom Mandir, Teak Wood Swing)"
              className={`w-full p-3 sm:p-3.5 rounded-xl bg-white border text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium ${
                error ? "border-red-400 ring-1 ring-red-400/40" : "border-amber-300 shadow-inner"
              }`}
              aria-label="Enter custom furniture name"
            />
          </div>

          {/* Quick Clickable Examples */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Suggestions (Click to fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOM_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => onCustomProductChange(example)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white border border-amber-200 text-amber-950 hover:bg-amber-100 hover:border-amber-400 transition-colors font-medium shadow-xs"
                >
                  + {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* STEP 4: DYNAMIC SEARCHABLE PRODUCT DROPDOWN                   */
        /* ============================================================ */
        <div className="relative">
          <button
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="product-listbox"
            aria-haspopup="listbox"
            aria-labelledby="product-selector-label"
            disabled={!categorySlug}
            onClick={() => setIsOpen((prev) => !prev)}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 disabled:cursor-not-allowed ${
              error
                ? "border-red-400 ring-1 ring-red-400/40 bg-red-50/20"
                : isOpen
                ? "border-amber-500 ring-2 ring-amber-400/50 shadow-md"
                : "border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-sm"
            }`}
          >
            {!categorySlug ? (
              <div className="flex items-center gap-2.5 text-slate-400">
                <Package className="w-4 h-4 text-amber-700/50 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium">
                  — Please select a category above first —
                </span>
              </div>
            ) : selectedProduct ? (
              <div className="flex items-center gap-3 min-w-0">
                {/* Product Thumbnail */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100/80 border border-amber-200/80 shrink-0 flex items-center justify-center relative">
                  {selectedProduct.images && selectedProduct.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-amber-700/60" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {selectedProduct.title}
                    </span>
                    {selectedProduct.woodType && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                        {selectedProduct.woodType}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedProduct.Category?.name || categoryName || "Solapur Hardwood Collection"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-500">
                <Package className="w-4 h-4 text-amber-700/60 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium">
                  — Select from {products.length} catalog models —
                </span>
              </div>
            )}

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                isOpen ? "rotate-180 text-amber-700" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Product Dropdown Popup */}
          {isOpen && (
            <div
              className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-amber-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              style={{ maxHeight: "380px" }}
            >
              {/* Search input header */}
              <div className="p-2.5 border-b border-amber-100 bg-amber-50/50 sticky top-0 z-10">
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-amber-700/70 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search furniture models or wood types..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-amber-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    aria-label="Search furniture products"
                  />
                </div>
              </div>

              {/* Product Options List */}
              <div
                id="product-listbox"
                ref={listboxRef}
                role="listbox"
                aria-label="Catalog products list"
                className="overflow-y-auto p-1.5 space-y-1"
                style={{ maxHeight: "300px" }}
              >
                {filteredProducts.length === 0 && !searchQuery.trim() ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No catalog items found in this category. You can use &ldquo;Other / Custom
                    Furniture&rdquo; below.
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No products found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredProducts.map((p, idx) => {
                    const isSelected = selectedProductId === p.id;
                    const isKeyboardActive = activeIndex === idx;

                    return (
                      <div
                        key={p.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectProduct(p)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full p-2.5 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-amber-950 text-white shadow-sm"
                            : isKeyboardActive
                            ? "bg-amber-100/80 text-slate-900"
                            : "hover:bg-amber-50 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image */}
                          <div
                            className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border ${
                              isSelected
                                ? "bg-amber-900 border-amber-800"
                                : "bg-amber-100/70 border-amber-200"
                            }`}
                          >
                            {p.images && p.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon
                                className={`w-4 h-4 ${
                                  isSelected ? "text-amber-200" : "text-amber-700"
                                }`}
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-bold text-xs sm:text-sm truncate ${
                                  isSelected ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {p.title}
                              </span>
                              {p.woodType && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                    isSelected
                                      ? "bg-amber-800 text-amber-200"
                                      : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  {p.woodType}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] truncate ${
                                isSelected ? "text-amber-200/80" : "text-slate-500"
                              }`}
                            >
                              {p.Category?.name || categoryName || "Solapur Hardwood Collection"}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-amber-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    );
                  })
                )}

                {/* Persistent Bottom Option: "Other / Custom Furniture" */}
                <div
                  role="option"
                  aria-selected={isCustomMode}
                  onClick={handleSelectCustomMode}
                  onMouseEnter={() => setActiveIndex(filteredProducts.length)}
                  className={`w-full p-2.5 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-3 border-t border-amber-100 ${
                    activeIndex === filteredProducts.length
                      ? "bg-amber-100/90 text-amber-950"
                      : "bg-amber-50/60 hover:bg-amber-100/70 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-amber-950">
                        ✨ Other / Custom Furniture
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Can&apos;t find your piece? Click to enter custom name.
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-amber-700 shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Error Message */}
      {error && (
        <p
          role="alert"
          className="text-xs text-red-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
