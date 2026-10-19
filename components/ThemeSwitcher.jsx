"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Gem } from "lucide-react";

const THEMES = [
  {
    id: "light",
    label: "Light",
    shortLabel: "Light",
    icon: Sun,
    title: "Light Mode (Crisp White)",
    activeClass: "bg-amber-500 text-slate-950 font-bold shadow-xs",
  },
  {
    id: "emerald",
    label: "Emerald",
    shortLabel: "Emerald",
    icon: Gem,
    title: "Emerald Mode (Royal Jewel & Gold)",
    activeClass: "bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/50",
  },
  {
    id: "dark",
    label: "Dark",
    shortLabel: "Dark",
    icon: Moon,
    title: "Dark Mode (Obsidian Midnight)",
    activeClass: "bg-amber-500 text-slate-950 font-bold shadow-xs",
  },
];

export default function ThemeSwitcher({ className = "" }) {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("aameena_theme") || "light";
    // Discard legacy/removed "warm" or "teak" themes and fallback to default "light"
    const normalized =
      saved === "warm" || saved === "teak"
        ? "light"
        : saved === "royal"
        ? "emerald"
        : saved;
    setCurrentTheme(normalized);
    applyTheme(normalized);
  }, []);

  const applyTheme = (theme) => {
    if (typeof document === "undefined") return;
    const normalized =
      theme === "emerald"
        ? "royal"
        : theme === "warm" || theme === "teak"
        ? "light"
        : theme;
    document.documentElement.setAttribute("data-theme", normalized);
    if (normalized === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem("aameena_theme", themeId);
    applyTheme(themeId);
  };

  if (!mounted) {
    return (
      <div className={`h-8 w-28 bg-slate-800/40 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme Mode Selection"
      className={`relative z-50 inline-flex items-center p-0.5 sm:p-1 rounded-full bg-slate-200/90 dark:bg-slate-950/90 [data-theme="emerald"]:bg-[#011c14] border border-slate-300 dark:border-slate-800 [data-theme="emerald"]:border-emerald-700/60 shadow-xs backdrop-blur-md transition-all ${className}`}
    >
      {THEMES.map((theme) => {
        const Icon = theme.icon;
        const isActive = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelectTheme(theme.id)}
            title={theme.title}
            aria-pressed={isActive}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? theme.activeClass
                : "text-slate-600 dark:text-slate-400 [data-theme='emerald']:text-emerald-300/80 hover:text-slate-950 dark:hover:text-white [data-theme='emerald']:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isActive
                  ? ""
                  : "text-amber-600 dark:text-amber-400 [data-theme='emerald']:text-emerald-400"
              }`}
            />
            <span className="hidden sm:inline font-semibold text-[11px]">
              {theme.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

