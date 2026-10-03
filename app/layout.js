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
  description: "Discover handcrafted teak wood sofas, luxury dining sets, bedroom suites, and custom interior furnishings at Aameena Furniture Solapur.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="warm"
        suppressHydrationWarning
        className={inter.className}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const t = localStorage.getItem('aameena_theme') || 'warm';
                  document.documentElement.setAttribute('data-theme', t);
                  if (t === 'dark') document.documentElement.classList.add('dark');
                } catch(e) {}
              `,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col selection:bg-amber-500 selection:text-amber-950 transition-colors duration-200">
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