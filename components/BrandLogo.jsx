"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
  subtitle = "Furniture & Furnishing",
  className = "",
  priority = false,
}) {
  // Dimensions based on size
  const sizeMap = {
    sm: { img: 34, textTitle: "text-xs sm:text-sm", textSub: "text-[9px]" },
    md: { img: 44, textTitle: "text-sm sm:text-base", textSub: "text-[10px]" },
    lg: { img: 56, textTitle: "text-base sm:text-lg", textSub: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`brand-logo-root inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* 3D Glossy Brand Logo Emblem */}
      <div className="brand-logo-emblem relative shrink-0 overflow-hidden rounded-xl bg-slate-950/70 border border-amber-500/30 p-0.5 shadow-md transition-all duration-200 group-hover:scale-105">
        <Image
          src="/images/logo.png"
          alt="Aameena Distributors Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain rounded-lg"
          priority={priority}
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="brand-logo-text flex flex-col text-left leading-none">
          <div className="flex items-center gap-1 font-black tracking-tight font-serif">
            <span className="brand-logo-word1 uppercase text-xs sm:text-base transition-colors duration-200">
              Aameena
            </span>
            <span className="brand-logo-word2 font-sans uppercase font-extrabold tracking-wide text-xs sm:text-base transition-colors duration-200">
              Distributors
            </span>
          </div>
          {subtitle && (
            <span className={`brand-logo-subtitle font-medium tracking-wider uppercase mt-0.5 max-w-[150px] sm:max-w-none truncate transition-colors duration-200 ${currentSize.textSub}`}>
              {subtitle}
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
