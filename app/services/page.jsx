"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Ruler,
  Truck,
  RefreshCw,
  Building2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  X,
  ImageIcon,
} from "lucide-react";
import { createServiceInquiry } from "@/actions/serviceActions";
import { getPublicServices } from "@/actions/serviceAdminActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateName } from "@/lib/validation";

const WOOD_OPTIONS = [
  { value: "Grade-A Sagwan Teak", label: "Grade-A Sagwan Teak" },
  { value: "Solid Sheesham Hardwood", label: "Solid Sheesham Hardwood" },
  { value: "Indian Rosewood", label: "Indian Rosewood" },
  { value: "American Walnut", label: "American Walnut" },
  { value: "African Mahogany", label: "African Mahogany" },
];

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceType: "Bespoke Custom Furniture Crafting",
    woodChoice: "Grade-A Sagwan Teak",
    roomType: "Living Room",
    dimensions: "",
    notes: "",
  });

  const DEFAULT_SERVICES = [
    {
      id: "default-1",
      icon: Ruler,
      title: "Bespoke Custom Furniture Crafting",
      description:
        "Tailor-made teak wood and sheesham furniture designed precisely to fit your home's unique architectural dimensions, room theme, and cushion density preferences.",
      features: [
        "3D Room Modeling & Layout Drafting",
        "Selection of Seasoned Sagwan Teak & Sheesham",
        "Custom Velvet, Linen, or Genuine Leather Upholstery",
        "10-Year Anti-Termite & Structural Frame Warranty",
      ],
      tag: "Most Requested",
    },
    {
      id: "default-2",
      icon: Building2,
      title: "Commercial & Corporate Furnishing",
      description:
        "Complete turnkey interior woodworking solutions for luxury boutique hotels, corporate headquarters, architect partnerships, and developer show-villas.",
      features: [
        "Bulk Volume Milestone Pricing",
        "Dedicated On-Site Project Manager",
        "Fire-Retardant PU Coatings Available",
        "Strict Scheduled Delivery Milestones",
      ],
      tag: "Turnkey B2B",
    },
    {
      id: "default-3",
      icon: RefreshCw,
      title: "Heirloom Wood Restoration & Refurbishing",
      description:
        "Breathe new life into antique wooden heirlooms with our multi-step mechanical sanding, termite-proofing vacuum soak, and hand-rubbed melamine teak polishing.",
      features: [
        "Preservation of Natural Patina & Carving",
        "Polyurethane & Italian Matte PU Polishing",
        "Hidden Structural Joint Reinforcement",
        "Doorstep Pickup & Restored Re-delivery",
      ],
      tag: "Heritage Craft",
    },
    {
      id: "default-4",
      icon: Truck,
      title: "Doorstep White-Glove Installation",
      description:
        "Safe, padded transport in climate-controlled suspension trucks with comprehensive on-site unboxing, positioning, and master carpenter assembly.",
      features: [
        "Zero-Damage Transport Guarantee",
        "Professional Master Carpenter Assembly",
        "Floor Protection & Debris Disposal Included",
        "On-Site Wood Wax & Inspection Walkthrough",
      ],
      tag: "Complimentary Service",
    },
  ];

  const [servicesList, setServicesList] = useState(DEFAULT_SERVICES);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await getPublicServices();
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((srv) => ({
            ...srv,
            features: Array.isArray(srv.features)
              ? srv.features
              : typeof srv.features === "string"
              ? JSON.parse(srv.features)
              : [],
            tag: srv.tag || "Workshop Craft",
          }));
          setServicesList(mapped);
        }
      } catch (err) {
        console.error("Error loading public services:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  const TIMELINE_STEPS = [
    {
      step: "01",
      title: "Blueprint & 3D Drafting",
      desc: "Our design team creates 3D CAD room layouts, dimension blueprints, and material specifications tailored to your space.",
      badge: "Week 1",
    },
    {
      step: "02",
      title: "Kiln Seasoning & Moisture Testing",
      desc: "Raw Grade-A Sagwan Teak or Sheesham is kiln-dried down to below 12% moisture content to prevent seasonal cracking or warping.",
      badge: "Week 1 - 2",
    },
    {
      step: "03",
      title: "Hand-Carved Joinery & Framing",
      desc: "Master woodcrafters construct the frame using time-tested mortise-and-tenon joints, hand-carving ornate details and curves.",
      badge: "Week 2 - 3",
    },
    {
      step: "04",
      title: "7-Stage Hand-Rubbed Polishing",
      desc: "Multi-coat sanding followed by primer, grain filler, stain coat, and Italian polyurethane (PU) sealer for silky finish durability.",
      badge: "Week 3 - 4",
    },
    {
      step: "05",
      title: "White-Glove Delivery & Setup",
      desc: "Carefully blanket-wrapped, transported in padded trucks, and assembled in your home by our senior installation team.",
      badge: "Week 4",
    },
  ];

  const handleOpenModal = (serviceTitle) => {
    if (serviceTitle) {
      setFormData((prev) => ({ ...prev, serviceType: serviceTitle }));
    }
    setSubmittedData(null);
    setModalOpen(true);
  };

  const calculateEstimate = () => {
    let base = 45000;
    if (formData.woodChoice.includes("Teak")) base += 25000;
    if (formData.woodChoice.includes("Rosewood")) base += 35000;
    if (formData.serviceType.includes("Commercial")) base *= 2.5;
    if (formData.serviceType.includes("Restoration")) base = 18000;
    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameCheck = validateName(formData.clientName, "Your Full Name");
    if (!nameCheck.valid) errors.clientName = nameCheck.error;

    const phoneCheck = validatePhone(formData.clientPhone);
    if (!phoneCheck.valid) errors.clientPhone = phoneCheck.error;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSubmitting(true);

    const estimatedCost = calculateEstimate();
    const res = await createServiceInquiry({
      ...formData,
      estimatedCost,
    });

    if (res.success) {
      setSubmittedData({
        inquiryId: res.data.id,
        whatsappUrl: res.whatsappUrl,
        estimatedCost,
      });
    } else {
      alert("Error: " + (res.error || "Failed to submit inquiry"));
    }

    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-12 space-y-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-14 text-amber-50 shadow-2xl space-y-5 text-center max-w-4xl mx-auto relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-amber-900/60 border border-amber-700/80 px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Artisanal Woodcraft Services</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif leading-tight">
          Bespoke Craftsmanship & Custom Interior Woodwork
        </h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          From precise 3D room modeling and custom Sagwan Teak manufacturing to heirloom antique restoration and
          white-glove installation across India.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleOpenModal("Bespoke Custom Furniture Crafting")}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 transform hover:-translate-y-0.5"
          >
            Book Free Design Consultation
          </button>
          <a
            href="https://api.whatsapp.com/send?phone=919730392917&text=Hello%20Aameena%20Furniture,%20I%20would%20like%20to%20speak%20with%20a%20master%20craftsman%20about%20a%20custom%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-100 text-xs font-bold border border-amber-700/70 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Chat with Master Craftsman (+91 97303 92917)</span>
          </a>
        </div>
      </div>



      {/* Services Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">End-to-End Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">What We Build & Deliver</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesList.map((srv, idx) => {
            const IconComponent = srv.icon || Sparkles;
            return (
              <div
                key={srv.id || idx}
                className="bg-white rounded-3xl p-8 border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 space-y-6 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {srv.imageUrl && (
                    <div className="w-full h-52 rounded-2xl overflow-hidden border border-amber-200/80 bg-amber-50 relative shadow-inner">
                      <img
                        src={srv.imageUrl}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-amber-100/80 text-amber-900 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                      {srv.tag || "Bespoke Service"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-serif text-slate-900">{srv.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{srv.description}</p>

                  {Array.isArray(srv.features) && srv.features.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-amber-100">
                      {srv.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenModal(srv.title)}
                  className="w-full py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Request Custom Scope & Estimate</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Stage Craftsmanship Process Timeline */}
      <div className="bg-gradient-to-b from-amber-50/60 to-amber-100/30 rounded-3xl p-8 lg:p-12 border border-amber-200/80 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Our Heritage Method</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            The 5-Stage Artisanal Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every custom piece transitions through our rigorous hand-crafting protocol, monitored directly in our
            workshop portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {TIMELINE_STEPS.map((step, sIdx) => (
            <div
              key={sIdx}
              className="bg-white rounded-2xl p-5 border border-amber-200/60 shadow-sm space-y-3 flex flex-col justify-between relative"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-serif font-black text-amber-800/40">{step.step}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold font-serif text-slate-900">{step.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Consultation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {!submittedData ? (
              <>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    Bespoke Woodworking Inquiry
                  </span>
                  <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                    Book On-Site Consultation & 3D Drafting
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect with our master artisans. Saved instantly to our workshop database.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Mahindra"
                      value={formData.clientName}
                      onChange={(e) => {
                        setFormData({ ...formData, clientName: e.target.value });
                        if (formErrors.clientName) setFormErrors((prev) => ({ ...prev, clientName: null }));
                      }}
                      className={`w-full p-3 rounded-xl bg-amber-50/50 border ${
                        formErrors.clientName ? "border-red-500" : "border-amber-200"
                      } text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700`}
                    />
                    {formErrors.clientName && <p className="text-red-500 text-[10px] mt-1">{formErrors.clientName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">WhatsApp / Phone (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.clientPhone}
                        onChange={(e) => {
                          setFormData({ ...formData, clientPhone: e.target.value });
                          if (formErrors.clientPhone) setFormErrors((prev) => ({ ...prev, clientPhone: null }));
                        }}
                        className={`w-full p-3 rounded-xl bg-amber-50/50 border ${
                          formErrors.clientPhone ? "border-red-500" : "border-amber-200"
                        } text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700`}
                      />
                      {formErrors.clientPhone && <p className="text-red-500 text-[10px] mt-1">{formErrors.clientPhone}</p>}
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="client@domain.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <SearchableSelect
                        label="Selected Service"
                        options={servicesList.map((srv, sIdx) => ({
                          value: srv.title,
                          label: srv.title,
                        }))}
                        value={formData.serviceType}
                        onChange={(val) => setFormData({ ...formData, serviceType: val })}
                        allowOther={true}
                      />
                    </div>

                    <div>
                      <SearchableSelect
                        label="Preferred Wood"
                        options={WOOD_OPTIONS}
                        value={formData.woodChoice}
                        onChange={(val) => setFormData({ ...formData, woodChoice: val })}
                        allowOther={true}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Room Scope / Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. Living room 24x16 ft, 7-seater sectional sofa + center table"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Specific Design Notes</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Velvet fabric preference, dark walnut finish, need delivery by Diwali"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex justify-between items-center">
                    <span>Preliminary Estimated Range:</span>
                    <span className="font-bold text-sm">₹{calculateEstimate().toLocaleString()} - ₹{(calculateEstimate() * 1.35).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all disabled:opacity-50 shadow-md"
                    >
                      {submitting ? "Saving to Database..." : "Confirm & Book Consultation"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">Inquiry Registered!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your custom furniture consultation request has been saved in our workshop database. Our master
                  carpenter will reach out within 2 business hours.
                </p>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-slate-700">
                  <div>
                    <span className="text-slate-500">Inquiry ID:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">{submittedData.inquiryId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Preliminary Estimate:</span>{" "}
                    <span className="font-bold text-slate-900">₹{submittedData.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={submittedData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Prefilled WhatsApp Chat</span>
                  </a>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
