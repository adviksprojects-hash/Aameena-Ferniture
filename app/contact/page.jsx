"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateName, validateEmail } from "@/lib/validation";
import { createContactInquiry } from "@/actions/serviceActions";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "Living Room Sofa Sets",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const nameCheck = validateName(formData.name, "Full Name");
    if (!nameCheck.valid) newErrors.name = nameCheck.error;

    const phoneCheck = validatePhone(formData.phone);
    if (!phoneCheck.valid) newErrors.phone = phoneCheck.error;

    if (formData.email.trim()) {
      const emailCheck = validateEmail(formData.email, false);
      if (!emailCheck.valid) newErrors.email = emailCheck.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await createContactInquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        interest: formData.interest,
        message: formData.message,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        alert(res.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
      alert("Error submitting inquiry. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-12 space-y-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Get In Touch</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Contact Aameena Furniture</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          Book a showroom appointment, request a custom furniture quote, or speak directly with our master craftsmen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Information & Map */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-amber-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-900">Showroom Information</h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Sole Official Store & Workshop:</span>
                  <span className="font-semibold text-amber-900 block">AMEENA Distributors’s Sofa Set Furniture Company</span>
                  <span className="text-xs text-slate-600 block mt-0.5">Solapur, Maharashtra 413005 (Coordinates: 17.6578402, 75.9362493)</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Customer Helpline & Sales Hotline:</span>
                  <div className="flex flex-col gap-0.5">
                    <a href="tel:+919730392917" className="text-slate-800 hover:text-amber-900 font-semibold transition-colors">
                      +91 97303 92917 (Helpline & Showroom Desk)
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Email Support:</span>
                  <span>contact@ameenadistributors.com</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Opening Hours:</span>
                  <span>Monday - Sunday: 9:30 AM - 9:30 PM (All 7 Days Open)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100 space-y-2.5">
              <a
                href="https://www.google.com/maps/place/AMEENA+Distributors%E2%80%99s+Sofa+Set+Furniture+Company/@17.6578402,75.9362493,15z/data=!3m1!4b1!4m6!3m5!1s0x3bc5db34c23e5907:0x86af8fec8b37d0ed!8m2!3d17.6578402!4d75.9362493!16s%2Fg%2F11gypsrxj5"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Open in Google Maps (Solapur Store)</span>
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=919730392917&text=Hello%20Ameena%20Distributors,%20I%20want%20to%20inquire%20about%20visiting%20your%20Solapur%20store."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Inquiry (+91 97303 92917)</span>
              </a>
            </div>
          </div>

          {/* Official Solapur Facility Interactive Google Map */}
          <div className="bg-white rounded-3xl p-4 border border-amber-200/80 shadow-sm overflow-hidden space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-800" /> Solapur Manufacturing & Showroom Map
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Live Directions
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-72 bg-slate-100 border border-amber-200 shadow-inner">
              <iframe
                title="AMEENA Distributors Sofa Set Furniture Company Solapur"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15207.349440686961!2d75.92592809504401!3d17.657860428118827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5db34c23e5907%3A0x86af8fec8b37d0ed!2sAMEENA%20Distributors%E2%80%99s%20Sofa%20Set%20Furniture%20Company!5e0!3m2!1sen!2sin!4v1791050521997!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>

        {/* Contact / Consultation Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 lg:p-10 border border-amber-200/80 shadow-md space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Book Custom Furniture Consultation</h2>
              <p className="text-xs text-slate-500 mt-1">Fill out the details below and our furniture team will contact you within 1 hour.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-emerald-950 font-serif">Inquiry Submitted Successfully!</h3>
                <p className="text-xs text-emerald-800">
                  Thank you for reaching out to Aameena Furniture. Our senior manager will call you shortly on your provided phone number.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Your Full Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3.5 rounded-xl bg-amber-50/50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.name ? "border-red-400 focus:ring-red-300" : "border-amber-200 focus:ring-amber-500"
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-red-600 font-bold">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">10-Digit Mobile Number:</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className={`w-full p-3.5 rounded-xl bg-amber-50/50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 font-mono ${
                        errors.phone ? "border-red-400 focus:ring-red-300" : "border-amber-200 focus:ring-amber-500"
                      }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-600 font-bold">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Email Address (Optional):</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full p-3.5 rounded-xl bg-amber-50/50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.email ? "border-red-400 focus:ring-red-300" : "border-amber-200 focus:ring-amber-500"
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-600 font-bold">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <SearchableSelect
                      label="Interested Category"
                      options={[
                        { value: "Living Room Sofa Sets", label: "Living Room Sofa Sets" },
                        { value: "Bedroom Beds & Wardrobes", label: "Bedroom Beds & Wardrobes" },
                        { value: "Dining Table Suites", label: "Dining Table Suites" },
                        { value: "Factory Loose Cloth & Sofa Materials", label: "Factory Loose Cloth & Sofa Upholstery Material" },
                        { value: "Temple & Mandir Carving", label: "Hand-Carved Home Temple (Mandir)" },
                        { value: "Office Desks & Bookshelves", label: "Office Desks & Bookshelves" },
                        { value: "Complete Villa Package", label: "Complete Villa / Turnkey Interior Package" },
                        { value: "Other", label: "Other (Type your custom requirement...)" },
                      ]}
                      value={formData.interest}
                      onChange={(val) => setFormData({ ...formData, interest: val })}
                      allowOther={true}
                      otherPlaceholder="Enter custom category or requirement (e.g. Factory Loose Cloth, Swing, Bar Unit)..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Message / Dimensions / Requirements:</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us your room dimensions or custom furniture requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
