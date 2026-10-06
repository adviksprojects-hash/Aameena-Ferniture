"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  Send,
  Users,
  Sparkles,
  RefreshCw,
  MessageSquare,
  X,
  Building2,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { getJobPostings, applyForJob } from "@/actions/careerActions";
import { validatePhone, validateName, validateEmail } from "@/lib/validation";

export default function CareersPage() {
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    experience: "",
    portfolioUrl: "",
    coverNotes: "",
  });

  const loadJobs = async () => {
    setLoading(true);
    const res = await getJobPostings(true); // active only
    if (res.success) {
      setJobs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadJobs();
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplicationResult(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const nameCheck = validateName(formData.fullName, "Full Name");
    if (!nameCheck.valid) errors.fullName = nameCheck.error;

    const phoneCheck = validatePhone(formData.phone);
    if (!phoneCheck.valid) errors.phone = phoneCheck.error;

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) errors.email = emailCheck.error;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSubmitting(true);

    const res = await applyForJob({
      jobId: selectedJob.id,
      ...formData,
    });

    if (res.success) {
      setApplicationResult({
        appId: res.data.id,
        whatsappUrl: res.whatsappUrl,
        jobTitle: selectedJob.title,
      });
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        experience: "",
        portfolioUrl: "",
        coverNotes: "",
      });
    } else {
      alert("Error: " + (res.error || "Failed to submit application."));
    }

    setSubmitting(false);
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 space-y-12" suppressHydrationWarning>
        <div className="min-h-[380px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-amber-950/20 border border-amber-900/30 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-xs text-amber-900/70 font-semibold tracking-wider uppercase">
            Loading Career Opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-900/60 border border-amber-700/80 px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Join Our Artisanal Heritage</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Careers at Aameena Furniture</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          We are seeking master woodcarvers, 3D furniture architects, and luxury showroom consultants passionate about
          preserving timeless Indian woodwork traditions.
        </p>
      </div>

      {/* Open Positions List */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Current Openings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live positions published directly from our workshop recruitment desk.</p>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={loadJobs}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            title="Refresh positions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-slate-600 text-xs font-medium">Fetching active career openings from database...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <Briefcase className="w-8 h-8 mx-auto text-slate-400" />
            <h3 className="text-lg font-bold font-serif text-slate-800">No Open Positions Currently</h3>
            <p className="text-xs text-slate-500">Check back soon or send your resume to careers@aameenafurniture.com</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 lg:p-8 border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                      {job.department}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-800" /> {job.location}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                    <span className="text-amber-900">Experience: {job.experience}</span>
                    {job.salaryRange && (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(job)}
                  className="px-6 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-all shadow-sm hover:shadow-amber-800/20 shrink-0 transform hover:-translate-y-0.5"
                >
                  Apply for Position
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Application Form */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-amber-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {!applicationResult ? (
              <>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    Application Desk
                  </span>
                  <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                    Apply for {selectedJob.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Location: {selectedJob.location} • {selectedJob.department}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Suthar"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: null }));
                      }}
                      className={`w-full p-3 rounded-xl bg-amber-50/50 border ${
                        formErrors.fullName ? "border-red-500" : "border-amber-200"
                      } text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700`}
                    />
                    {formErrors.fullName && <p className="text-red-500 text-[10px] mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Phone / WhatsApp (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: null }));
                        }}
                        className={`w-full p-3 rounded-xl bg-amber-50/50 border ${
                          formErrors.phone ? "border-red-500" : "border-amber-200"
                        } text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700`}
                      />
                      {formErrors.phone && <p className="text-red-500 text-[10px] mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="artisan@domain.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }));
                        }}
                        className={`w-full p-3 rounded-xl bg-amber-50/50 border ${
                          formErrors.email ? "border-red-500" : "border-amber-200"
                        } text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700`}
                      />
                      {formErrors.email && <p className="text-red-500 text-[10px] mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Relevant Woodworking / Design Experience *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Years in Solid Teak Sofas, 3ds Max CAD rendering"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Portfolio or Social Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://behance.net/... or Instagram handle"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Cover Note / Why Aameena Furniture?</label>
                    <textarea
                      rows="2"
                      placeholder="Tell us about your background with Sagwan Teak or luxury furniture sales..."
                      value={formData.coverNotes}
                      onChange={(e) => setFormData({ ...formData, coverNotes: e.target.value })}
                      className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all disabled:opacity-50 shadow-md"
                    >
                      {submitting ? "Submitting Application..." : "Submit Application"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">Application Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your application for <span className="font-bold text-slate-900">{applicationResult.jobTitle}</span> has
                  been recorded in our recruitment system.
                </p>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-slate-700">
                  <div>
                    <span className="text-slate-500">Applicant ID:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">{applicationResult.appId}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={applicationResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Connect with Recruitment Desk on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSelectedJob(null)}
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
