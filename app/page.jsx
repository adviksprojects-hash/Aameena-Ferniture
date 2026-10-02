import Link from "next/link";
import { 
  Sofa, 
  Award, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Star, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  Ruler, 
  Wrench, 
  MapPin, 
  HeartHandshake,
  Layers,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const categories = [
    {
      id: "living",
      title: "Living Room Luxury",
      subtitle: "Royal Sofas, Recliners & Center Tables",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      itemsCount: "45+ Models",
      accent: "from-amber-700 to-amber-900",
    },
    {
      id: "bedroom",
      title: "Master Bedroom Suites",
      subtitle: "Solid Wood King Beds & Wardrobes",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      itemsCount: "38+ Designs",
      accent: "from-amber-800 to-amber-950",
    },
    {
      id: "dining",
      title: "Royal Dining Collections",
      subtitle: "6 & 8 Seater Teak Dining Suites",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      itemsCount: "25+ Sets",
      accent: "from-amber-900 to-amber-950",
    },
    {
      id: "custom",
      title: "Bespoke Custom Furniture",
      subtitle: "Tailor-made to fit your Exact Interior dimensions",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
      itemsCount: "100% Customized",
      accent: "from-amber-600 to-amber-800",
    },
  ];

  const bestsellers = [
    {
      id: 1,
      name: "Royal Teak Wood 7-Seater Sofa Set",
      category: "Living Room",
      price: "₹85,000",
      originalPrice: "₹1,10,000",
      rating: 4.9,
      reviews: 142,
      material: "Grade-A Sagwan Teak Wood",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
      tag: "Best Seller",
    },
    {
      id: 2,
      name: "Imperial Handcarved King Bed with Storage",
      category: "Bedroom",
      price: "₹62,500",
      originalPrice: "₹78,000",
      rating: 5.0,
      reviews: 98,
      material: "Sheesham Solid Hardwood",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      tag: "Trending",
    },
    {
      id: 3,
      name: "Monarch 6-Seater Teak Dining Table Set",
      category: "Dining Room",
      price: "₹54,000",
      originalPrice: "₹68,000",
      rating: 4.8,
      reviews: 86,
      material: "Solid Teak & Premium Cushion",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
      tag: "Popular",
    },
    {
      id: 4,
      name: "Heritage Wooden Wardrobe with Mirror",
      category: "Storage",
      price: "₹48,900",
      originalPrice: "₹59,000",
      rating: 4.9,
      reviews: 64,
      material: "Teak Finish Hardwood",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
      tag: "Special Edition",
    },
  ];

  const valueProps = [
    {
      icon: ShieldCheck,
      title: "Lifetime Termite & Wood Guarantee",
      description: "100% seasoned Grade-A Teak & Sheesham wood built to last across generations.",
    },
    {
      icon: Ruler,
      title: "Custom Interior Tailoring",
      description: "Get furniture customized precisely according to your room space & color themes.",
    },
    {
      icon: Truck,
      title: "Safe Delivery & Free Assembly",
      description: "White-glove doorstep delivery with expert carpenter assembly included.",
    },
    {
      icon: HeartHandshake,
      title: "Direct Workshop Pricing",
      description: "No middlemen commission. Premium quality at true manufacturing price.",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-amber-50 py-20 lg:py-28 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-800/60 border border-amber-700/60 text-amber-300 text-xs md:text-sm font-medium shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generations of Artisanal Woodcraft Excellence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
                Crafting <span className="font-serif italic text-amber-400">Timeless Elegance</span> for Your Home
              </h1>

              <p className="text-amber-200/90 text-base md:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Explore hand-carved Teak Wood sofas, luxury dining sets, master bedroom suites, and custom home interior furniture from <strong>Aameena Furniture</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-base transition-all shadow-lg shadow-amber-500/20 hover:scale-105 flex items-center gap-2"
                >
                  <span>Explore Furniture Catalog</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/contact"
                  className="px-7 py-3.5 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-semibold text-base border border-amber-700/70 transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Book Custom Consultation</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-amber-800/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-white">4.9★</p>
                  <p className="text-xs text-amber-300/80">Google Review Rating</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-amber-300/80">Solid Teak & Sheesham</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-white">10,000+</p>
                  <p className="text-xs text-amber-300/80">Happy Homeowners</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-800/40 group">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                  alt="Aameena Furniture Premium Living Room Set"
                  className="w-full h-[380px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Featured Masterpiece</span>
                  <h3 className="text-xl font-bold text-white">Signature Royal Teak Living Suite</h3>
                  <p className="text-xs text-amber-200/90 mt-1">Handcrafted with premium velvet upholstery & sagwan wood detailing.</p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-200">
                <div className="p-3 bg-amber-500 rounded-xl text-amber-950 font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950 uppercase tracking-wide">Quality Assured</p>
                  <p className="text-sm font-semibold text-slate-800">Direct Factory Craftsmanship</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-amber-200/70 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <prop.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">{prop.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES GRID */}
      <section className="container mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/60 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Curated Collections</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">Explore Furniture By Category</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group">
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="group relative rounded-2xl overflow-hidden shadow-md h-80 block border border-amber-200/50">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-950/40 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/90 text-amber-950 w-fit">
                  {cat.itemsCount}
                </span>
                <h3 className="text-xl font-bold font-serif">{cat.title}</h3>
                <p className="text-xs text-amber-200/80 line-clamp-1">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BESTSELLERS SECTION */}
      <section className="bg-amber-900/5 py-16 border-y border-amber-200/60">
        <div className="container mx-auto px-4 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Handcrafted Favorites</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">Featured Bestselling Masterpieces</h2>
            <p className="text-sm text-slate-600">Built with 100% solid hardwood, premium finish, and custom cushion tailoring.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  {/* Image container */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-amber-800 text-amber-50 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {item.tag}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{item.category}</span>
                      <div className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{item.rating} ({item.reviews})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-amber-800 transition-colors">
                      {item.name}
                    </h3>

                    <div className="text-xs text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-md w-fit">
                      {item.material}
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-extrabold text-slate-900">{item.price}</span>
                      <span className="text-xs text-slate-400 line-through">{item.originalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-5 pb-5 pt-0">
                  <Link
                    href={`/contact?inquiry=${encodeURIComponent(item.name)}`}
                    className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire / Request Custom Quote</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CUSTOM FURNITURE 3-STEP PROCESS */}
      <section className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Your Vision, Our Craft</span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">How We Custom Craft Your Furniture</h2>
          <p className="text-sm text-slate-600">From concept & 3D planning to final doorstep assembly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-8 rounded-2xl border border-amber-200/70 shadow-sm relative text-center space-y-4">
            <div className="w-14 h-14 bg-amber-800 text-amber-50 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
              01
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Space & Design Consultation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Share your room dimensions, preferred wood species (Teak/Sheesham), and cushion fabric preferences with our interior master craftsmen.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-amber-200/70 shadow-sm relative text-center space-y-4">
            <div className="w-14 h-14 bg-amber-700 text-amber-50 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
              02
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Precision Handcarving & Polish</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our artisans season the hardwood, precision hand-carve intricate motifs, and apply multi-coat polyurethane or melamine teak polish.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-amber-200/70 shadow-sm relative text-center space-y-4">
            <div className="w-14 h-14 bg-amber-600 text-amber-50 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
              03
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Delivery & White-Glove Setup</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We transport your custom furniture safely and provide full on-site installation and positioning by our expert team.
            </p>
          </div>
        </div>
      </section>

      {/* 6. AI GOOGLE REVIEWS BANNER PREVIEW */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/80 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI-Powered Review System</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif leading-tight">
                Verified Google Location Reviews & AI Sentiment Insights
              </h2>
              <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
                See what real homeowners in your area say about Aameena Furniture’s craftsmanship, durability, and on-time delivery.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/ai-reviews"
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm transition-all flex items-center gap-2"
                >
                  <span>Explore AI Location Reviews</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-amber-900/60 p-6 rounded-2xl border border-amber-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-300">Live Rating Summary</span>
                <span className="text-xs bg-emerald-500 text-emerald-950 font-extrabold px-2 py-0.5 rounded">Verified</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">4.9</span>
                <span className="text-amber-200 text-sm">out of 5.0 stars</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed italic">
                "AI Sentiment Analysis highlights 98% positive satisfaction on Teak wood quality and custom finishing."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. SHOWROOM LOCATOR & DIRECT CONTACT */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-amber-200/70 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Visit Our Showroom</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">Experience the Texture & Craftsmanship in Person</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Step into Aameena Furniture’s flagship showroom to feel the premium teak grains, test sofa comfort, and consult directly with our furniture designers.
            </p>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-800 shrink-0" />
                <span>Aameena Furniture Main Showroom, Central Furniture Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-amber-800 shrink-0" />
                <span>+91 98765 43210 (Sales & Custom Orders)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-sm transition-all"
              >
                Book Showroom Appointment
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Instant Consultation</span>
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-80 bg-slate-200 border border-amber-200">
            <iframe
              title="Aameena Furniture Showroom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.269789394625!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjg8MTInNTAuMCJOIDc3wrAxMiczMi40IkU!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
