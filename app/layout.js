import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/HeaderComponents/Header";
import LayoutShell from "@/components/LayoutShell";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Aameena Furniture & Furnishing | Luxury Custom Handwood Furniture",
  description:
    "Discover handcrafted teak wood sofas, luxury dining sets, bedroom suites, and custom interior furnishings at Aameena Furniture Solapur.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="warm"
        data-scroll-behavior="smooth"
        suppressHydrationWarning
        className={inter.className}
      >
        <head>
          <Script
            id="aameena-theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const t = localStorage.getItem('aameena_theme') || 'warm';
                  const n = t === 'emerald' ? 'royal' : t === 'teak' ? 'warm' : t;
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