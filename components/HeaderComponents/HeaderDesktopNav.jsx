"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/HeaderData/HeaderData";
import { cn } from "@/lib/utils";

export default function HeaderDesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "desktop-nav hidden xl:flex items-center gap-0.5 2xl:gap-1 rounded-full border border-amber-800/60 bg-amber-900/40 p-1.5 backdrop-blur-md shadow-inner transition-colors duration-200"
      )}
      aria-label="Desktop Navigation"
    >
      {navLinks.map((link) => {
        const isActive = pathname === link.url;
        return (
          <Link
            key={link.id}
            href={link.url}
            className={cn(
              "rounded-full px-2.5 2xl:px-3.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-amber-500 text-amber-950 shadow-md font-bold"
                : "text-amber-200/90 hover:text-white hover:bg-amber-800/50"
            )}
          >
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
}
