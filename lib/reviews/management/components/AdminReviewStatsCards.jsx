"use client";

/**
 * @file AdminReviewStatsCards.jsx
 * Interactive metric cards displaying live counts for Overview, Pending,
 * Approved, Hidden, Reported, Spam, Archived, Deleted, and Restored reviews.
 */

import React from "react";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  EyeOff,
  Flag,
  ShieldAlert,
  Archive,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { REVIEW_STATUS } from "../types/managementTypes.js";

const STATUS_CONFIGS = [
  {
    id: "OVERVIEW",
    label: "Overview",
    desc: "Executive metrics",
    icon: LayoutDashboard,
    borderActive: "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20",
    iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40",
  },
  {
    id: REVIEW_STATUS.PENDING,
    label: "Pending",
    desc: "Awaiting review",
    icon: Clock,
    borderActive: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20",
    iconColor: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40",
  },
  {
    id: REVIEW_STATUS.APPROVED,
    label: "Approved",
    desc: "Live & published",
    icon: CheckCircle2,
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20",
    iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    id: REVIEW_STATUS.HIDDEN,
    label: "Hidden",
    desc: "Off public site",
    icon: EyeOff,
    borderActive: "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/40 dark:bg-orange-950/20",
    iconColor: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40",
  },
  {
    id: REVIEW_STATUS.REPORTED,
    label: "Reported",
    desc: "User flagged",
    icon: Flag,
    borderActive: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20",
    iconColor: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40",
  },
  {
    id: REVIEW_STATUS.SPAM,
    label: "Spam",
    desc: "Duplicates & bots",
    icon: ShieldAlert,
    borderActive: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/20",
    iconColor: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40",
  },
  {
    id: REVIEW_STATUS.ARCHIVED,
    label: "Archived",
    desc: "Historical records",
    icon: Archive,
    borderActive: "border-stone-500 ring-2 ring-stone-500/20 bg-stone-100/60 dark:bg-stone-800/40",
    iconColor: "text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-800",
  },
  {
    id: REVIEW_STATUS.DELETED,
    label: "Deleted",
    desc: "Removed records",
    icon: Trash2,
    borderActive: "border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20",
    iconColor: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40",
  },
  {
    id: REVIEW_STATUS.RESTORED,
    label: "Restored",
    desc: "Re-activated",
    icon: RotateCcw,
    borderActive: "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20",
    iconColor: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40",
  },
];

export function AdminReviewStatsCards({ stats = {}, activeTab = "PENDING", onSelectTab }) {
  const totalReviews = stats.totalReviews ?? stats.totalCount ?? stats.total ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
      {STATUS_CONFIGS.map((cfg) => {
        const Icon = cfg.icon;
        const count = cfg.id === "OVERVIEW" ? totalReviews : (stats[cfg.id] || 0);
        const isActive = activeTab === cfg.id;

        return (
          <button
            key={cfg.id}
            type="button"
            onClick={() => onSelectTab?.(cfg.id)}
            className={`p-3 rounded-xl border text-left transition-all duration-200 hover:shadow-xs relative overflow-hidden cursor-pointer ${
              isActive
                ? cfg.borderActive
                : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">
                {count}
              </span>
            </div>

            <div className="mt-2">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-200 truncate">{cfg.label}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{cfg.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AdminReviewStatsCards;
