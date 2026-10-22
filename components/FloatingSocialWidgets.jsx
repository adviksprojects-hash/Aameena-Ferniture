"use client";

import Image from "next/image";

/**
 * FloatingSocialWidgets Component
 * Persistent, sticky right-corner widgets for WhatsApp (+91 97303 92917)
 * and Instagram (@mateenfurnituremall) across the entire website.
 */
export default function FloatingSocialWidgets() {
  const whatsappUrl =
    "https://wa.me/919730392917?text=Hello%20Aameena%20Furniture%2C%20I%20am%20interested%20in%20your%20furniture%20collection.";
  const instagramUrl = "https://www.instagram.com/mateenfurnituremall/";

  return (
    <aside
      aria-label="Floating Contact & Social Widgets"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none"
    >
      {/* Instagram Floating Widget */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Aameena Furniture on Instagram @mateenfurnituremall"
        title="Follow us on Instagram @mateenfurnituremall"
        className="group relative flex items-center justify-center size-12 sm:size-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Tooltip on Desktop */}
        <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl hidden md:block transform translate-x-1 group-hover:translate-x-0">
          @mateenfurnituremall
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95 dark:border-l-white" />
        </span>

        <div className="relative w-full h-full">
          <Image
            src="/images/instagram.png"
            alt="Instagram @mateenfurnituremall"
            fill
            sizes="(max-width: 640px) 48px, 56px"
            className="object-contain transition-transform duration-300 group-hover:rotate-6"
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
        className="group relative flex items-center justify-center size-12 sm:size-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Active Online Pulse Indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </span>

        {/* Tooltip on Desktop */}
        <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl hidden md:block transform translate-x-1 group-hover:translate-x-0">
          Chat on WhatsApp (+91 97303 92917)
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95 dark:border-l-white" />
        </span>

        <div className="relative w-full h-full">
          <Image
            src="/images/whatsapp.png"
            alt="WhatsApp Chat"
            fill
            sizes="(max-width: 640px) 48px, 56px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </div>
      </a>
    </aside>
  );
}
