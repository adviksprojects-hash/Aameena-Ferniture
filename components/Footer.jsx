import Link from 'next/link';
import { Sofa, Phone, Mail, MapPin, Star, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-100 border-t border-amber-900/60 pt-16 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="bg-amber-500 p-2 rounded-xl text-amber-950">
                <Sofa className="w-6 h-6" />
              </div>
              <span>Aameena <span className="text-amber-400 font-serif italic">Furniture</span></span>
            </Link>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Crafting premium hardwood furniture, bespoke living sets, dining masterpieces, and custom interior solutions with generations of artisanal excellence.
            </p>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span>4.9/5 from 850+ Google Reviews</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 font-serif">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm text-amber-200/80">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">Furniture Catalog</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Custom Crafting Services</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Packages & Estimator</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Book Showroom Visit</Link></li>
              <li><Link href="/ai-reviews" className="hover:text-amber-400 transition-colors">Showroom Reviews & Ratings</Link></li>
              <li><Link href="/careers" className="hover:text-amber-400 transition-colors">Join Our Team</Link></li>
            </ul>
          </div>

          {/* Customer Support & Portals */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 font-serif">Support & Access</h3>
            <ul className="space-y-2.5 text-sm text-amber-200/80">
              <li><Link href="/orders" className="hover:text-amber-400 transition-colors">Track Order Status</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">Our Workshop Heritage</Link></li>
              <li className="pt-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">Staff Access</span>
                <div className="flex items-center gap-3">
                  <Link href="/manager" className="text-xs bg-amber-900/80 text-amber-200 hover:text-white px-2.5 py-1 rounded border border-amber-800">Manager Portal</Link>
                  <Link href="/admin" className="text-xs bg-amber-600 text-amber-950 font-semibold px-2.5 py-1 rounded">Admin Portal</Link>
                </div>
              </li>
            </ul>
          </div>

          {/* Showroom Contact Info */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 font-serif">Sole Official Store</h3>
            <ul className="space-y-3 text-sm text-amber-200/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="https://www.google.com/maps/place/AMEENA+Distributors%E2%80%99s+Sofa+Set+Furniture+Company/@17.6578402,75.9362493,15z/data=!3m1!4b1!4m6!3m5!1s0x3bc5db34c23e5907:0x86af8fec8b37d0ed!8m2!3d17.6578402!4d75.9362493!16s%2Fg%2F11gypsrxj5"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-300 font-semibold block text-white transition-colors"
                  >
                    AMEENA Distributors’s Sofa Set Furniture Company
                  </a>
                  <span className="text-xs text-amber-200/70 block mt-0.5">Solapur, Maharashtra 413005</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+918669233747" className="hover:text-amber-300 transition-colors">
                  +91 86692 33747
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@ameenadistributors.com</span>
              </li>
              <li className="pt-2">
                <a 
                  href="https://api.whatsapp.com/send?phone=918600570542&text=Hello%20Ameena%20Distributors,%20I%20am%20inquiring%20about%20furniture%20from%20your%20website." 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp (+91 86005 70542)
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-amber-900/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-amber-300/60 gap-4">
          <p>© {new Date().getFullYear()} Aameena Furniture & Furnishing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-amber-300">Privacy Policy</Link>
            <Link href="/about" className="hover:text-amber-300">Terms of Service</Link>
            <Link href="/contact" className="hover:text-amber-300">Showroom Locations</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
