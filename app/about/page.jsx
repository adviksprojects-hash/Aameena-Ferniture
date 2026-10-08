import Link from "next/link";
import { Sofa, ShieldCheck, Award, HeartHandshake, Sparkles, MapPin, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-12 space-y-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-16 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Our Artisanal Heritage</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">About Aameena Furniture</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          Combining legacy woodworking craftsmanship with modern ergonomic design to create solid teak and sheesham furniture that lasts for generations.
        </p>
      </div>

      {/* Story & Heritage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Our Story</span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">Over Three Decades of Handcrafted Masterpieces</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Founded with a passion for genuine solid wood furniture, <strong>Aameena Furniture</strong> has grown from a humble family workshop into one of the region's premier destinations for custom hardwood furniture and luxury home furnishings.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every dining table, sofa frame, and royal bed undergoes meticulous seasoning, termite treatment, and hand-polishing by master carpenters who have honed their skills over decades.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <span className="text-3xl font-extrabold text-amber-900 font-serif">30+</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Years of Woodcraft Legacy</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <span className="text-3xl font-extrabold text-amber-900 font-serif">100%</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Grade-A Seasoned Teak</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200">
          <img
            src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80"
            alt="Master carpenter polishing Teak wood furniture"
            className="w-full h-[400px] object-cover"
          />
        </div>
      </div>

    </div>
  );
}
