"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Plus, Check, X } from "lucide-react";

export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option...",
  otherPlaceholder = "Enter custom value...",
  allowOther = true,
  label = "",
  error = "",
  className = "",
  required = false,
  dark = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return { value: opt.value || opt.id || opt.slug, label: opt.label || opt.name || opt.title || opt.value };
  });

  // Check if current value matches an existing option
  const matchedOption = normalizedOptions.find((opt) => opt.value === value);

  // If value exists but doesn't match any option, it's custom
  useEffect(() => {
    if (value && !matchedOption && allowOther) {
      setIsCustomMode(true);
      setCustomValue(value);
    } else if (matchedOption) {
      setIsCustomMode(false);
    }
  }, [value, matchedOption, allowOther]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered options based on search
  const filtered = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectOption = (optValue) => {
    setIsCustomMode(false);
    setCustomValue("");
    onChange(optValue);
    setIsOpen(false);
    setSearch("");
  };

  const handleChooseOther = () => {
    setIsCustomMode(true);
    setCustomValue("");
    onChange("");
    setIsOpen(false);
    setSearch("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val);
  };

  const handleResetCustom = () => {
    setIsCustomMode(false);
    setCustomValue("");
    onChange(normalizedOptions[0]?.value || "");
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`text-xs font-bold uppercase flex items-center justify-between ${
          dark ? "text-slate-300" : "text-slate-700"
        }`}>
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {isCustomMode && (
            <button
              type="button"
              onClick={handleResetCustom}
              className={`text-[10px] font-bold hover:underline lowercase ${
                dark ? "text-amber-400" : "text-amber-900"
              }`}
            >
              (revert to standard options)
            </button>
          )}
        </label>
      )}

      {!isCustomMode ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
              dark
                ? error
                  ? "bg-slate-950 border-red-500 text-white focus:ring-red-400"
                  : "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700 focus:ring-2 focus:ring-amber-500"
                : error
                ? "bg-amber-50/50 border-red-400 focus:ring-red-300"
                : "bg-amber-50/50 border-amber-200 hover:border-amber-300 focus:ring-2 focus:ring-amber-500"
            }`}
          >
            <span className={value ? (dark ? "text-white font-bold" : "text-slate-900 font-bold") : "text-slate-400"}>
              {matchedOption ? matchedOption.label : placeholder}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className={`absolute z-50 left-0 right-0 mt-1 border rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150 ${
              dark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-amber-200 text-slate-800"
            }`}>
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    dark ? "bg-slate-950 border border-slate-800 text-slate-100" : "bg-slate-50 border border-slate-200 text-slate-800"
                  }`}
                />
              </div>

              {/* Options List */}
              <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                {filtered.length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching option found.
                  </div>
                )}

                {filtered.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-amber-900 text-amber-50 font-bold shadow-sm"
                          : dark
                          ? "hover:bg-slate-800 text-slate-200"
                          : "hover:bg-amber-50 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}

                {/* "Other" Option */}
                {allowOther && (
                  <button
                    type="button"
                    onClick={handleChooseOther}
                    className={`w-full mt-1.5 pt-2 border-t border-dashed px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      dark
                        ? "border-slate-800 bg-slate-950/70 text-amber-400 hover:bg-slate-800"
                        : "border-amber-200 bg-amber-50/60 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <Plus className={`w-3.5 h-3.5 ${dark ? "text-amber-400" : "text-amber-800"}`} />
                    <span>Other (Enter Custom New Option...)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Custom Input Mode */
        <div className="relative">
          <input
            type="text"
            required={required}
            autoFocus
            value={customValue}
            onChange={handleCustomChange}
            placeholder={otherPlaceholder}
            className={`w-full p-3 pr-9 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              dark
                ? error ? "bg-slate-950 border-red-500 text-white" : "bg-slate-950 border-slate-700 text-white"
                : error ? "bg-amber-50/70 border-red-400 text-slate-900" : "bg-amber-50/70 border-amber-300 text-slate-900"
            }`}
          />
          <button
            type="button"
            onClick={handleResetCustom}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            title="Cancel custom option"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
    </div>
  );
}

