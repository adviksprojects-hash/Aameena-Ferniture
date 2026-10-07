"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, Crown } from "lucide-react";

const THEMES = [
  { id: "warm", label: "Teak", icon: Sparkles, desc: "Royal Teak & Amber" },
  { id: "light", label: "Light", icon: Sun, desc: "Crisp Studio White" },
  { id: "dark", label: "Dark", icon: Moon, desc: "Obsidian Midnight" },
  { id: "royal", label: "Emerald", icon: Crown, desc: "Royal Emerald & Champagne Gold" },
];

export default function ThemeSwitcher({ className = "" }) {
  const [currentTheme, setCurrentTheme] = useState("warm");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("aameena_theme") || "warm";
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark" || theme === "royal") {
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
      <div className={`h-8 w-24 bg-amber-900/40 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select website aesthetic theme"
      className={`inline-flex items-center p-0.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-850/60 shadow-inner ${className}`}
    >
      {THEMES.map((theme) => {
        const Icon = theme.icon;
        const isActive = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelectTheme(theme.id)}
            title={`${theme.label} Theme — ${theme.desc}`}
            aria-checked={isActive}
            role="radio"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 select-none cursor-pointer ${
              isActive
                ? theme.id === "royal"
                  ? "bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 text-stone-950 shadow-md scale-105"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-md scale-102"
                : "text-amber-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
