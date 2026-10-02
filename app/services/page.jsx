import Link from "next/link";
import { Wrench, Ruler, Truck, RefreshCw, Building2, Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: Ruler,
      title: "Bespoke Custom Furniture Crafting",
      description: "Tailor-made teak wood and sheesham furniture designed precisely to fit your home's unique dimensions, room theme, and cushion preferences.",
      features: ["3D Room Modeling & Layout", "Selection of Sagwan Teak & Sheesham", "Custom Fabric & Velvet Upholstery"],
    },
    {
      icon: Building2,
      title: "Commercial & Corporate Furnishing",
      description: "Complete interior furnishing solutions for luxury hotels, corporate offices, interior designer projects, and boutique resorts.",
      features: ["Bulk Furniture Pricing", "Project Manager Assignment", "Strict On-Time Delivery Guarantee"],
    },
    {
      icon: RefreshCw,
      title: "Wood Restoration & Refurbishing",
      description: "Breath new life into heirloom wooden furniture with our multi-step sanding, termite proofing, and melamine teak polishing services.",
      features: ["Heirloom Furniture Care", "Polyurethane & PU Matte Polishing", "Structural Frame Reinforcement"],
    },
    {
      icon: Truck,
      title: "Doorstep Delivery & White-Glove Setup",
      description: "Safe padded transport in specialized trucks with full on-site unboxing, positioning, and expert carpenter installation.",
      features: ["Zero-Damage Transport Guarantee", "Professional Carpenter Assembly", "Packaging Disposal Included"],
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Our Expertise</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Aameena Furniture Services</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          From custom 3D furniture design to commercial furnishing and white-glove installation, we deliver end-to-end artisanal woodcraft excellence.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((srv, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-8 border border-amber-200/70 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center">
                <srv.icon className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold font-serif text-slate-900">{srv.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{srv.description}</p>

              <div className="space-y-2 pt-2 border-t border-amber-100">
                {srv.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/contact"
              className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Book Service Consultation</span>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
