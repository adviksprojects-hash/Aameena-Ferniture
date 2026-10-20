"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Gem } from "lucide-react";

const THEMES = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    title: "Light Mode (Crisp White)",
    activeClass: "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/60",
  },
  {
    id: "emerald",
    label: "Emerald",
    icon: Gem,
    title: "Emerald Mode (Royal Jewel & Gold)",
    activeClass: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/80",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    title: "Dark Mode (Obsidian Midnight)",
    activeClass: "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/60",
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
      <div className={`h-8 w-24 bg-slate-800/40 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme Mode Selection"
      className={`relative z-50 inline-flex items-center gap-1 p-1 rounded-full bg-slate-200/90 dark:bg-slate-950/90 [data-theme="emerald"]:bg-[#011c14] border border-slate-300 dark:border-slate-800 [data-theme="emerald"]:border-emerald-700/60 shadow-xs backdrop-blur-md transition-all ${className}`}
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
            aria-label={theme.title}
            aria-pressed={isActive}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? theme.activeClass
                : "text-slate-600 dark:text-slate-400 [data-theme='emerald']:text-emerald-300/80 hover:text-slate-950 dark:hover:text-white [data-theme='emerald']:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-transform duration-200 ${
                isActive
                  ? "scale-110"
                  : "text-amber-600 dark:text-amber-400 [data-theme='emerald']:text-emerald-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

