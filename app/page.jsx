"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Star, MessageSquare, PhoneCall, ShieldCheck, Truck,
  HeartHandshake, Ruler, ChevronRight, Award, Sparkles, MapPin
} from "lucide-react";

/* ─── Scroll reveal hook ──────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedSection({ children, delay = 0, fromDir = "bottom", className = "" }) {
  const [ref, inView] = useInView();
  const translate =
    fromDir === "left" ? "translateX(-50px)"
    : fromDir === "right" ? "translateX(50px)"
    : "translateY(40px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : translate,
        transition: `opacity 0.7s ${delay}s ease-out, transform 0.7s ${delay}s ease-out`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Infinite Horizontal Sliding Strip ───────────────────────────── */
const SLIDE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    label: "Royal 7-Seater Teak Sofa",
  },
  {
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    label: "Monarch Dining Suite",
  },
  {
    src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
    label: "Imperial Master Bedroom",
  },
  {
    src: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    label: "Heritage 4-Door Wardrobe",
  },
  {
    src: "https://images.unsplash.com/photo-1533779283484-8da696530a65?auto=format&fit=crop&w=600&q=80",
    label: "Teak Center Table",
  },
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    label: "Executive Recliner Chair",
  },
  {
    src: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
    label: "Custom Bespoke Furniture",
  },
  {
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    label: "King Bed with Storage",
  },
];

