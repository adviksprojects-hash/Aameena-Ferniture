"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
  subtitle = "Furniture & Furnishing",
  className = "",
  priority = false,
  storeName,
  layout = "auto", // "auto" | "stacked" | "inline"
}) {
  const [dynamicName, setDynamicName] = useState(storeName || "Aameena Distributors");
  const [dynamicSubtitle, setDynamicSubtitle] = useState(subtitle);

  // Sync dynamic settings from localStorage and live custom events
  useEffect(() => {
    if (storeName) {
      setDynamicName(storeName);
    } else {
      try {
        const cached = localStorage.getItem("aameena_platform_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.storeName) setDynamicName(parsed.storeName);
          if (!subtitle && parsed.storeSubtitle) setDynamicSubtitle(parsed.storeSubtitle);
        }
      } catch (e) {}
    }

    const handleUpdate = () => {
      try {
        const updated = localStorage.getItem("aameena_platform_settings");
        if (updated) {
          const parsed = JSON.parse(updated);
          if (!storeName && parsed.storeName) setDynamicName(parsed.storeName);
          if (!subtitle && parsed.storeSubtitle) setDynamicSubtitle(parsed.storeSubtitle);
        }
      } catch (e) {}
    };

    if (typeof window !== "undefined") {
      window.addEventListener("aameena_settings_updated", handleUpdate);
      return () => window.removeEventListener("aameena_settings_updated", handleUpdate);
    }
  }, [storeName, subtitle]);

  // Dimensions based on size
  const sizeMap = {
    sm: { img: 36, textTitle: "text-xs sm:text-sm", textSub: "text-[9px]" },
    md: { img: 44, textTitle: "text-sm sm:text-base", textSub: "text-[10px]" },
    lg: { img: 56, textTitle: "text-base sm:text-lg", textSub: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Split name into first word and remaining words for two-tone luxury typography
  const words = (dynamicName || "Aameena Distributors").trim().split(/\s+/);
  const word1 = words[0] || "Aameena";
  const wordRest = words.slice(1).join(" ") || "";

  // Determine layout: if "stacked" or (layout === "auto" and size === "sm"), stack words cleanly
  const isStacked = layout === "stacked" || (layout === "auto" && size === "sm");

  const content = (
    <div className={`brand-logo-root inline-flex items-center gap-2.5 sm:gap-3 group select-none min-w-0 ${className}`}>
      {/* 3D Glossy Brand Logo Emblem */}
      <div className="brand-logo-emblem relative shrink-0 overflow-hidden rounded-xl bg-slate-950/70 border border-amber-500/30 p-0.5 shadow-md transition-all duration-200 group-hover:scale-105">
        <Image
          src="/images/logo.png"
          alt={`${dynamicName} Logo`}
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain rounded-lg"
          priority={priority}
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="brand-logo-text flex flex-col text-left leading-tight min-w-0">
          {isStacked ? (
            <div className="flex flex-col font-black tracking-tight leading-none">
              <span className="brand-logo-word1 uppercase font-serif text-xs sm:text-sm tracking-wide text-white transition-colors duration-200 truncate">
                {word1}
              </span>
              {wordRest && (
                <span className="brand-logo-word2 font-sans uppercase font-extrabold tracking-wider text-[10px] sm:text-xs text-amber-400 transition-colors duration-200 truncate mt-0.5">
                  {wordRest}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-1.5 font-black tracking-tight font-serif leading-none">
              <span className="brand-logo-word1 uppercase text-xs sm:text-base transition-colors duration-200">
                {word1}
              </span>
              {wordRest && (
                <span className="brand-logo-word2 font-sans uppercase font-extrabold tracking-wide text-xs sm:text-base text-amber-400 transition-colors duration-200">
                  {wordRest}
                </span>
              )}
            </div>
          )}
          {dynamicSubtitle && (
            <span className={`brand-logo-subtitle font-medium tracking-wider uppercase mt-1 truncate transition-colors duration-200 ${currentSize.textSub}`}>
              {dynamicSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="brand-logo-link inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
