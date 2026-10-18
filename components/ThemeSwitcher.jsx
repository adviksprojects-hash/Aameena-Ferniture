"use client";

import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Crown, ChevronDown, Check } from "lucide-react";

const THEMES = [
  {
    id: "light",
    label: "Light",
    modeName: "Light Mode",
    icon: Sun,
    desc: "Crisp Studio White & Stone (Default)",
    colorPreview: "bg-slate-100 border-slate-300",
  },
  {
    id: "emerald",
    label: "Emerald",
    modeName: "Emerald Mode",
    icon: Crown,
    desc: "Imperial Forest Emerald & Brass",
    colorPreview: "bg-emerald-600 border-emerald-400",
  },
  {
    id: "dark",
    label: "Dark",
    modeName: "Dark Mode",
    icon: Moon,
    desc: "Obsidian Midnight Charcoal",
    colorPreview: "bg-slate-900 border-slate-700",
  },
];

export default function ThemeSwitcher({ className = "" }) {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

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
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className={`h-8 w-24 bg-slate-800/40 rounded-full animate-pulse ${className}`} />
    );
  }

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
  const ActiveIcon = activeThemeObj.icon;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Mode Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current Theme: ${activeThemeObj.label}. Click to select Mode`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border shadow-sm select-none ${
          isOpen
            ? "bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/40"
            : "bg-slate-900/85 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:text-white"
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full border ${activeThemeObj.colorPreview} shadow-xs shrink-0`} />
        <ActiveIcon className="w-3.5 h-3.5 text-amber-400" />
        <span>Mode: <strong className="font-bold">{activeThemeObj.label}</strong></span>
        <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-800 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
        >
          <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block">
              Select Theme Mode
            </span>
          </div>

          {THEMES.map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-200 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded-full border shrink-0 ${theme.colorPreview} shadow-xs`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold leading-tight">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
                      <span>{theme.modeName}</span>
                    </div>
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? "text-slate-900/80" : "text-slate-400"
                      }`}
                    >
                      {theme.desc}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-slate-950 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
