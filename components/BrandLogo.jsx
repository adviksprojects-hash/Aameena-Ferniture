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
  layout = "auto",
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
    sm: { img: 34, word1: "text-[11px] sm:text-xs", word2: "text-[9px] sm:text-[10px]", sub: "text-[7.5px] sm:text-[8px]" },
    md: { img: 44, word1: "text-xs sm:text-sm md:text-base", word2: "text-[10px] sm:text-xs md:text-xs", sub: "text-[8px] sm:text-[9px] md:text-[9.5px]" },
    lg: { img: 56, word1: "text-sm sm:text-base md:text-lg", word2: "text-xs sm:text-sm md:text-base", sub: "text-[9px] sm:text-[10px] md:text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Split name into first word and remaining words (e.g. "AAMEENA" and "Distributors")
  const words = (dynamicName || "Aameena Distributors").trim().split(/\s+/);
  const word1 = words[0] || "Aameena";
  const wordRest = words.slice(1).join(" ") || "Distributors";
  const finalSubtitle = dynamicSubtitle || "Furniture & Furnishing";

  const content = (
    <div className={`brand-logo-root inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 group select-none min-w-0 ${className}`}>
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

      {/* Brand Text: Line 1 (AAMEENA), Line 2 (Distributors), Line 3 (Furniture & Furnishing) */}
      {showText && (
        <div className="brand-logo-text flex flex-col text-left justify-center min-w-0 leading-tight">
          {/* Line 1: AAMEENA */}
          <span className={`brand-logo-word1 uppercase font-serif font-black tracking-wider leading-none transition-colors duration-200 truncate ${currentSize.word1}`}>
            {word1}
          </span>

          {/* Line 2: Distributors */}
          {wordRest && (
            <span className={`brand-logo-word2 uppercase font-sans font-extrabold tracking-wider leading-none text-amber-300 transition-colors duration-200 truncate mt-0.5 ${currentSize.word2}`}>
              {wordRest}
            </span>
          )}

          {/* Line 3: If space is available in small text (hidden on small screens <= 420px) */}
          {finalSubtitle && (
            <span className={`brand-logo-subtitle brand-logo-sub-responsive uppercase font-sans font-semibold tracking-widest leading-tight transition-colors duration-200 truncate mt-0.5 ${currentSize.sub}`}>
              {finalSubtitle}
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
