"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Layers, RefreshCw, Check, Search, ChevronDown, Image as ImageIcon, AlertCircle } from "lucide-react";
import { getReviewCategories } from "@/actions/reviewActions";

export default function CategorySelector({
  value,
  onChange,
  error,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxRef = useRef(null);

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getReviewCategories();
        if (isMounted) {
          if (res.success && Array.isArray(res.categories)) {
            setCategories(res.categories);
          } else {
            setFetchError("Unable to load categories from database.");
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading categories:", err);
          setFetchError("Failed to connect to catalog database.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click to close dropdown
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

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Find currently selected category
  const selectedCategory = useMemo(() => {
    if (!value) return null;
    return (
      categories.find((c) => c.slug === value || c.id === value || c.name === value) || null
    );
  }, [categories, value]);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleSelect = (category) => {
    onChange(category.slug, category);
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
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

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredCategories.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCategories.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < filteredCategories.length) {
      e.preventDefault();
      handleSelect(filteredCategories[activeIndex]);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Label & Header */}
      <div className="flex items-center justify-between">
        <label
          id="category-selector-label"
          className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Layers className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>
            Select Furniture Category <span className="text-red-500">*</span>
          </span>
        </label>
        {loading && (
          <span className="text-[11px] text-amber-800 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> Loading categories...
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="h-14 w-full bg-amber-50/70 border border-amber-200/80 rounded-2xl animate-pulse flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200/50" />
          <div className="space-y-1 flex-1">
            <div className="w-32 h-3.5 bg-amber-200/60 rounded" />
            <div className="w-20 h-2.5 bg-amber-200/40 rounded" />
          </div>
        </div>
      ) : fetchError ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
            {fetchError}
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-bold text-red-800 underline hover:text-red-950"
          >
            Retry
          </button>
        </div>
      ) : (
        /* Searchable Combobox Trigger */
        <div className="relative">
          <button
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="category-listbox"
            aria-haspopup="listbox"
            aria-labelledby="category-selector-label"
            onClick={() => setIsOpen((prev) => !prev)}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              error
                ? "border-red-400 ring-1 ring-red-400/40 bg-red-50/20"
                : isOpen
                ? "border-amber-500 ring-2 ring-amber-400/50 shadow-md"
                : "border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-sm"
            }`}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Thumbnail Image or Fallback */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100/80 border border-amber-200/80 shrink-0 flex items-center justify-center relative">
                  {selectedCategory.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedCategory.imageUrl}
                      alt={selectedCategory.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-amber-700/60" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {selectedCategory.name}
                    </span>
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                      {selectedCategory._count?.Product || 0} Products
                    </span>
                  </div>
                  {selectedCategory.description && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-400">
                <Layers className="w-4 h-4 text-amber-700/50 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium">
                  — Choose a category (e.g. Living Room, Bedroom, Dining) —
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

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-amber-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              style={{ maxHeight: "360px" }}
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
                    placeholder="Search furniture categories..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-amber-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    aria-label="Search categories"
                  />
                </div>
              </div>

              {/* Category Options Listbox */}
              <div
                id="category-listbox"
                ref={listboxRef}
                role="listbox"
                aria-label="Categories list"
                className="overflow-y-auto p-1.5 space-y-1"
                style={{ maxHeight: "280px" }}
              >
                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No categories found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredCategories.map((cat, idx) => {
                    const isSelected =
                      selectedCategory?.slug === cat.slug || selectedCategory?.id === cat.id;
                    const isKeyboardActive = activeIndex === idx;

                    return (
                      <div
                        key={cat.id || cat.slug}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(cat)}
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
                          {/* Thumbnail */}
                          <div
                            className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border ${
                              isSelected
                                ? "bg-amber-900 border-amber-800"
                                : "bg-amber-100/70 border-amber-200"
                            }`}
                          >
                            {cat.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
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
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-xs sm:text-sm truncate ${
                                  isSelected ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {cat.name}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                  isSelected
                                    ? "bg-amber-800 text-amber-200"
                                    : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {cat._count?.Product || 0} Products
                              </span>
                            </div>
                            {cat.description && (
                              <p
                                className={`text-[11px] truncate ${
                                  isSelected ? "text-amber-200/80" : "text-slate-500"
                                }`}
                              >
                                {cat.description}
                              </p>
                            )}
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
