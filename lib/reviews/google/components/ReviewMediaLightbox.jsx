"use client";

/**
 * @file ReviewMediaLightbox.jsx
 * Enterprise Review Media Lightbox & Zoom Viewer.
 * Features:
 * - Multi-image carousel navigation (Prev / Next)
 * - Keyboard navigation (Left, Right, Escape)
 * - Interactive zoom controls (Zoom In, Zoom Out, Reset 100%)
 * - Thumbnail strip for direct image selection
 * - Image index counter & ARIA accessibility
 */

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from "lucide-react";

export function ReviewMediaLightbox({
  images = [],
  initialIndex = 0,
  onClose,
  authorName = "Customer",
}) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1))
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  const hasMultiple = images.length > 1;
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft" && hasMultiple) {
        handlePrev();
      } else if (e.key === "ArrowRight" && hasMultiple) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultiple, handlePrev, handleNext, onClose]);

  if (!currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo gallery for review by ${authorName}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white z-20 pb-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-stone-200">
            {authorName}&rsquo;s Photos
          </span>
          {hasMultiple && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
              {currentIndex + 1} of {images.length}
            </span>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-900/90 border border-stone-800 rounded-full px-2 py-1">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="size-4" />
            </button>
            <span className="text-xs font-mono text-stone-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-full text-amber-400 hover:bg-stone-800 transition-colors"
                title="Reset Zoom"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close viewer (Esc)"
            aria-label="Close photo viewer"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-2 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Previous */}
        {hasMultiple && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white border border-stone-700/60 shadow-lg backdrop-blur-xs transition-all hover:scale-105"
            title="Previous image (Left Arrow)"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* Display Image with Interactive Zoom */}
        <div
          className="relative w-full h-[65vh] flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src={currentImage}
            alt={`Customer photo ${currentIndex + 1} by ${authorName}`}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
            unoptimized={
              currentImage.startsWith("data:") || !currentImage.includes("unsplash.com")
            }
          />
        </div>

        {/* Navigation Next */}
        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white border border-stone-700/60 shadow-lg backdrop-blur-xs transition-all hover:scale-105"
            title="Next image (Right Arrow)"
            aria-label="Next image"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {hasMultiple && (
        <div
          className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setCurrentIndex(idx);
              }}
              className={`relative size-14 sm:size-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? "border-amber-500 scale-105 shadow-md"
                  : "border-stone-800 opacity-60 hover:opacity-100"
              }`}
              aria-label={`Jump to image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={img.startsWith("data:") || !img.includes("unsplash.com")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewMediaLightbox;
