"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "sofa",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      
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
                  <span className="font-bold text-slate-900 block">Flagship Showroom:</span>
                  <span>Aameena Furniture Grand Showroom, Central Furniture Hub, Sector 14</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Phone / Sales Hotline:</span>
                  <span>+91 98765 43210 / +91 98123 45678</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Email Support:</span>
                  <span>info@aameenafurniture.com</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Opening Hours:</span>
                  <span>Monday - Sunday: 10:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant Inquiry on WhatsApp</span>
              </a>
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
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Phone Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Email Address:</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Interested Category:</label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="sofa">Living Room Sofa Sets</option>
                      <option value="bed">Bedroom Beds & Wardrobes</option>
                      <option value="dining">Dining Table Suites</option>
                      <option value="custom">Complete Custom Interior Package</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Message / Requirements:</label>
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
                  className="w-full py-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
