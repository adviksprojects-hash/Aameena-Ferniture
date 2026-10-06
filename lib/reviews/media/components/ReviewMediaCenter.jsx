"use client";

/**
 * @file ReviewMediaCenter.jsx
 * Enterprise Review Media Center & Lightbox for Aameena Furniture.
 * Supports image and video media, progressive zoom, 90° rotation,
 * HTML5 Fullscreen API, file download, URL sharing, and keyboard navigation.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
} from "lucide-react";

export function ReviewMediaCenter({
  isOpen = false,
  onClose,
  mediaList = [],
  initialIndex = 0,
  reviewerName = "Patron",
  furnitureTitle = "Craftsmanship",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef(null);

  const handleNext = () => {
    if (!mediaList || mediaList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    if (!mediaList || mediaList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "Escape":
          onClose?.();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
        case "_":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length, onClose]);

function getMediaUrl(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return item.url || item.src || item.imageUrl || "";
  }
  return String(item);
}

  if (!isOpen || !mediaList || mediaList.length === 0) return null;

  const currentItem = mediaList[currentIndex] || "";
  const currentMediaUrl = getMediaUrl(currentItem);
  const isVideo =
    (typeof currentItem === "object" && currentItem?.type === "video") ||
    (typeof currentMediaUrl === "string" &&
      (currentMediaUrl.endsWith(".mp4") || currentMediaUrl.includes("video")));

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(currentMediaUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Aameena_Furniture_Review_${reviewerName}_${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(currentMediaUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(currentMediaUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-150"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4 z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{(typeof currentItem === "object" && currentItem?.title) || furnitureTitle}</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Shared by {reviewerName} • Photo {currentIndex + 1} of {mediaList.length}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Rotate 90° (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Copy Media URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors ml-1"
            title="Close Lightbox (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
        {/* Previous Button */}
        {mediaList.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-xl transition-all"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Frame */}
        <div className="max-w-full max-h-full flex items-center justify-center transition-transform duration-200">
          {isVideo ? (
            <video
              src={currentMediaUrl}
              controls
              className="max-h-[75vh] max-w-[90vw] rounded-2xl shadow-2xl"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <img
              src={currentMediaUrl}
              alt={furnitureTitle}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              }}
            />
          )}
        </div>

        {/* Next Button */}
        {mediaList.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-xl transition-all"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {mediaList.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
          {mediaList.map((m, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
                setRotation(0);
              }}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === idx
                  ? "border-amber-400 scale-105 shadow-md shadow-amber-500/20"
                  : "border-slate-800 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={getMediaUrl(m)} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewMediaCenter;