function SlidingStrip({ direction = "left", speed = 35 }) {
  // Duplicate for seamless loop
  const items = [...SLIDE_IMAGES, ...SLIDE_IMAGES];
  const totalItems = SLIDE_IMAGES.length;
  const cardW = 280; // px
  const gap = 16; // px
  const totalWidth = totalItems * (cardW + gap); // width of one set

  return (
    <div className="overflow-hidden w-full relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1c0a00, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1c0a00, transparent)" }} />

      <div
        className="flex"
        style={{
          gap,
          width: `${items.length * (cardW + gap)}px`,
          animation: `strip${direction === "left" ? "Left" : "Right"} ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {items.map((img, i) => (
          <SlideCard key={i} img={img} width={cardW} />
        ))}
      </div>
    </div>
  );
}

function SlideCard({ img, width }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer"
      style={{
        width,
        height: 200,
        transform: hovered ? "scale(1.05) translateY(-4px)" : "scale(1) translateY(0px)",
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
        boxShadow: hovered
          ? "0 20px 50px rgba(0,0,0,0.7), 0 0 0 2px rgba(245,158,11,0.5)"
          : "0 6px 20px rgba(0,0,0,0.5)",
      }}
    >
      <img
        src={img.src}
        alt={img.label}
        className="w-full h-full object-cover"
        style={{
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.5s ease",
          filter: hovered ? "brightness(0.55)" : "brightness(0.45)",
        }}
      />
      {/* Always visible label */}
      <div
        className="absolute inset-x-0 bottom-0 p-3"
        style={{
          background: "linear-gradient(to top, rgba(10,4,0,0.9) 0%, transparent 100%)",
        }}
      >
        <p className="text-amber-100 text-xs font-bold truncate">{img.label}</p>
      </div>
      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <Link
          href="/products"
          className="px-4 py-2 rounded-full bg-amber-500 text-amber-950 text-[10px] font-extrabold hover:bg-amber-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View Collection →
        </Link>
      </div>
      {/* Shimmer on hover */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
            animation: "shimmerGlide 0.7s ease-out",
          }}
        />
      )}
    </div>
  );
}

/* ─── 3D Tilt Furniture Card ──────────────────────────────────────── */
function FurnitureCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 20,
      y: ((e.clientY - r.top) / r.height - 0.5) * -20,
    });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative rounded-3xl overflow-hidden cursor-pointer select-none"
      style={{
        transform: hovered
          ? `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.04)`
          : "perspective(800px) scale(1)",
        transition: "transform 0.25s ease-out, box-shadow 0.25s ease-out",
        boxShadow: hovered
          ? "0 30px 60px rgba(120,53,15,0.35), 0 8px 20px rgba(0,0,0,0.3)"
          : "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute inset-0 flex items-end p-4"
          style={{
            background: hovered
              ? "linear-gradient(to top, rgba(20,7,0,0.85) 0%, rgba(20,7,0,0.2) 50%, transparent 100%)"
              : "linear-gradient(to top, rgba(20,7,0,0.5) 0%, transparent 60%)",
            transition: "background 0.3s ease",
          }}
        >
          {hovered && (
            <p className="text-amber-300 text-xs font-bold animate-in slide-in-from-bottom-3 duration-300">
              {item.material}
            </p>
          )}
        </div>
        <span className="absolute top-3 left-3 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
          {item.tag}
        </span>
      </div>
      <div className="bg-white p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded capitalize">{item.category}</span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{item.rating} ({item.reviews})</span>
          </div>
        </div>
        <h3 className="text-base font-bold font-serif text-slate-900 line-clamp-1">{item.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-slate-900">{item.price}</span>
          <span className="text-xs text-slate-400 line-through">{item.originalPrice}</span>
        </div>
        <Link
          href={`/contact?inquiry=${encodeURIComponent(item.name)}`}
          className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors flex items-center justify-center gap-2 group"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquire / Custom Quote</span>
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Category Card with 3D hover ──────────────────────────────────── */
function CategoryCard({ cat }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 18,
      y: ((e.clientY - r.top) / r.height - 0.5) * -14,
    });
  };
  return (
    <Link
      href={`/products?category=${cat.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl overflow-hidden shadow-md h-80 block"
      style={{
        transform: hovered
          ? `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.04)`
          : "perspective(900px) scale(1)",
        transition: "transform 0.25s ease-out, box-shadow 0.25s ease-out",
        boxShadow: hovered ? "0 30px 60px rgba(120,53,15,0.3), 0 6px 20px rgba(0,0,0,0.3)" : undefined,
      }}
    >
      <img
        src={cat.image}
        alt={cat.title}
        className="w-full h-full object-cover"
        style={{
          transform: hovered ? "scale(1.12)" : "scale(1)",
          transition: "transform 0.6s ease-out",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: hovered
            ? "linear-gradient(to top, rgba(20,5,0,0.95) 0%, rgba(20,5,0,0.25) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(20,5,0,0.85) 0%, rgba(20,5,0,0.15) 60%, transparent 100%)",
          transition: "background 0.4s ease",
        }}
      />
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at ${50 + tilt.x * 2}% ${50 - tilt.y * 2}%, rgba(251,191,36,0.1) 0%, transparent 60%)` }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1.5">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/90 text-amber-950 inline-block">
          {cat.itemsCount}
        </span>
        <h3 className="text-xl font-bold font-serif">{cat.title}</h3>
        <p className="text-xs text-amber-200/80">{cat.subtitle}</p>
        <div
          className="flex items-center gap-1 text-amber-400 text-xs font-bold"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.3s ease",
          }}
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const categories = [
    {
      id: "living",
      title: "Living Room Luxury",
      subtitle: "Royal Sofas, Recliners & Center Tables",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      itemsCount: "45+ Models",
    },
    {
      id: "bedroom",
      title: "Master Bedroom Suites",
      subtitle: "Solid Wood King Beds & Wardrobes",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      itemsCount: "38+ Designs",
    },
    {
      id: "dining",
      title: "Royal Dining Collections",
      subtitle: "6 & 8 Seater Teak Dining Suites",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      itemsCount: "25+ Sets",
    },
    {
      id: "custom",
      title: "Bespoke Custom Furniture",
      subtitle: "Tailor-made to your exact interior dimensions",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
      itemsCount: "100% Customized",
    },
  ];

  const bestsellers = [
    {
      id: 1, name: "Royal Teak Wood 7-Seater Sofa Set", category: "Living Room",
      price: "₹85,000", originalPrice: "₹1,10,000", rating: 4.9, reviews: 142,
      material: "Grade-A Sagwan Teak", tag: "Best Seller",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2, name: "Imperial Handcarved King Bed with Storage", category: "Bedroom",
      price: "₹62,500", originalPrice: "₹78,000", rating: 5.0, reviews: 98,
      material: "Sheesham Solid Hardwood", tag: "Trending",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3, name: "Monarch 6-Seater Teak Dining Table Set", category: "Dining Room",
      price: "₹54,000", originalPrice: "₹68,000", rating: 4.8, reviews: 86,
      material: "Solid Teak Wood", tag: "Popular",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4, name: "Heritage Wooden Wardrobe with Mirror", category: "Storage",
      price: "₹48,900", originalPrice: "₹59,000", rating: 4.9, reviews: 64,
      material: "Teak Finish Hardwood", tag: "Special Edition",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const valueProps = [
    { icon: ShieldCheck, title: "Lifetime Termite & Wood Guarantee", description: "100% seasoned Grade-A Teak & Sheesham wood built to last across generations." },
    { icon: Ruler, title: "Custom Interior Tailoring", description: "Get furniture customized precisely to your room space & color themes." },
    { icon: Truck, title: "Safe Delivery & Free Assembly", description: "White-glove doorstep delivery with expert carpenter assembly included." },
    { icon: HeartHandshake, title: "Direct Workshop Pricing", description: "No middlemen commission. Premium quality at true manufacturing price." },
  ];

  return (
    <div>
      {/* ── HERO with Sliding Strip ── */}
      <section className="relative bg-gradient-to-b from-amber-950 via-[#1c0a00] to-[#0d0500] text-amber-50 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }} />

        {/* ── Text content ── */}
        <div className="container mx-auto px-4 md:px-8 pt-20 pb-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <AnimatedSection delay={0.05}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-800/60 border border-amber-700/50 text-amber-300 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generations of Artisanal Woodcraft Excellence</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.12}>
              <h1 className="text-4xl sm:text-5xl xl:text-7xl font-extrabold tracking-tight leading-none">
                Crafting{" "}
                <span className="font-serif italic text-amber-400">Timeless Elegance</span>
                <br />for Your Home
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-amber-200/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                Hand-carved Sagwan Teak sofas, luxury dining sets, master bedroom suites, and custom interior furniture from <strong className="text-amber-300">Aameena Furniture</strong>.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.28}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link href="/products"
                  className="group px-8 py-3.5 rounded-full font-bold text-sm text-amber-950 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 30px rgba(245,158,11,0.3), 0 6px 20px rgba(0,0,0,0.4)" }}
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact"
                  className="px-8 py-3.5 rounded-full font-semibold text-sm text-amber-100 border border-amber-700/70 bg-amber-900/50 hover:bg-amber-800/70 transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust numbers */}
            <AnimatedSection delay={0.35}>
              <div className="pt-8 border-t border-amber-800/40 grid grid-cols-3 gap-6 max-w-sm mx-auto">
                {[
                  { val: "4.9★", sub: "Google Rating" },
                  { val: "100%", sub: "Solid Hardwood" },
                  { val: "10K+", sub: "Happy Homeowners" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xl font-extrabold text-white">{s.val}</p>
                    <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* ── SLIDING IMAGE STRIP ── */}
        <AnimatedSection delay={0.4}>
          <div className="relative pb-12 pt-4 space-y-4 overflow-hidden">
            {/* Row 1 — left direction */}
            <SlidingStrip direction="left" speed={40} />
            {/* Row 2 — right direction (reverse) */}
            <SlidingStrip direction="right" speed={50} />
          </div>
        </AnimatedSection>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.1}>
              <div className="bg-white p-6 rounded-2xl border border-amber-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 group cursor-default h-full">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-amber-50 transition-colors duration-300">
                  <prop.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-serif">{prop.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{prop.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container mx-auto px-4 md:px-8 space-y-8 pb-16">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/60 pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Curated Collections</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">Explore Furniture By Category</h2>
            </div>
            <Link href="/products" className="text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <AnimatedSection key={cat.id} delay={idx * 0.08}>
              <CategoryCard cat={cat} />
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="bg-amber-900/5 py-16 border-y border-amber-200/60">
        <div className="container mx-auto px-4 md:px-8 space-y-10">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Handcrafted Favorites</span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">Featured Bestselling Masterpieces</h2>
              <p className="text-sm text-slate-600">Built with 100% solid hardwood, premium finish, and custom cushion tailoring.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((item, idx) => (
              <AnimatedSection key={item.id} delay={idx * 0.1}>
                <FurnitureCard item={item} />
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="text-center pt-4">
              <Link href="/products" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md hover:scale-105">
                <span>Explore Entire Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 3-STEP PROCESS ── */}
      <section className="container mx-auto px-4 md:px-8 py-20 space-y-12">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Your Vision, Our Craft</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">How We Custom Craft Your Furniture</h2>
            <p className="text-sm text-slate-600">From concept & 3D planning to final doorstep assembly.</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5"
            style={{ background: "linear-gradient(to right, #fde68a, #f59e0b, #fde68a)" }} />
          {[
            { n: "01", title: "Space & Design Consultation", body: "Share your room dimensions, preferred wood species, and cushion fabric preferences with our master craftsmen.", color: "bg-amber-800" },
            { n: "02", title: "Precision Handcarving & Polish", body: "Our artisans season the hardwood, hand-carve intricate motifs, and apply multi-coat polyurethane or melamine teak polish.", color: "bg-amber-700" },
            { n: "03", title: "Delivery & White-Glove Setup", body: "We transport your custom furniture safely and provide full on-site installation by our expert team.", color: "bg-amber-600" },
          ].map((step, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.15}>
              <div className="bg-white p-8 rounded-2xl border border-amber-200/70 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center space-y-4 group">
                <div className={`w-14 h-14 ${step.color} text-amber-50 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md group-hover:scale-110 transition-transform`}>
                  {step.n}
                </div>
                <h3 className="text-lg font-bold font-serif text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── AI REVIEWS BANNER ── */}
      <section className="container mx-auto px-4 md:px-8 pb-16">
        <AnimatedSection>
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.15) 0%, transparent 60%)" }} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/80 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI-Powered Review System</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold font-serif leading-tight">Verified Google Location Reviews & AI Sentiment Insights</h2>
                <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">See what real homeowners say about Aameena Furniture's craftsmanship, durability, and on-time delivery.</p>
                <Link href="/ai-reviews" className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm transition-all hover:scale-105">
                  <span>Explore AI Location Reviews</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="lg:col-span-4 bg-amber-900/60 p-6 rounded-2xl border border-amber-700/60 space-y-3 group-hover:border-amber-500/60 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-300">Live Rating</span>
                  <span className="text-xs bg-emerald-500 text-emerald-950 font-extrabold px-2 py-0.5 rounded">Verified</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">4.9</span>
                  <span className="text-amber-200 text-sm">/ 5.0 stars</span>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed italic">"AI: 98% positive satisfaction on Teak quality and custom finishing."</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── SHOWROOM CONTACT ── */}
      <section className="container mx-auto px-4 md:px-8 pb-20">
        <AnimatedSection>
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-amber-200/70 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center hover:shadow-xl transition-shadow duration-500">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Visit Our Showroom</span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">Experience the Craftsmanship in Person</h2>
              <p className="text-slate-600 text-sm leading-relaxed">Step into our flagship showroom to feel the premium teak grains, test sofa comfort, and consult directly with our furniture designers.</p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-amber-800 shrink-0" /><span>Aameena Furniture Grand Showroom, Central Furniture Hub</span></div>
                <div className="flex items-center gap-3"><PhoneCall className="w-5 h-5 text-amber-800 shrink-0" /><span>+91 98765 43210</span></div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact" className="px-6 py-3 rounded-full bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-sm transition-all hover:scale-105">Book Appointment</Link>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center gap-2 hover:scale-105">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Consultation</span>
                </a>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-80 bg-slate-200 border border-amber-200">
              <iframe
                title="Aameena Furniture Showroom"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.269789394625!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjg8MTInNTAuMCJOIDc3wrAxMiczMi40IkU!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                className="w-full h-full border-0" allowFullScreen="" loading="lazy"
              />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Global animation keyframes ── */}
      <style>{`
        @keyframes stripLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes stripRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes shimmerGlide {
          0%   { transform: translateX(-100%) skewX(-10deg); }
          100% { transform: translateX(200%) skewX(-10deg); }
        }
        @keyframes slide-in-from-bottom-3 {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation-fill-mode: both; }
        .slide-in-from-bottom-3 { animation-name: slide-in-from-bottom-3; }
        .duration-300 { animation-duration: 0.3s; }
      `}</style>
    </div>
  );
}
