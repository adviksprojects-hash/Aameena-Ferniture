"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageSquare, X, ExternalLink } from "lucide-react";

export default function ProductShareModal({ product, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aameenafurniture.com";
  const shareUrl = `${origin}/products/${product.id}`;
  const shareTitle = `${product.title} | Handcrafted Solid Wood Furniture`;
  const shareText = `Explore this artisanal ${product.woodType} piece: "${product.title}" from Aameena Furniture (Solapur Manufacturer). Listed at ₹${product.price?.toLocaleString("en-IN")}.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        if (onClose) onClose();
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n\nView details: ${shareUrl}`
  )}`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-amber-200 relative popup-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Share2 className="w-4 h-4 text-amber-700" />
            <span>Share Furniture Piece</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900 line-clamp-1">{product.title}</h3>
          <p className="text-xs text-slate-500">
            Share this handcrafted {product.woodType} piece with family, friends, or interior designer.
          </p>
        </div>

        {/* Product Mini Preview */}
        <div className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"}
            alt={product.title}
            className="w-14 h-14 object-cover rounded-xl border border-amber-200"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">{product.title}</span>
            <span className="text-[11px] text-amber-900 font-semibold block">{product.woodType}</span>
            <span className="text-xs font-extrabold text-slate-900">₹{product.price?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Direct Action Channels */}
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp Direct Share */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Native Web Share */}
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <Share2 className="w-4 h-4" />
            <span>More Options</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5 pt-2 border-t border-amber-100">
          <label className="text-[11px] font-bold text-slate-600 block">Product Page Link</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full text-xs text-slate-700 bg-transparent px-2 focus:outline-none truncate font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-950"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-700 font-semibold text-center animate-in fade-in">
              ✓ Direct product link copied to your clipboard!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
