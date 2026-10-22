"use client";

import { useState, useEffect } from "react";
import { getPlatformSettings } from "@/actions/settingsActions";
import { X, Sparkles } from "lucide-react";

export default function AnnouncementBanner() {
  const [config, setConfig] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchSettings = () => {
      getPlatformSettings()
        .then((res) => {
          if (res.success && res.settings) {
            setConfig(res.settings);
          }
        })
        .catch(() => {});
    };

    fetchSettings();

    window.addEventListener("aameena_settings_updated", fetchSettings);
    return () => {
      window.removeEventListener("aameena_settings_updated", fetchSettings);
    };
  }, []);

  if (!config || !config.enableAnnouncement || !config.announcementText || dismissed) {
    return null;
  }

  const bgStyles = {
    orange: "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white",
    emerald: "bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white border-b border-emerald-600/40",
    purple: "bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white border-b border-purple-500/40",
    amber: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold",
  };

  const currentBg = bgStyles[config.announcementColor] || bgStyles.orange;

  return (
    <div
      role="banner"
      className={`relative py-1.5 px-4 text-xs text-center flex items-center justify-center gap-2 shadow-xs transition-all z-40 select-none ${currentBg}`}
    >
      <div className="flex items-center gap-1.5 font-medium truncate max-w-4xl pr-8 pl-2 sm:px-4">
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
        <span className="truncate">{config.announcementText}</span>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/20 text-current transition-colors cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
