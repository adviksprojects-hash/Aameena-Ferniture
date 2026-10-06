"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  FolderPlus,
  Layers,
  Home,
  Building,
  Castle,
  ShieldCheck,
} from "lucide-react";
import {
  getPricingData,
  savePackageCategory,
  deletePackageCategory,
  updatePricingSettings,
} from "@/actions/pricingActions";
import {
  DEFAULT_PACKAGE_CATEGORIES,
  CORE_CATEGORY_PRESETS,
  TIER_SPECIFICATIONS,
} from "@/lib/pricing/pricingConstants";

export default function PricingManagementView({ userRole = "ADMIN" }) {
  const [categories, setCategories] = useState(DEFAULT_PACKAGE_CATEGORIES);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Master PDF Settings
  const [masterPdfName, setMasterPdfName] = useState("");
  const [masterPdfUrl, setMasterPdfUrl] = useState("");
  const [savingMasterPdf, setSavingMasterPdf] = useState(false);
  const [uploadingMasterFile, setUploadingMasterFile] = useState(false);

  // Category Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("1 BHK Complete Furnishing Package");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [catPdfUrl, setCatPdfUrl] = useState("");
  const [catPdfName, setCatPdfName] = useState("");
  const [catPdfSize, setCatPdfSize] = useState("");
  const [catDescription, setCatDescription] = useState("");

  // 3 Section Pricing inside Modal
  const [budgetPrice, setBudgetPrice] = useState("₹1,15,000");
  const [budgetTimber, setBudgetTimber] = useState("Commercial MR Grade Plywood & Seasoned Core");
  const [budgetInclusions, setBudgetInclusions] = useState("");

  const [simplePrice, setSimplePrice] = useState("₹1,45,000");
  const [simpleTimber, setSimpleTimber] = useState("100% BWP Marine Grade 710 Plywood");
  const [simpleInclusions, setSimpleInclusions] = useState("");

  const [premiumPrice, setPremiumPrice] = useState("₹1,95,000");
  const [premiumTimber, setPremiumTimber] = useState("100% Pure Certified CP Sagwan Teak Wood");
  const [premiumInclusions, setPremiumInclusions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCatPdf, setIsUploadingCatPdf] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPricingData();
      if (res?.success && res?.data) {
        setCategories(res.data.packageCategories || DEFAULT_PACKAGE_CATEGORIES);
        setSettings(res.data.settings || {});
        setMasterPdfName(res.data.settings?.catalogPdfName || "Aameena_Furniture_Master_Catalog.pdf");
        setMasterPdfUrl(res.data.settings?.catalogPdfUrl || "");
      }
    } catch (err) {
      console.error("Error loading pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload PDF via API route (handles up to 25MB without server action limits)
  const uploadPdfFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to upload PDF file");
    }

    return data;
  };

  // Handle Master PDF file selection
  const handleMasterPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFeedback({ type: "error", message: "Only PDF documents (.pdf) are allowed." });
      return;
    }

    setUploadingMasterFile(true);
    try {
      const uploadRes = await uploadPdfFile(file);
      setMasterPdfUrl(uploadRes.url);
      setMasterPdfName(uploadRes.fileName);
      setFeedback({
        type: "success",
        message: `Uploaded "${uploadRes.fileName}" (${uploadRes.fileSize}). Remember to click Save Master PDF Settings.`,
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingMasterFile(false);
    }
  };

  // Save Master PDF Settings
  const handleSaveMasterPdf = async (e) => {
    e.preventDefault();
    setSavingMasterPdf(true);
    try {
      const res = await updatePricingSettings({
        catalogPdfUrl: masterPdfUrl,
        catalogPdfName: masterPdfName,
      });
      if (res.success) {
        setFeedback({ type: "success", message: "Master Catalog PDF settings updated successfully!" });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save settings." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSavingMasterPdf(false);
    }
  };

  // Open Modal to Add or Edit
  const openModalForCategory = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      const isPreset = CORE_CATEGORY_PRESETS.includes(cat.name);
      setSelectedPreset(isPreset ? cat.name : "Other (Enter Custom New Option...)");
      setCustomCategoryName(isPreset ? "" : cat.name);
      setCatPdfUrl(cat.pdfUrl || "");
      setCatPdfName(cat.pdfName || "");
      setCatPdfSize(cat.fileSize || "2.5 MB");
      setCatDescription(cat.description || "");

      const b = cat.models?.budget || {};
      setBudgetPrice(b.price || "₹1,15,000");
      setBudgetTimber(b.timber || TIER_SPECIFICATIONS.budget.timber);
      setBudgetInclusions(Array.isArray(b.inclusions) ? b.inclusions.join("\n") : TIER_SPECIFICATIONS.budget.inclusions.join("\n"));

      const s = cat.models?.simple || {};
      setSimplePrice(s.price || "₹1,45,000");
      setSimpleTimber(s.timber || TIER_SPECIFICATIONS.simple.timber);
      setSimpleInclusions(Array.isArray(s.inclusions) ? s.inclusions.join("\n") : TIER_SPECIFICATIONS.simple.inclusions.join("\n"));

      const p = cat.models?.premium || {};
      setPremiumPrice(p.price || "₹1,95,000");
      setPremiumTimber(p.timber || TIER_SPECIFICATIONS.premium.timber);
      setPremiumInclusions(Array.isArray(p.inclusions) ? p.inclusions.join("\n") : TIER_SPECIFICATIONS.premium.inclusions.join("\n"));
    } else {
      setEditingCategory(null);
      setSelectedPreset("1 BHK Complete Furnishing Package");
      setCustomCategoryName("");
      setCatPdfUrl("");
      setCatPdfName("");
      setCatPdfSize("2.5 MB");
      setCatDescription("");

      setBudgetPrice("₹1,25,000");
      setBudgetTimber(TIER_SPECIFICATIONS.budget.timber);
      setBudgetInclusions(TIER_SPECIFICATIONS.budget.inclusions.join("\n"));

      setSimplePrice("₹1,75,000");
      setSimpleTimber(TIER_SPECIFICATIONS.simple.timber);
      setSimpleInclusions(TIER_SPECIFICATIONS.simple.inclusions.join("\n"));

      setPremiumPrice("₹2,45,000");
      setPremiumTimber(TIER_SPECIFICATIONS.premium.timber);
      setPremiumInclusions(TIER_SPECIFICATIONS.premium.inclusions.join("\n"));
    }
    setIsModalOpen(true);
  };

  // Handle Category PDF upload from device
  const handleCatPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF documents (.pdf) are allowed.");
      return;
    }

    setIsUploadingCatPdf(true);
    try {
      const uploadRes = await uploadPdfFile(file);
      setCatPdfUrl(uploadRes.url);
      setCatPdfName(uploadRes.fileName);
      setCatPdfSize(uploadRes.fileSize);
    } catch (err) {
      alert("PDF Upload Error: " + err.message);
    } finally {
      setIsUploadingCatPdf(false);
    }
  };

  // Save Category Form
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const finalCategoryName =
      selectedPreset === "Other (Enter Custom New Option...)"
        ? customCategoryName.trim()
        : selectedPreset;

    if (!finalCategoryName) {
      alert("Please provide or select a category name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parseInclusions = (str, fallbackList) => {
        const lines = str
          .split("\n")
          .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
          .filter(Boolean);
        return lines.length > 0 ? lines : fallbackList;
      };

      const categoryData = {
        id: editingCategory?.id,
        name: finalCategoryName,
        pdfUrl: catPdfUrl,
        pdfName: catPdfName || `${finalCategoryName.replace(/\s+/g, "_")}_Rate_Card.pdf`,
        fileSize: catPdfSize || "2.5 MB",
        description:
          catDescription || `${finalCategoryName} complete turnkey furniture package.`,
        budgetPrice: budgetPrice.trim(),
        simplePrice: simplePrice.trim(),
        premiumPrice: premiumPrice.trim(),
        models: {
          budget: {
            ...TIER_SPECIFICATIONS.budget,
            price: budgetPrice.trim(),
            numericPrice: parseInt(budgetPrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: budgetTimber.trim(),
            inclusions: parseInclusions(budgetInclusions, TIER_SPECIFICATIONS.budget.inclusions),
          },
          simple: {
            ...TIER_SPECIFICATIONS.simple,
            price: simplePrice.trim(),
            numericPrice: parseInt(simplePrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: simpleTimber.trim(),
            inclusions: parseInclusions(simpleInclusions, TIER_SPECIFICATIONS.simple.inclusions),
          },
          premium: {
            ...TIER_SPECIFICATIONS.premium,
            price: premiumPrice.trim(),
            numericPrice: parseInt(premiumPrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: premiumTimber.trim(),
            inclusions: parseInclusions(premiumInclusions, TIER_SPECIFICATIONS.premium.inclusions),
          },
        },
      };

      const res = await savePackageCategory(categoryData);
      if (res.success) {
        setCategories(res.categories);
        setIsModalOpen(false);
        setFeedback({
          type: "success",
          message: `Package Category "${finalCategoryName}" saved! Prices immediately reflect on the 3 cards on /pricing.`,
        });
      } else {
        alert(res.error || "Failed to save category");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete "${catName}" and its PDF catalog?`)) {
      return;
    }

    try {
      const res = await deletePackageCategory(catId);
      if (res.success) {
        setCategories(res.categories);
        setFeedback({ type: "success", message: `Deleted "${catName}".` });
      } else {
        alert(res.error || "Failed to delete category");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getCategoryIcon = (id, name = "") => {
    const lower = `${id} ${name}`.toLowerCase();
    if (lower.includes("1") || lower.includes("1bhk")) return <Home className="w-4 h-4" />;
    if (lower.includes("2") || lower.includes("2bhk")) return <Building className="w-4 h-4" />;
    if (lower.includes("3") || lower.includes("3bhk")) return <Building className="w-4 h-4" />;
    if (lower.includes("villa") || lower.includes("penthouse") || lower.includes("bungalow"))
      return <Castle className="w-4 h-4" />;
    return <Layers className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>{userRole === "MANAGER" ? "Operations Manager Portal" : "Admin Management"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Turnkey Package Pricing & PDF Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Upload dedicated PDF rate cards and manage the 3 section prices (Budget, Simple, Premium) for 1 BHK, 2 BHK, 3 BHK, Villa, or Custom categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => openModalForCategory(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add / Generate New Category</span>
          </button>

          <Link
            href="/pricing"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Live Pricing Page (3 Cards)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
            feedback.type === "error"
              ? "bg-rose-950/40 text-rose-300 border-rose-900/60"
              : "bg-emerald-950/40 text-emerald-300 border-emerald-900/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Automated 3-Card Price Synchronization:</strong>
          Saving any category below automatically updates the 3 section prices (Budget, Simple, Premium) on the public{" "}
          <strong className="text-amber-300">/pricing</strong> page while preserving consistent, professional universal specifications suitable for all apartments and villas.
        </div>
      </div>

      {/* SECTION 1: TURNKEY PACKAGE CATEGORIES & DEDICATED PDFS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Configured Turnkey Packages & Rate Cards ({categories.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Each package has its own dedicated PDF rate card and 3 section prices.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading pricing packages...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
            No package categories found. Click &quot;Add / Generate New Category&quot; to initialize.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat) => {
              const bPrice = cat.models?.budget?.price || "₹1,15,000";
              const sPrice = cat.models?.simple?.price || "₹1,45,000";
              const pPrice = cat.models?.premium?.price || "₹1,95,000";

              return (
                <div
                  key={cat.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          {getCategoryIcon(cat.id, cat.name)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                          <span className="text-[10px] text-slate-500 block">ID: {cat.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openModalForCategory(cat)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                          title="Edit Pricing & PDF"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        {!["1bhk", "2bhk", "3bhk", "villa"].includes(cat.id) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>

                    {/* The 3 Section Prices Display */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        3 Section Prices (Shown on Live Cards):
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Budget</span>
                          <span className="text-xs font-bold text-amber-400">{bPrice}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Simple</span>
                          <span className="text-xs font-bold text-emerald-400">{sPrice}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Premium</span>
                          <span className="text-xs font-bold text-amber-300">{pPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Respective PDF Status */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-slate-200 block truncate">
                            {cat.pdfName || "No PDF uploaded yet"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {cat.pdfUrl ? `Active (${cat.fileSize || "PDF"})` : "Click Edit to upload specific PDF"}
                          </span>
                        </div>
                      </div>

                      {cat.pdfUrl && (
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={cat.pdfUrl}
                            download={cat.pdfName || "rate_card.pdf"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={cat.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                            title="Open PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => openModalForCategory(cat)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{cat.pdfUrl ? "Replace PDF & Edit 3 Prices" : "Upload PDF & Set 3 Prices"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: MASTER COMPLETE CATALOG PDF */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-white">
              Master All-In-One Catalog PDF
            </h2>
            <p className="text-xs text-slate-400">
              Site-wide general catalog PDF used across public product pages and as fallback.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveMasterPdf} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Display Document Name:
              </label>
              <input
                type="text"
                value={masterPdfName}
                onChange={(e) => setMasterPdfName(e.target.value)}
                placeholder="e.g. Aameena_Furniture_Master_Catalog.pdf"
                className="w-full text-xs rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Upload Master PDF File from Device (Max 25MB):
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingMasterFile ? "Uploading..." : "Choose PDF File"}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleMasterPdfUpload}
                    disabled={uploadingMasterFile}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={masterPdfUrl}
                  onChange={(e) => setMasterPdfUrl(e.target.value)}
                  placeholder="Or paste direct URL..."
                  className="w-full text-xs rounded-xl border border-slate-800 bg-slate-900 p-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {masterPdfUrl ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PDF Link Active: {masterPdfName}</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500">No master PDF linked.</span>
            )}

            <button
              type="submit"
              disabled={savingMasterPdf || uploadingMasterFile}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              {savingMasterPdf ? "Saving..." : "Save Master PDF Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL: ADD / EDIT PACKAGE CATEGORY & RESPECITVE PDF */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {editingCategory ? `Edit Package: ${editingCategory.name}` : "Add / Generate New Package Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Category Selection */}
              <div className="space-y-3">
                <label className="font-bold text-slate-300 block">
                  Select Package Category / Option:
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold cursor-pointer"
                >
                  {CORE_CATEGORY_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>

                {selectedPreset === "Other (Enter Custom New Option...)" && (
                  <div className="pt-1 space-y-1">
                    <label className="text-[11px] text-amber-400 font-bold block">
                      Enter Custom Category Name *:
                    </label>
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="e.g. 4 BHK Penthouse Suite, Luxury Farmhouse Package, Commercial Hotel Suite..."
                      className="w-full rounded-xl border border-amber-500/50 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                )}
              </div>

              {/* PDF Upload Specifically for this Category */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Upload Respective PDF Rate Card for this Category</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Max 25MB • Up to 100 Pages</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingCatPdf ? "Uploading..." : "Upload PDF (From Device)"}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleCatPdfUpload}
                      disabled={isUploadingCatPdf}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={catPdfUrl}
                    onChange={(e) => setCatPdfUrl(e.target.value)}
                    placeholder="Or paste direct PDF URL..."
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {catPdfName && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected / Uploaded: {catPdfName} ({catPdfSize})</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Package Description / Summary:</label>
                <textarea
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  rows={2}
                  placeholder="Overview of this furnishing package..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Configure The 3 Section Prices:
                </h4>
                <p className="text-[11px] text-slate-400 mb-4">
                  These 3 prices will automatically reflect on the 3 corresponding cards on the public page for this category.
                </p>

                {/* 3 SECTIONS: BUDGET, SIMPLE, PREMIUM */}
                <div className="space-y-4">
                  {/* SECTION 1: BUDGET FRIENDLY */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                        Section 1: Budget Friendly Model
                      </span>
                      <span className="text-[10px] text-slate-500">Commercial MR Ply & Laminate</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Package Price (₹):</label>
                        <input
                          type="text"
                          value={budgetPrice}
                          onChange={(e) => setBudgetPrice(e.target.value)}
                          placeholder="e.g. ₹1,15,000"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Material / Timber Grade:</label>
                        <input
                          type="text"
                          value={budgetTimber}
                          onChange={(e) => setBudgetTimber(e.target.value)}
                          placeholder="Commercial MR Grade Plywood"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Included Items (One per line):</label>
                      <textarea
                        value={budgetInclusions}
                        onChange={(e) => setBudgetInclusions(e.target.value)}
                        rows={2}
                        placeholder="Storage Bed&#10;Living Sofa Suite&#10;Wardrobe Unit..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: SIMPLE (STANDARD) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                        Section 2: Simple (Standard) Model
                      </span>
                      <span className="text-[10px] text-slate-500">100% BWP Marine Plywood & Acrylic</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Package Price (₹):</label>
                        <input
                          type="text"
                          value={simplePrice}
                          onChange={(e) => setSimplePrice(e.target.value)}
                          placeholder="e.g. ₹1,45,000"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Material / Timber Grade:</label>
                        <input
                          type="text"
                          value={simpleTimber}
                          onChange={(e) => setSimpleTimber(e.target.value)}
                          placeholder="100% BWP Marine Grade 710 Plywood"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Included Items (One per line):</label>
                      <textarea
                        value={simpleInclusions}
                        onChange={(e) => setSimpleInclusions(e.target.value)}
                        rows={2}
                        placeholder="Hydraulic Bed&#10;5-Seater Sofa Set&#10;Dining Suite&#10;Wardrobe with Mirror..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* SECTION 3: PREMIUM (ROYAL SAGWAN TEAK) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                        Section 3: Premium (Royal Teak) Model
                      </span>
                      <span className="text-[10px] text-slate-500">100% Solid Certified Sagwan Teak</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Package Price (₹):</label>
                        <input
                          type="text"
                          value={premiumPrice}
                          onChange={(e) => setPremiumPrice(e.target.value)}
                          placeholder="e.g. ₹1,95,000"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Material / Timber Grade:</label>
                        <input
                          type="text"
                          value={premiumTimber}
                          onChange={(e) => setPremiumTimber(e.target.value)}
                          placeholder="100% Pure Certified CP Sagwan Teak Wood"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Included Items (One per line):</label>
                      <textarea
                        value={premiumInclusions}
                        onChange={(e) => setPremiumInclusions(e.target.value)}
                        rows={2}
                        placeholder="Imperial Carved King Bed&#10;Royal Teak Sofa Suite&#10;Solid Teak Dining Suite&#10;Lifetime Wood Guarantee..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingCatPdf}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Saving Package..." : "Save Package & Update 3 Cards"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
