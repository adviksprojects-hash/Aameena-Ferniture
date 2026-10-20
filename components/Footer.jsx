import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { Sofa, Phone, Mail, MapPin, Star, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-dark-bg="true" className="site-footer bg-black text-white border-t border-neutral-800 pt-16 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <BrandLogo href="/" size="lg" subtitle="Manufacturers & Interior Furnishing" />
            <p className="text-neutral-300 text-sm leading-relaxed">
              Crafting premium hardwood furniture, bespoke living sets, dining masterpieces, and custom interior solutions with generations of artisanal excellence.
            </p>
            <div className="flex items-center gap-2 text-neutral-200 text-sm font-medium">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-neutral-300">4.9/5 from 850+ Google Reviews</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 data-dark-bg="true" className="footer-title text-white !text-white text-base font-bold mb-4 font-serif">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Furniture Catalog</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Custom Crafting Services</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Packages & Estimator</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Woodcraft Blog & Guides</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Book Showroom Visit</Link></li>
              <li><Link href="/ai-reviews" className="hover:text-white transition-colors">Showroom Reviews & Ratings</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Join Our Team</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 data-dark-bg="true" className="footer-title text-white !text-white text-base font-bold mb-4 font-serif">Customer Care & Heritage</h3>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Workshop Heritage</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Saved Wishlist Items</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Custom Wood Finishing</Link></li>
            </ul>
          </div>

          {/* Showroom Contact Info */}
          <div>
            <h3 data-dark-bg="true" className="footer-title text-white !text-white text-base font-bold mb-4 font-serif">Sole Official Store</h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="https://share.google/sUjpmS81krOIIhOZY"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white font-semibold block text-white transition-colors"
                  >
                    AMEENA Distributors’s Sofa Set Furniture Company
                  </a>
                  <span className="text-xs text-neutral-400 block mt-0.5">Solapur, Maharashtra 413005</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+919730392917" className="hover:text-white transition-colors">
                  +91 97303 92917
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:Shuaibmanglur@gmail.com" className="text-neutral-300 hover:text-white transition-colors">
                  Shuaibmanglur@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <a 
                  href="https://api.whatsapp.com/send?phone=919730392917&text=Hello%20Ameena%20Distributors,%20I%20am%20inquiring%20about%20furniture%20from%20your%20website." 
                  target="_blank" 
                  rel="noreferrer" 
                  className="whatsapp-btn inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  Chat on WhatsApp (+91 97303 92917)
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-neutral-400">© {new Date().getFullYear()} Aameena Furniture & Furnishing. All rights reserved.</p>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <p className="text-neutral-300 font-medium">
              Developed by <span className="font-bold text-white !text-white developer-brand" style={{ color: "#ffffff" }}>ADVIKS Softech</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">Showroom Locations</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
