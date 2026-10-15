"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Plus,
  FileText,
  Upload,
  Trash2,
  Edit3,
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
  Check,
  ChevronRight,
  Info,
  Wrench,
  Award,
  Clock,
  Package,
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
  const [activeModalTab, setActiveModalTab] = useState("overview"); // 'overview' | 'budget' | 'simple' | 'premium'

  // Category Info State
  const [selectedPreset, setSelectedPreset] = useState("1 BHK Complete Furnishing Package");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [catTag, setCatTag] = useState("");
  const [catRoomSummary, setCatRoomSummary] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catPdfUrl, setCatPdfUrl] = useState("");
  const [catPdfName, setCatPdfName] = useState("");
  const [catPdfSize, setCatPdfSize] = useState("");

  // Section 1: Budget Friendly
  const [budgetPrice, setBudgetPrice] = useState("₹1,15,000");
  const [budgetBadge, setBudgetBadge] = useState("Smart Value");
  const [budgetSubtitle, setBudgetSubtitle] = useState("Essential Cost-Effective Turnkey Woodworking");
  const [budgetTimber, setBudgetTimber] = useState("Commercial MR Grade Plywood & Termite-Resistant Hardwood Core");
  const [budgetFinish, setBudgetFinish] = useState("1.0mm Anti-Scratch Premium Matte Laminate");
  const [budgetHardware, setBudgetHardware] = useState("Heavy-Duty Smooth Soft-Close Hinges & Telescopic Drawer Sliders");
  const [budgetWarranty, setBudgetWarranty] = useState("5-Year Craftsmanship & Material Warranty");
  const [budgetInclusions, setBudgetInclusions] = useState("");

  // Section 2: Simple Standard
  const [simplePrice, setSimplePrice] = useState("₹1,45,000");
  const [simpleBadge, setSimpleBadge] = useState("Most Popular");
  const [simpleSubtitle, setSimpleSubtitle] = useState("BWP Marine Grade Plywood with Premium Teak Veneer / Acrylic");
  const [simpleTimber, setSimpleTimber] = useState("100% BWP (Boiling Water Proof) Marine Grade 710 Plywood");
  const [simpleFinish, setSimpleFinish] = useState("High-Gloss Acrylic / Natural Teak Veneer with Satin PU Polish");
  const [simpleHardware, setSimpleHardware] = useState("Branded Ebco / Hettich Soft-Close Hinges & Heavy Channels");
  const [simpleWarranty, setSimpleWarranty] = useState("10-Year Comprehensive Anti-Borer & Structural Warranty");
  const [simpleInclusions, setSimpleInclusions] = useState("");

  // Section 3: Premium Royal Teak
  const [premiumPrice, setPremiumPrice] = useState("₹1,95,000");
  const [premiumBadge, setPremiumBadge] = useState("100% Sagwan Teak");
  const [premiumSubtitle, setPremiumSubtitle] = useState("100% Solid Pure CP Sagwan Teakwood Heirloom Craftsmanship");
  const [premiumTimber, setPremiumTimber] = useState("100% Certified Grade-A CP (Central Province) Sagwan Teak Wood");
  const [premiumFinish, setPremiumFinish] = useState("Hand-Rubbed 7-Layer Italian PU / Melamine Grain Polish");
  const [premiumHardware, setPremiumHardware] = useState("Blum / Hafele Concealed German Soft-Close Systems & Brass Accents");
  const [premiumWarranty, setPremiumWarranty] = useState("Lifetime Wood Purity Guarantee + 15-Year Service Support");
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
        message: `Uploaded "${uploadRes.fileName}" (${uploadRes.fileSize}). Click "Save Master PDF Settings" to apply.`,
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingMasterFile(false);
    }
  };

  const handleSaveMasterPdf = async (e) => {
    e.preventDefault();
    setSavingMasterPdf(true);
    try {
      const res = await updatePricingSettings({
        catalogPdfUrl: masterPdfUrl,
        catalogPdfName: masterPdfName,
      });
      if (res.success) {
        setFeedback({ type: "success", message: "Master Catalog PDF settings saved successfully!" });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save settings." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSavingMasterPdf(false);
    }
  };

  const openModalForCategory = (cat = null) => {
    setActiveModalTab("overview");
    if (cat) {
      setEditingCategory(cat);
      const isPreset = CORE_CATEGORY_PRESETS.includes(cat.name);
      setSelectedPreset(isPreset ? cat.name : "Other (Enter Custom New Option...)");
      setCustomCategoryName(isPreset ? "" : cat.name);
      setCatTag(cat.tag || "");
      setCatRoomSummary(cat.roomSummary || "");
      setCatPdfUrl(cat.pdfUrl || "");
      setCatPdfName(cat.pdfName || "");
      setCatPdfSize(cat.fileSize || "2.5 MB");
      setCatDescription(cat.description || "");

      const b = cat.models?.budget || {};
      setBudgetPrice(b.price || "₹1,15,000");
      setBudgetBadge(b.badge || TIER_SPECIFICATIONS.budget.badge);
      setBudgetSubtitle(b.subtitle || TIER_SPECIFICATIONS.budget.subtitle);
      setBudgetTimber(b.timber || TIER_SPECIFICATIONS.budget.timber);
      setBudgetFinish(b.finish || TIER_SPECIFICATIONS.budget.finish);
      setBudgetHardware(b.hardware || TIER_SPECIFICATIONS.budget.hardware);
      setBudgetWarranty(b.warranty || TIER_SPECIFICATIONS.budget.warranty);
      setBudgetInclusions(Array.isArray(b.inclusions) ? b.inclusions.join("\n") : TIER_SPECIFICATIONS.budget.inclusions.join("\n"));

      const s = cat.models?.simple || {};
      setSimplePrice(s.price || "₹1,45,000");
      setSimpleBadge(s.badge || TIER_SPECIFICATIONS.simple.badge);
      setSimpleSubtitle(s.subtitle || TIER_SPECIFICATIONS.simple.subtitle);
      setSimpleTimber(s.timber || TIER_SPECIFICATIONS.simple.timber);
      setSimpleFinish(s.finish || TIER_SPECIFICATIONS.simple.finish);
      setSimpleHardware(s.hardware || TIER_SPECIFICATIONS.simple.hardware);
      setSimpleWarranty(s.warranty || TIER_SPECIFICATIONS.simple.warranty);
      setSimpleInclusions(Array.isArray(s.inclusions) ? s.inclusions.join("\n") : TIER_SPECIFICATIONS.simple.inclusions.join("\n"));

      const p = cat.models?.premium || {};
      setPremiumPrice(p.price || "₹1,95,000");
      setPremiumBadge(p.badge || TIER_SPECIFICATIONS.premium.badge);
      setPremiumSubtitle(p.subtitle || TIER_SPECIFICATIONS.premium.subtitle);
      setPremiumTimber(p.timber || TIER_SPECIFICATIONS.premium.timber);
      setPremiumFinish(p.finish || TIER_SPECIFICATIONS.premium.finish);
      setPremiumHardware(p.hardware || TIER_SPECIFICATIONS.premium.hardware);
      setPremiumWarranty(p.warranty || TIER_SPECIFICATIONS.premium.warranty);
      setPremiumInclusions(Array.isArray(p.inclusions) ? p.inclusions.join("\n") : TIER_SPECIFICATIONS.premium.inclusions.join("\n"));
    } else {
      setEditingCategory(null);
      setSelectedPreset("1 BHK Complete Furnishing Package");
      setCustomCategoryName("");
      setCatTag("Compact Smart Living");
      setCatRoomSummary("1 Bedroom + Living Room + Dining");
      setCatPdfUrl("");
      setCatPdfName("");
      setCatPdfSize("2.5 MB");
      setCatDescription("Complete turnkey furniture package engineered directly at our Solapur manufacturing facility.");

      setBudgetPrice("₹1,25,000");
      setBudgetBadge(TIER_SPECIFICATIONS.budget.badge);
      setBudgetSubtitle(TIER_SPECIFICATIONS.budget.subtitle);
      setBudgetTimber(TIER_SPECIFICATIONS.budget.timber);
      setBudgetFinish(TIER_SPECIFICATIONS.budget.finish);
      setBudgetHardware(TIER_SPECIFICATIONS.budget.hardware);
      setBudgetWarranty(TIER_SPECIFICATIONS.budget.warranty);
      setBudgetInclusions(TIER_SPECIFICATIONS.budget.inclusions.join("\n"));

      setSimplePrice("₹1,75,000");
      setSimpleBadge(TIER_SPECIFICATIONS.simple.badge);
      setSimpleSubtitle(TIER_SPECIFICATIONS.simple.subtitle);
      setSimpleTimber(TIER_SPECIFICATIONS.simple.timber);
      setSimpleFinish(TIER_SPECIFICATIONS.simple.finish);
      setSimpleHardware(TIER_SPECIFICATIONS.simple.hardware);
      setSimpleWarranty(TIER_SPECIFICATIONS.simple.warranty);
      setSimpleInclusions(TIER_SPECIFICATIONS.simple.inclusions.join("\n"));

      setPremiumPrice("₹2,45,000");
      setPremiumBadge(TIER_SPECIFICATIONS.premium.badge);
      setPremiumSubtitle(TIER_SPECIFICATIONS.premium.subtitle);
      setPremiumTimber(TIER_SPECIFICATIONS.premium.timber);
      setPremiumFinish(TIER_SPECIFICATIONS.premium.finish);
      setPremiumHardware(TIER_SPECIFICATIONS.premium.hardware);
      setPremiumWarranty(TIER_SPECIFICATIONS.premium.warranty);
      setPremiumInclusions(TIER_SPECIFICATIONS.premium.inclusions.join("\n"));
    }
    setIsModalOpen(true);
  };

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
        tag: catTag.trim() || "Turnkey Package",
        roomSummary: catRoomSummary.trim() || "",
        pdfUrl: catPdfUrl ? catPdfUrl.trim() : null,
        pdfName: catPdfName ? catPdfName.trim() : `${finalCategoryName.replace(/\s+/g, "_")}_Rate_Card.pdf`,
        fileSize: catPdfSize || "2.5 MB",
        description: catDescription.trim() || `${finalCategoryName} complete turnkey furniture package.`,
        budgetPrice: budgetPrice.trim(),
        simplePrice: simplePrice.trim(),
        premiumPrice: premiumPrice.trim(),
        models: {
          budget: {
            ...TIER_SPECIFICATIONS.budget,
            name: "Budget Friendly",
            badge: budgetBadge.trim() || "Smart Value",
            subtitle: budgetSubtitle.trim() || TIER_SPECIFICATIONS.budget.subtitle,
            price: budgetPrice.trim(),
            numericPrice: parseInt(budgetPrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: budgetTimber.trim(),
            timberShort: budgetTimber.trim(),
            finish: budgetFinish.trim(),
            finishShort: budgetFinish.trim(),
            hardware: budgetHardware.trim(),
            hardwareShort: budgetHardware.trim(),
            warranty: budgetWarranty.trim(),
            warrantyShort: budgetWarranty.trim(),
            inclusions: parseInclusions(budgetInclusions, TIER_SPECIFICATIONS.budget.inclusions),
          },
          simple: {
            ...TIER_SPECIFICATIONS.simple,
            name: "Simple (Standard)",
            badge: simpleBadge.trim() || "Most Popular",
            subtitle: simpleSubtitle.trim() || TIER_SPECIFICATIONS.simple.subtitle,
            price: simplePrice.trim(),
            numericPrice: parseInt(simplePrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: simpleTimber.trim(),
            timberShort: simpleTimber.trim(),
            finish: simpleFinish.trim(),
            finishShort: simpleFinish.trim(),
            hardware: simpleHardware.trim(),
            hardwareShort: simpleHardware.trim(),
            warranty: simpleWarranty.trim(),
            warrantyShort: simpleWarranty.trim(),
            inclusions: parseInclusions(simpleInclusions, TIER_SPECIFICATIONS.simple.inclusions),
          },
          premium: {
            ...TIER_SPECIFICATIONS.premium,
            name: "Premium (Royal Teak)",
            badge: premiumBadge.trim() || "100% Sagwan Teak",
            subtitle: premiumSubtitle.trim() || TIER_SPECIFICATIONS.premium.subtitle,
            price: premiumPrice.trim(),
            numericPrice: parseInt(premiumPrice.replace(/[^0-9]/g, ""), 10) || 0,
            timber: premiumTimber.trim(),
            timberShort: premiumTimber.trim(),
            finish: premiumFinish.trim(),
            finishShort: premiumFinish.trim(),
            hardware: premiumHardware.trim(),
            hardwareShort: premiumHardware.trim(),
            warranty: premiumWarranty.trim(),
            warrantyShort: premiumWarranty.trim(),
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
          message: `Package Category "${finalCategoryName}" updated! All tier rates and specifications immediately reflect on /pricing.`,
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
    if (lower.includes("1") || lower.includes("1bhk")) return <Home className="w-4 h-4 text-amber-500" />;
    if (lower.includes("2") || lower.includes("2bhk")) return <Building className="w-4 h-4 text-emerald-500" />;
    if (lower.includes("3") || lower.includes("3bhk")) return <Building className="w-4 h-4 text-blue-500" />;
    if (lower.includes("villa") || lower.includes("penthouse") || lower.includes("bungalow"))
      return <Castle className="w-4 h-4 text-purple-500" />;
    return <Layers className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
            <DollarSign className="w-4 h-4" />
            <span>{userRole === "MANAGER" ? "Operations Manager Portal" : "Admin Management"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Turnkey Package Pricing & PDF Catalog Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Full granular control: independently edit prices, timber cores, finishes, hardware, warranties, and PDF rate cards for each section.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => openModalForCategory(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package Category</span>
          </button>

          <Link
            href="/pricing"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            <span>Live Pricing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* User Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MASTER PDF CATALOG SECTION */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Master Furniture Catalog (Global Download)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The overarching PDF catalog downloaded when users click the primary &quot;Download Complete Catalog&quot; button.
            </p>
          </div>
          {masterPdfUrl && (
            <a
              href={masterPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview Live Master PDF</span>
            </a>
          )}
        </div>

        <form onSubmit={handleSaveMasterPdf} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Display Document Name:
              </label>
              <input
                type="text"
                value={masterPdfName}
                onChange={(e) => setMasterPdfName(e.target.value)}
                placeholder="e.g. Aameena_Furniture_Master_Catalog.pdf"
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Upload Master PDF File (Max 25MB):
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingMasterFile ? "Uploading..." : "Choose PDF"}</span>
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
                  placeholder="Or paste direct PDF URL..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {masterPdfUrl ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
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

      {/* PACKAGE CATEGORIES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Package Categories ({categories.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each category features its own respective PDF rate card and 3 editable section prices.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            <p className="text-xs">Loading package data from database...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <p className="text-sm font-semibold">No package categories registered.</p>
            <button
              type="button"
              onClick={() => openModalForCategory(null)}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
            >
              Create First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const b = cat.models?.budget || {};
              const s = cat.models?.simple || {};
              const p = cat.models?.premium || {};

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/60 transition-all shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          {getCategoryIcon(cat.id, cat.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            {cat.roomSummary || cat.tag || "Turnkey Package"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openModalForCategory(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Edit All Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-colors cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.description || "No description provided."}
                    </p>

                    {/* Respective PDF Catalog pill */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                          {cat.pdfName || "No specific PDF catalog linked"}
                        </span>
                        {cat.fileSize && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({cat.fileSize})
                          </span>
                        )}
                      </div>
                      {cat.pdfUrl && (
                        <a
                          href={cat.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-1 text-[11px] font-bold ml-2"
                        >
                          <Download className="w-3 h-3" />
                          <span>View PDF</span>
                        </a>
                      )}
                    </div>

                    {/* The 3 Section Prices Overview */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          Budget Model
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {b.price || "₹1,15,000"}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                          Simple Model
                        </span>
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                          {s.price || "₹1,45,000"}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block uppercase">
                          Premium Teak
                        </span>
                        <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                          {p.price || "₹1,95,000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>ID: {cat.id}</span>
                    <button
                      type="button"
                      onClick={() => openModalForCategory(cat)}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Edit All 3 Sections & Specs</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE MODAL: EDIT EVERY PROPERTY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCategory ? `Edit: ${editingCategory.name}` : "Add New Package Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Segmented Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 overflow-x-auto shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setActiveModalTab("overview")}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "overview"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Overview & PDF Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("budget")}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "budget"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>2. Budget Friendly Model</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("simple")}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "simple"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Simple Standard Model</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("premium")}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "premium"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>4. Premium Royal Teak Model</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: OVERVIEW & PDF CATALOG */}
              {activeModalTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Select Package Category / Option:
                    </label>
                    <select
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold cursor-pointer"
                    >
                      {CORE_CATEGORY_PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                    </select>

                    {selectedPreset === "Other (Enter Custom New Option...)" && (
                      <div className="pt-1 space-y-1">
                        <label className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
                          Enter Custom Category Name *:
                        </label>
                        <input
                          type="text"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="e.g. 4 BHK Luxury Penthouse, Studio Apartment Suite, Hotel Wooden Fitout..."
                          className="w-full rounded-xl border border-amber-500 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tagline / Badge (e.g. &quot;Most Popular Choice&quot;):
                      </label>
                      <input
                        type="text"
                        value={catTag}
                        onChange={(e) => setCatTag(e.target.value)}
                        placeholder="e.g. Most Popular Choice, Compact Smart Living..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Room Summary (e.g. &quot;Master Bed + Living + Dining&quot;):
                      </label>
                      <input
                        type="text"
                        value={catRoomSummary}
                        onChange={(e) => setCatRoomSummary(e.target.value)}
                        placeholder="e.g. 1 Bedroom + Living Room + Dining"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* PDF Upload Specifically for this Category */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Respective PDF Rate Card for this Category</span>
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
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">
                          Document File Name:
                        </label>
                        <input
                          type="text"
                          value={catPdfName}
                          onChange={(e) => setCatPdfName(e.target.value)}
                          placeholder="e.g. 1_BHK_Furnishing_Rate_Card.pdf"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">
                          Displayed File Size:
                        </label>
                        <input
                          type="text"
                          value={catPdfSize}
                          onChange={(e) => setCatPdfSize(e.target.value)}
                          placeholder="e.g. 2.5 MB"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white text-[11px]"
                        />
                      </div>
                    </div>

                    {catPdfName && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selected PDF: {catPdfName} ({catPdfSize})</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Package Description / Summary:
                    </label>
                    <textarea
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      rows={3}
                      placeholder="Summary of what is included in this category for users on /pricing..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BUDGET FRIENDLY MODEL */}
              {activeModalTab === "budget" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider block">
                        Section 1: Budget Friendly Model Specifications
                      </span>
                      <span className="text-[11px] text-slate-500">Essential Cost-Effective Turnkey Woodworking</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold">
                      Smart Value Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Package Price (₹) *:</label>
                      <input
                        type="text"
                        value={budgetPrice}
                        onChange={(e) => setBudgetPrice(e.target.value)}
                        placeholder="e.g. ₹1,15,000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Badge Tagline:</label>
                      <input
                        type="text"
                        value={budgetBadge}
                        onChange={(e) => setBudgetBadge(e.target.value)}
                        placeholder="Smart Value"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Subtitle / Tier Headline:</label>
                    <input
                      type="text"
                      value={budgetSubtitle}
                      onChange={(e) => setBudgetSubtitle(e.target.value)}
                      placeholder="Essential Cost-Effective Turnkey Woodworking"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Timber & Core Material:</label>
                      <input
                        type="text"
                        value={budgetTimber}
                        onChange={(e) => setBudgetTimber(e.target.value)}
                        placeholder="Commercial MR Grade Plywood & Termite-Resistant Hardwood Core"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Finish & Polish:</label>
                      <input
                        type="text"
                        value={budgetFinish}
                        onChange={(e) => setBudgetFinish(e.target.value)}
                        placeholder="1.0mm Anti-Scratch Premium Matte Laminate"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Hardware & Fittings:</label>
                      <input
                        type="text"
                        value={budgetHardware}
                        onChange={(e) => setBudgetHardware(e.target.value)}
                        placeholder="Heavy-Duty Smooth Soft-Close Hinges & Telescopic Drawer Sliders"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Warranty Terms:</label>
                      <input
                        type="text"
                        value={budgetWarranty}
                        onChange={(e) => setBudgetWarranty(e.target.value)}
                        placeholder="5-Year Craftsmanship & Material Warranty"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Included Items (One per line):</label>
                    <textarea
                      value={budgetInclusions}
                      onChange={(e) => setBudgetInclusions(e.target.value)}
                      rows={4}
                      placeholder="Custom storage bed&#10;Living room sofa&#10;Full-height modular wardrobes&#10;Center table..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SIMPLE STANDARD MODEL */}
              {activeModalTab === "simple" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider block">
                        Section 2: Simple (Standard) Model Specifications
                      </span>
                      <span className="text-[11px] text-slate-500">100% BWP Marine Grade Plywood & Acrylic</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Most Popular Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Package Price (₹) *:</label>
                      <input
                        type="text"
                        value={simplePrice}
                        onChange={(e) => setSimplePrice(e.target.value)}
                        placeholder="e.g. ₹1,45,000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Badge Tagline:</label>
                      <input
                        type="text"
                        value={simpleBadge}
                        onChange={(e) => setSimpleBadge(e.target.value)}
                        placeholder="Most Popular"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Subtitle / Tier Headline:</label>
                    <input
                      type="text"
                      value={simpleSubtitle}
                      onChange={(e) => setSimpleSubtitle(e.target.value)}
                      placeholder="BWP Marine Grade Plywood with Premium Teak Veneer / Acrylic"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Timber & Core Material:</label>
                      <input
                        type="text"
                        value={simpleTimber}
                        onChange={(e) => setSimpleTimber(e.target.value)}
                        placeholder="100% BWP (Boiling Water Proof) Marine Grade 710 Plywood"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Finish & Polish:</label>
                      <input
                        type="text"
                        value={simpleFinish}
                        onChange={(e) => setSimpleFinish(e.target.value)}
                        placeholder="High-Gloss Acrylic / Natural Teak Veneer with Satin PU Polish"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Hardware & Fittings:</label>
                      <input
                        type="text"
                        value={simpleHardware}
                        onChange={(e) => setSimpleHardware(e.target.value)}
                        placeholder="Branded Ebco / Hettich Soft-Close Hinges & Heavy Channels"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Warranty Terms:</label>
                      <input
                        type="text"
                        value={simpleWarranty}
                        onChange={(e) => setSimpleWarranty(e.target.value)}
                        placeholder="10-Year Comprehensive Anti-Borer & Structural Warranty"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Included Items (One per line):</label>
                    <textarea
                      value={simpleInclusions}
                      onChange={(e) => setSimpleInclusions(e.target.value)}
                      rows={4}
                      placeholder="Hydraulic bed&#10;5-seater sofa suite&#10;Complete dining suite&#10;Multi-door wardrobes..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: PREMIUM ROYAL TEAK MODEL */}
              {activeModalTab === "premium" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm uppercase tracking-wider block">
                        Section 3: Premium (Royal Teak) Model Specifications
                      </span>
                      <span className="text-[11px] text-slate-500">100% Solid Pure Certified CP Sagwan Teak Wood</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      Heirloom Sagwan Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Package Price (₹) *:</label>
                      <input
                        type="text"
                        value={premiumPrice}
                        onChange={(e) => setPremiumPrice(e.target.value)}
                        placeholder="e.g. ₹1,95,000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Badge Tagline:</label>
                      <input
                        type="text"
                        value={premiumBadge}
                        onChange={(e) => setPremiumBadge(e.target.value)}
                        placeholder="100% Sagwan Teak"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Subtitle / Tier Headline:</label>
                    <input
                      type="text"
                      value={premiumSubtitle}
                      onChange={(e) => setPremiumSubtitle(e.target.value)}
                      placeholder="100% Solid Pure CP Sagwan Teakwood Heirloom Craftsmanship"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Timber & Core Material:</label>
                      <input
                        type="text"
                        value={premiumTimber}
                        onChange={(e) => setPremiumTimber(e.target.value)}
                        placeholder="100% Certified Grade-A CP (Central Province) Sagwan Teak Wood"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Finish & Polish:</label>
                      <input
                        type="text"
                        value={premiumFinish}
                        onChange={(e) => setPremiumFinish(e.target.value)}
                        placeholder="Hand-Rubbed 7-Layer Italian PU / Melamine Grain Polish"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Hardware & Fittings:</label>
                      <input
                        type="text"
                        value={premiumHardware}
                        onChange={(e) => setPremiumHardware(e.target.value)}
                        placeholder="Blum / Hafele Concealed German Soft-Close Systems & Brass Accents"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Warranty Terms:</label>
                      <input
                        type="text"
                        value={premiumWarranty}
                        onChange={(e) => setPremiumWarranty(e.target.value)}
                        placeholder="Lifetime Wood Purity Guarantee + 15-Year Service Support"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Included Items (One per line):</label>
                    <textarea
                      value={premiumInclusions}
                      onChange={(e) => setPremiumInclusions(e.target.value)}
                      rows={4}
                      placeholder="Solid Sagwan Teak bed with hydraulic lift&#10;Royal hand-carved Teakwood living sofa&#10;Solid Teak dining suite&#10;Full-height solid Teak wardrobes..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">
                  Tip: Check tabs 1 through 4 to inspect all inputs before saving.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingCatPdf}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Saving Package..." : "Save Package & Apply Rates"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
