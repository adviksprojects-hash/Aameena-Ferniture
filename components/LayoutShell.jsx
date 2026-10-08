"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

/**
 * LayoutShell Component
 * Selectively renders the public customer storefront Header and Footer.
 * Automatically hides the navbar and footer on /admin and /manager dashboard pages.
 */
export default function LayoutShell({ header, children }) {
  const pathname = usePathname();
  const isPortalRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/manager");

  if (isPortalRoute) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
