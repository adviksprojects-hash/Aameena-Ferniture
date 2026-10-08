"use client";

import { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  QrCode,
  Smartphone,
  Eye,
  Info,
  Layers,
  Box,
  Check,
  X,
  Play,
  Pause,
  Compass,
  Volume2,
  ShieldCheck,
  Sun,
  Moon,
  Camera,
} from "lucide-react";

export default function Furniture3DViewer({
  product,
  initialModelUrl,
  className = "",
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeModel, setActiveModel] = useState(
    initialModelUrl ||
      (product?.woodType?.toLowerCase().includes("fabric") ||
      product?.title?.toLowerCase().includes("sofa") ||
      product?.Category?.slug?.includes("sofa") ||
      product?.Category?.slug?.includes("fabric")
        ? "/models/sofa.glb"
        : "/models/chair.glb")
  );
  const [activeEnvironment, setActiveEnvironment] = useState("neutral");
  const [modelLoading, setModelLoading] = useState(true);

  const containerRef = useRef(null);
  const modelViewerRef = useRef(null);

  // Load Google <model-viewer> script
  useEffect(() => {
    setMounted(true);

    // Detect mobile device for AR button vs Desktop QR trigger
    const userAgent =
      typeof navigator !== "undefined"
        ? navigator.userAgent || navigator.vendor || window.opera
        : "";
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(userAgent);
    setIsMobile(isMobileDevice);

    // Check if script is already present
    const existingScript = document.querySelector(
      'script[src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"]'
    );

    if (existingScript) {
      setScriptLoaded(true);
    } else {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Google <model-viewer> script");
        setScriptLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  // Sync model-viewer loading events
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv) return;

    const handleLoad = () => setModelLoading(false);
    const handleError = () => setModelLoading(false);

    mv.addEventListener("load", handleLoad);
    mv.addEventListener("error", handleError);

    return () => {
      mv.removeEventListener("load", handleLoad);
      mv.removeEventListener("error", handleError);
    };
  }, [scriptLoaded, activeModel]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  };

  // Reset Camera View to front-center
  const handleResetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = "0deg 75deg 105%";
      modelViewerRef.current.cameraTarget = "auto auto auto";
      modelViewerRef.current.fieldOfView = "auto";
    }
  };

  // Handle AR button click
  const handleArClick = () => {
    if (isMobile && modelViewerRef.current) {
      if (modelViewerRef.current.canActivateAR) {
        modelViewerRef.current.activateAR();
      } else {
        // Fallback to QR or message
        setShowQrModal(true);
      }
    } else {
      setShowQrModal(true);
    }
  };

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://aameenafurniture.com/products/${product?.slug || product?.id || ""}`;

  // Direct Google Chart QR code URL for easy high-resolution mobile scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=FFFFFF&color=3A1F04&margin=1`;

  if (!mounted) {
    return (
      <div className="w-full h-[450px] bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-400">Loading 3D Studio...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black text-amber-50 shadow-2xl border border-amber-900/40 select-none ${className}`}
      style={{ minHeight: "480px" }}
    >
      {/* 3D Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <Box className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Interactive 3D & 360° Studio</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-amber-200/70 font-mono bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            Drag to Rotate • Pinch/Scroll to Zoom
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* AR Trigger Button */}
          <button
            type="button"
            onClick={handleArClick}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
            title="Place in Your Room with Augmented Reality"
          >
            <Smartphone className="w-4 h-4 text-slate-950" />
            <span>View in Your Room (AR)</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 hover:scale-105 transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Optional Close Button if modal mode */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 backdrop-blur-md text-white border border-white/10 hover:scale-105 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {(!scriptLoaded || modelLoading) && (
        <div className="absolute inset-0 z-10 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-amber-200">
              Rendering High-Fidelity 3D Model...
            </p>
            <p className="text-xs text-stone-400">
              Loading authentic wood grain & photorealistic lighting
            </p>
          </div>
        </div>
      )}

      {/* Google <model-viewer> Web Component Container */}
      <div className="w-full h-[480px] sm:h-[540px] flex items-center justify-center relative">
        {scriptLoaded ? (
          // @ts-ignore
          <model-viewer
            ref={modelViewerRef}
            src={activeModel}
            alt={product?.title || "3D Furniture Model"}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            camera-controls
            auto-rotate={autoRotate ? "auto-rotate" : undefined}
            rotation-per-second="25deg"
            camera-orbit="0deg 75deg 105%"
            field-of-view="35deg"
            shadow-intensity="1.5"
            shadow-softness="0.8"
            exposure="1.0"
            environment-image={
              activeEnvironment === "warm"
                ? "neutral"
                : activeEnvironment === "studio"
                ? "legacy"
                : "neutral"
            }
            interaction-prompt="auto"
            touch-action="pan-y"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              outline: "none",
            }}
          >
            {/* Custom AR Button slot inside model-viewer for native triggering */}
            <button
              slot="ar-button"
              id="ar-button"
              className="hidden"
            >
              View in your room
            </button>
          </model-viewer>
        ) : (
          <div className="text-stone-400 text-sm">Initializing 3D Engine...</div>
        )}
      </div>

      {/* Floating Control Toolbar (Bottom Center / Left) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Quick Switcher for Furniture 3D Types */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveModel("/models/sofa.glb")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModel === "/models/sofa.glb"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Sofa Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModel("/models/chair.glb")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModel === "/models/chair.glb"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Chair Mode</span>
          </button>
        </div>

        {/* Right: Camera Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 pointer-events-auto">
          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
            title={autoRotate ? "Pause 360° Auto Turntable" : "Start 360° Auto Turntable"}
          >
            {autoRotate ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {autoRotate ? "Auto-Spinning" : "Paused"}
            </span>
          </button>

          {/* Reset Camera Position */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
            title="Reset to Front Studio Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Reset Angle</span>
          </button>

          {/* QR Code AR Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
            title="Scan Mobile QR Code for Augmented Reality"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Mobile AR QR</span>
          </button>
        </div>
      </div>

      {/* AR QR Code Modal for Desktop Buyers */}
      {showQrModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-amber-200 relative text-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-amber-700" />
                <span>Augmented Reality (AR)</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                View Furniture in Your Room
              </h3>
              <p className="text-xs text-slate-600">
                Scan this QR code with your smartphone camera (iPhone or Android) to see this furniture at real 1:1 scale in your living room!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-amber-100">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR code for AR furniture preview"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span>Compatible with iOS (iPhone) & Android</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block">How it works:</span>
              <ol className="space-y-1.5 text-slate-600 list-decimal list-inside text-[11px]">
                <li>Open your mobile phone camera and point it at the QR code above.</li>
                <li>Tap the link banner that appears on your phone screen.</li>
                <li>Tap <strong>"View in Your Room (AR)"</strong> on the mobile page.</li>
                <li>Point your camera towards your floor to drop and test dimensions!</li>
              </ol>
            </div>

            {/* Close CTA */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Close AR Preview Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
