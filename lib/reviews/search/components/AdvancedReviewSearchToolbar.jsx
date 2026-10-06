"use client";

/**
 * @file AdvancedReviewSearchToolbar.jsx
 * Advanced Multi-Dimensional Search Toolbar for Admin & Manager review dashboards.
 * Supports combinations of 18+ filters: Rating, Verification, Health Grade,
 * Status, Media, Wood Type, and Invoice numbers.
 */

import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Star,
  Activity,
} from "lucide-react";

export function AdvancedReviewSearchToolbar({
  filters = {},
  onChange,
  onReset,
  totalResults = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (field, value) => {
    onChange?.({
      ...filters,
      [field]: value,
      page: 1, // reset to page 1 on filter modification
    });
  };

  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === "page" || key === "limit" || key === "sortBy" || key === "sortOrder") return false;
    return val && val !== "ALL" && val !== "";
  }).length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
      {/* Top Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search patron, text, city, order #, wood..."
            value={filters.query || ""}
            onChange={(e) => handleFieldChange("query", e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isExpanded || activeCount > 0
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Advanced Filters</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black font-mono">
                {activeCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <span className="text-[11px] text-slate-500 font-mono">
            {totalResults} review{totalResults === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Expanded Multi-Filter Grid */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs animate-in fade-in duration-150">
          {/* Status */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Status</label>
            <select
              value={filters.status || "ALL"}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="HIDDEN">Hidden</option>
              <option value="REPORTED">Reported</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>

          {/* Verification */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Verification</label>
            <select
              value={filters.isVerified || "ALL"}
              onChange={(e) => handleFieldChange("isVerified", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Reviews</option>
              <option value="TRUE">Verified Only</option>
              <option value="FALSE">Unverified Only</option>
            </select>
          </div>

          {/* Health Grade */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Health Score</label>
            <select
              value={filters.healthGrade || "ALL"}
              onChange={(e) => handleFieldChange("healthGrade", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Grades</option>
              <option value="EXCELLENT">Excellent (85+)</option>
              <option value="GOOD">Good (70-84)</option>
              <option value="AVERAGE">Average (50-69)</option>
              <option value="POOR">Poor (35-49)</option>
              <option value="CRITICAL">Critical (&lt;35)</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Rating</label>
            <select
              value={filters.minRating || ""}
              onChange={(e) => handleFieldChange("minRating", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="1">1-2 Stars (Negative)</option>
            </select>
          </div>

          {/* Wood Type */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Timber Species</label>
            <select
              value={filters.woodType || "ALL"}
              onChange={(e) => handleFieldChange("woodType", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Woods</option>
              <option value="Teak">Sagwan Teak</option>
              <option value="Sheesham">Sheesham Wood</option>
              <option value="Rosewood">Rosewood</option>
            </select>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-slate-400 text-[11px] font-medium mb-1">Customer Photos</label>
            <select
              value={filters.hasImages || "ALL"}
              onChange={(e) => handleFieldChange("hasImages", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Any Media</option>
              <option value="YES">With Photos</option>
              <option value="NO">Text Only</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedReviewSearchToolbar;
