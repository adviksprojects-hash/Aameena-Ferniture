"use client";

/**
 * @file ImageUploader.jsx
 * Multi-image drag & drop uploader with client-side compression,
 * preview thumbnails, validation, and count constraints.
 */

import React, { useState, useRef } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import {
  validateImagesList,
  readAndCompressImage,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_MB,
} from "../utils/imageProcessor.js";

export function ImageUploader({
  images = [],
  onImagesChange,
  maxImages = MAX_IMAGE_COUNT,
  disabled = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploadError(null);

    // Validate size and count
    const val = validateImagesList(files, images.length);
    if (!val.valid) {
      setUploadError(val.errors[0] || "Invalid image upload");
      return;
    }

    setIsProcessing(true);
    try {
      const processedDataUrls = [];
      for (const file of files) {
        const compressed = await readAndCompressImage(file, 1200, 1200, 0.82);
        processedDataUrls.push(compressed);
      }
      onImagesChange?.([...images, ...processedDataUrls].slice(0, maxImages));
    } catch (err) {
      setUploadError(err.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (indexToRemove) => {
    if (disabled) return;
    const filtered = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange?.(filtered);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>Photos (Optional)</span>
        </label>
        <span className="text-xs text-stone-400">
          {images.length}/{maxImages} images • Max {MAX_IMAGE_SIZE_MB}MB each
        </span>
      </div>

      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/20"
              : "border-stone-200 dark:border-stone-700/80 hover:border-amber-500 bg-stone-50/50 dark:bg-stone-900/40"
          } ${disabled || isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled || isProcessing}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200">
              {isProcessing
                ? "Compressing image..."
                : "Drag & drop photos here, or click to browse"}
            </p>
            <p className="text-[11px] text-stone-400">Supports JPG, PNG, WebP</p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Thumbnails preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
          {images.map((imgSrc, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 group bg-stone-100 dark:bg-stone-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={`Review preview ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
