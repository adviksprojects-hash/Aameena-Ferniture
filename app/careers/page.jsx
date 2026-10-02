"use client";

import { useState } from "react";
import { Briefcase, MapPin, CheckCircle2, Send, Users, Sparkles } from "lucide-react";

export default function CareersPage() {
  const [appliedRole, setAppliedRole] = useState(null);

  const jobs = [
    {
      id: "c1",
      title: "Master Hardwood Craftsman / Carpenter",
      location: "Main Workshop Hub",
      type: "Full Time",
      experience: "5+ Years",
      description: "Expert in Sagwan Teak and Sheesham wood carving, jointing, and precision structural framing.",
    },
    {
      id: "c2",
      title: "3D Interior & Furniture Designer",
      location: "Grand Showroom Studio",
      type: "Full Time",
      experience: "2+ Years",
      description: "Proficient in AutoCAD / 3ds Max / SketchUp to create custom room layouts and furniture render designs for clients.",
    },
    {
      id: "c3",
      title: "Showroom Store Manager",
      location: "South Studio Location",
      type: "Full Time",
      experience: "3+ Years",
      description: "Manage client consultations, order dispatches, stock listings, and showroom sales staff.",
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Join Our Artisanal Family</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Careers at Aameena Furniture</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          Be a part of a passionate team shaping luxury homes with handcrafted hardwood furniture and interior design excellence.
        </p>
      </div>

      {/* Open Positions List */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-serif text-slate-900">Current Openings</h2>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-3xl p-6 border border-amber-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-800" /> {job.location}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-serif text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>
                <p className="text-xs text-amber-800 font-bold">Required Experience: {job.experience}</p>
              </div>

              <button
                onClick={() => setAppliedRole(job.title)}
                className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors shrink-0"
              >
                Apply for Position
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Application Form */}
      {appliedRole && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-4 border border-amber-200 shadow-2xl">
            <h3 className="text-xl font-bold font-serif text-slate-900">Apply for {appliedRole}</h3>
            <p className="text-xs text-slate-500">Please submit your contact details below.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Application submitted successfully!"); setAppliedRole(null); }} className="space-y-3">
              <input type="text" required placeholder="Full Name" className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium" />
              <input type="tel" required placeholder="Phone Number" className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium" />
              <input type="email" required placeholder="Email Address" className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium" />
              <textarea placeholder="Brief summary of woodworking / design experience..." rows="3" className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium" />

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-800 text-white font-bold text-xs">Submit Application</button>
                <button type="button" onClick={() => setAppliedRole(null)} className="py-3 px-4 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
