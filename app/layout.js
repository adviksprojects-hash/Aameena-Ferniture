import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/HeaderComponents/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ['latin']
});

export const metadata = {
  title: "Aameena Furniture & Furnishing | Luxury Custom Handwood Furniture",
  description: "Discover handcrafted teak wood sofas, luxury dining sets, bedroom suites, and custom interior furnishings at Aameena Furniture.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={inter.className}
      >
        <body className="min-h-screen flex flex-col bg-amber-50/20 text-slate-900 selection:bg-amber-500 selection:text-amber-950">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}