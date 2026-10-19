import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/HeaderComponents/Header";
import LayoutShell from "@/components/LayoutShell";
import TopProgressBar from "@/components/TopProgressBar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Aameena Distributors | Luxury Sofa Set Furniture & Furnishing",
  description:
    "Discover handcrafted teak wood sofas, luxury dining sets, bedroom suites, and custom interior furnishings at Aameena Distributors Solapur.",
  icons: {
    icon: [
      { url: "/images/logo.png" },
      { url: "/icon.png" },
    ],
    apple: [
      { url: "/images/logo.png" },
    ],
    shortcut: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="light"
        data-scroll-behavior="smooth"
        suppressHydrationWarning
        className={inter.className}
      >
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=4" />
          <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=4" />
          <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.png?v=4" />
          <link rel="shortcut icon" href="/images/logo.png?v=4" />
          <Script
            id="aameena-theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const t = localStorage.getItem('aameena_theme') || 'light';
                  const n = (t === 'teak' || t === 'warm') ? 'light' : t === 'emerald' ? 'royal' : t;
                  document.documentElement.setAttribute('data-theme', n);
                  if (n === 'dark') document.documentElement.classList.add('dark');
                } catch(e) {}
              `,
            }}
          />
        </head>
        <body
          suppressHydrationWarning
          className="min-h-screen flex flex-col selection:bg-amber-500 selection:text-amber-950 transition-colors duration-200"
        >
          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>
          <WishlistProvider>
            <CartProvider>
              <LayoutShell header={<Header />}>
                {children}
              </LayoutShell>
            </CartProvider>
          </WishlistProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}