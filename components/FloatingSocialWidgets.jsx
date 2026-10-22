"use client";

import Image from "next/image";

/**
 * FloatingSocialWidgets Component
 * Clean, completely transparent, floating sticky corner widgets for WhatsApp (+91 97303 92917)
 * and Instagram (@mateenfurnituremall). Zero background plates or white boxes.
 */
export default function FloatingSocialWidgets() {
  const whatsappUrl =
    "https://wa.me/919730392917?text=Hello%20Aameena%20Furniture%2C%20I%20am%20interested%20in%20your%20furniture%20collection.";
  const instagramUrl = "https://www.instagram.com/mateenfurnituremall/";

  return (
    <div
      role="region"
      aria-label="Floating Contact & Social Widgets"
      className="floating-social-widgets fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3.5 pointer-events-auto select-none bg-transparent"
    >
      {/* Instagram Floating Widget */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Aameena Furniture on Instagram @mateenfurnituremall"
        title="Follow us on Instagram @mateenfurnituremall"
        className="social-widget-btn group relative flex items-center justify-center size-12 sm:size-14 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-lg hover:drop-shadow-2xl bg-transparent"
      >
        {/* Tooltip on Desktop */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl hidden md:block transform translate-x-1 group-hover:translate-x-0">
          @mateenfurnituremall
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90" />
        </span>

        <div className="relative w-full h-full bg-transparent">
          <Image
            src="/images/instagram.png"
            alt="Instagram @mateenfurnituremall"
            fill
            sizes="(max-width: 640px) 48px, 56px"
            className="object-contain transition-transform duration-300 group-hover:rotate-6 bg-transparent"
            priority={false}
          />
        </div>
      </a>

      {/* WhatsApp Floating Widget */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Aameena Furniture on WhatsApp (+91 97303 92917)"
        title="Chat on WhatsApp (+91 97303 92917)"
        className="social-widget-btn group relative flex items-center justify-center size-12 sm:size-14 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-lg hover:drop-shadow-2xl bg-transparent"
      >
        {/* Active Online Pulse Indicator */}
        <span className="absolute top-0 right-0 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
        </span>

        {/* Tooltip on Desktop */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl hidden md:block transform translate-x-1 group-hover:translate-x-0">
          Chat on WhatsApp (+91 97303 92917)
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90" />
        </span>

        <div className="relative w-full h-full bg-transparent">
          <Image
            src="/images/whatsapp.png"
            alt="WhatsApp Chat"
            fill
            sizes="(max-width: 640px) 48px, 56px"
            className="object-contain transition-transform duration-300 group-hover:scale-105 bg-transparent"
            priority={false}
          />
        </div>
      </a>
    </div>
  );
}
