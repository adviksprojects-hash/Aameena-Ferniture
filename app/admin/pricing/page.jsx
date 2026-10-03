"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  FileText,
  Upload,
  Trash2,
  Edit,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getPricingData,
  createPricingPackage,
  updatePricingPackage,
  deletePricingPackage,
  updatePricingSettings,
} from "@/actions/pricingActions";
import { validateName, validateAmount } from "@/lib/validation";

export default function AdminPricingPage() {
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Package Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    subtitle: "",
    price: "",
    description: "",
    featuresText: "",
    popular: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingPkg, setSubmittingPkg] = useState(false);

  // PDF Settings State
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getPricingData();
    if (res.success) {
      setPackages(res.data.packages || []);
      setSettings(res.data.settings || {});
      setPdfName(res.data.settings?.catalogPdfName || "Aameena_Furniture_Rate_Card.pdf");
      setPdfUrl(res.data.settings?.catalogPdfUrl || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingPackage(null);
    setPackageForm({
      name: "",
      subtitle: "",
      price: "",
      description: "",
      featuresText: "",
      popular: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || "",
      subtitle: pkg.subtitle || "",
      price: pkg.price || "",
      description: pkg.description || "",
      featuresText: Array.isArray(pkg.features) ? pkg.features.join("\n") : "",
      popular: Boolean(pkg.popular),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameErr = validateName(packageForm.name, "Package Name");
    if (nameErr) errors.name = nameErr;
    if (!packageForm.price.trim()) errors.price = "Package price is required.";
    if (!packageForm.description.trim()) errors.description = "Package description is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmittingPkg(true);
    const features = packageForm.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    let res;
    if (editingPackage) {
      res = await updatePricingPackage(editingPackage.id, {
        name: packageForm.name,
        subtitle: packageForm.subtitle,
        price: packageForm.price,
        description: packageForm.description,
        features,
        popular: packageForm.popular,
      });
    } else {
      res = await createPricingPackage({
        name: packageForm.name,
        subtitle: packageForm.subtitle,
        price: packageForm.price,
        description: packageForm.description,
        features,
        popular: packageForm.popular,
      });
    }

    if (res.success) {
      setFeedback({
        type: "success",
        text: editingPackage ? "Package updated successfully!" : "New package created successfully!",
      });
      setIsModalOpen(false);
      loadData();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to save package." });
    }
    setSubmittingPkg(false);
  };

  const handleDeletePackage = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await deletePricingPackage(id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted "${name}".` });
      loadData();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to delete package." });
    }
  };

  // Handle PDF file selection from local device
  const handlePdfFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF document (.pdf).");
      return;
    }

    setPdfFileName(file.name);
    if (!pdfName || pdfName === "Aameena_Furniture_Rate_Card.pdf") {
      setPdfName(file.name);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePdfSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const res = await updatePricingSettings({
      catalogPdfUrl: pdfUrl,
      catalogPdfName: pdfName,
    });
    if (res.success) {
      setFeedback({ type: "success", text: "Official PDF catalog and pricing settings saved successfully!" });
      loadData();
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to save settings." });
    }
    setSavingSettings(false);
  };

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-amber-50 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Administration Portal</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Pricing & Catalog Management</h1>
          <p className="text-amber-200/90 text-xs sm:text-sm mt-1">
            Manage packages, add downloadable PDF rate cards, and configure direct factory quotes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Add Pricing Tier
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: PDF CATALOG & RATE CARD MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900">Official PDF Rate Card & Catalog</h2>
            <p className="text-xs text-slate-500">
              Upload or link a PDF price card. Visitors on /pricing can download or inspect it directly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePdfSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">PDF Document Display Name:</label>
              <input
                type="text"
                required
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                placeholder="e.g. Aameena_Furniture_Rate_Card.pdf"
                className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Upload PDF File (From Device) or Enter URL:
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl flex items-center gap-2 shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-amber-900" />
                  <span>Choose PDF</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfFileSelect}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="Paste direct PDF URL or choose file..."
                  className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono truncate"
                />
              </div>
              {pdfFileName && (
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Selected file from device: {pdfFileName}
                </p>
              )}
            </div>
          </div>

          {pdfUrl && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="font-bold">{pdfName || "Rate_Card.pdf"}</span>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                  Ready to Publish
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-900 font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview PDF
                </a>
                <a
                  href={pdfUrl}
                  download={pdfName || "Aameena_Furniture_Rate_Card.pdf"}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {savingSettings ? "Saving Settings..." : "Save PDF & Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: DYNAMIC PRICING PACKAGES */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900">Active Pricing Packages</h2>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-800" />
            <p className="text-xs text-slate-500">Loading pricing packages from database...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <p className="text-slate-600 font-medium">No pricing packages found.</p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold"
            >
              Add First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 relative ${
                  pkg.popular ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md" : "border-amber-200/80"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 right-6 bg-amber-900 text-amber-100 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-serif text-slate-900">{pkg.name}</h3>
                    {pkg.subtitle && <p className="text-xs text-amber-900 font-medium">{pkg.subtitle}</p>}
                  </div>

                  <div className="text-2xl font-extrabold text-slate-900">{pkg.price}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-1.5 pt-2 border-t border-amber-100 text-xs text-slate-700">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-amber-100 text-xs">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Package
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PACKAGE ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 my-8">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                {editingPackage ? "Edit Pricing Package" : "Create New Pricing Tier"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePackageSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Package Name:</label>
                <input
                  type="text"
                  required
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="e.g. Royal Living Suite"
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {formErrors.name && <p className="text-[11px] text-red-600 font-bold">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Subtitle / Tagline:</label>
                  <input
                    type="text"
                    value={packageForm.subtitle}
                    onChange={(e) => setPackageForm({ ...packageForm, subtitle: e.target.value })}
                    placeholder="e.g. 100% Solid Sagwan Teak"
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Price Label:</label>
                  <input
                    type="text"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    placeholder="e.g. ₹2,35,000 or Custom Quote"
                    className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.price && <p className="text-[11px] text-red-600 font-bold">{formErrors.price}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Description:</label>
                <textarea
                  rows={3}
                  required
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Detail what is included in this furnishing package..."
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
                {formErrors.description && (
                  <p className="text-[11px] text-red-600 font-bold">{formErrors.description}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Features List (One item per line):
                </label>
                <textarea
                  rows={4}
                  value={packageForm.featuresText}
                  onChange={(e) => setPackageForm({ ...packageForm, featuresText: e.target.value })}
                  placeholder="100% Grade-A Sagwan Teak Wood&#10;Lifetime Wood Guarantee&#10;Free Assembly & Setup in Solapur"
                  className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={packageForm.popular}
                  onChange={(e) => setPackageForm({ ...packageForm, popular: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-900 focus:ring-amber-500"
                />
                <label htmlFor="popularCheck" className="text-xs font-bold text-slate-800">
                  Mark as "Most Popular" Tier
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPkg}
                  className="px-6 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {submittingPkg ? "Saving..." : editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
