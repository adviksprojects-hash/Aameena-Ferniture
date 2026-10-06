"use client";

/**
 * @file ReviewErrorState.jsx
 * Friendly, accessible error states for Google reviews service failures.
 */

import { AlertCircle, WifiOff, ShieldAlert, ZapOff, RefreshCw, FileWarning } from "lucide-react";
import { ERROR_STATE_TYPES } from "../types/reviewTypes.js";

export function ReviewErrorState({
  type = ERROR_STATE_TYPES.NETWORK_FAILURE,
  message = "",
  onRetry,
}) {
  const configs = {
    [ERROR_STATE_TYPES.NETWORK_FAILURE]: {
      icon: WifiOff,
      title: "Network Connection Issue",
      description: "Unable to reach Google review servers. Please verify your internet connection and try again.",
    },
    [ERROR_STATE_TYPES.PERMISSION_DENIED]: {
      icon: ShieldAlert,
      title: "Access Restricted",
      description: "Google Places API credentials did not validate. Showing authentic localized catalog.",
    },
    [ERROR_STATE_TYPES.QUOTA_EXCEEDED]: {
      icon: ZapOff,
      title: "API Quota Limit Reached",
      description: "Daily Google Maps API inquiry threshold reached. Fallback cache is serving verified reviews.",
    },
    [ERROR_STATE_TYPES.MALFORMED_RESPONSE]: {
      icon: FileWarning,
      title: "Unexpected Data Format",
      description: "The remote review response could not be parsed safely. Sanitized catalog active.",
    },
    [ERROR_STATE_TYPES.CACHE_FAILURE]: {
      icon: AlertCircle,
      title: "Cache Synchronization Error",
      description: "The local review cache could not be updated. Serving direct memory records.",
    },
    [ERROR_STATE_TYPES.API_UNAVAILABLE]: {
      icon: AlertCircle,
      title: "Review Service Unavailable",
      description: "The review repository is currently unavailable. Please reload or check back shortly.",
    },
  };

  const config = configs[type] || configs[ERROR_STATE_TYPES.NETWORK_FAILURE];
  const IconComponent = config.icon;

  return (
    <div
      className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto my-8 shadow-sm space-y-4"
      role="alert"
    >
      <div className="size-14 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
        <IconComponent className="size-7" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          {message || config.description}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewErrorState;
