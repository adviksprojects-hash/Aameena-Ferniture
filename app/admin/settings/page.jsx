"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Building2,
  Bell,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sparkles,
  Moon,
  Phone,
  Mail,
  MapPin,
  FileText,
  RotateCcw,
  Smartphone,
  Eye,
} from "lucide-react";
import { getPlatformSettings, updatePlatformSettings } from "@/actions/settingsActions";
import BrandLogo from "@/components/BrandLogo";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance"); // appearance | identity | announcement | features
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [form, setForm] = useState({
    storeName: "Aameena Distributors",
    storeSubtitle: "Sofa Set Furniture & Furnishing Company",
    tagline: "Handcrafted Solid Sagwan Teak Wood Furniture & Luxury Living Solutions",
    supportPhone: "+91 97303 92917",
    whatsappNumber: "+91 97303 92917",
    supportEmail: "sales@aameenadistributors.com",
    showroomAddress: "Main Showroom & Workshop, Near Old Pune Naka, Solapur, Maharashtra - 413005",
    gstin: "27AAAAA0000A1Z5",
    currency: "INR (₹)",
    defaultStorefrontTheme: "light",
    defaultManagerTheme: "emerald",
    enableThemeSwitcher: true,
    enableAnnouncement: true,
    announcementText: "🎉 Festive Teak Collection: Flat 20% Off on Custom Handcrafted Living Sets & Free Delivery in Solapur!",
    announcementColor: "orange",
    enableWhatsAppOrdering: true,
    enableARView: true,
    enableCatalogDownload: true,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getPlatformSettings();
      if (res.success && res.settings) {
        setForm(res.settings);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await updatePlatformSettings(form);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.databaseSaved
          ? "Platform configuration updated and saved to PostgreSQL Database successfully! All portals synchronized."
          : "Platform configuration updated successfully! User and Manager portals synchronized.",
      });

      // Apply default theme to current session if applicable
      if (form.defaultStorefrontTheme) {
        localStorage.setItem("aameena_default_theme", form.defaultStorefrontTheme);
      }
      try {
        localStorage.setItem("aameena_platform_settings", JSON.stringify(form));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("aameena_settings_updated"));
        }
      } catch (storageErr) {}

      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Failed to save configuration to database.",
      });
    }
    setSaving(false);
  };

  const THEMES = [
    {
      id: "light",
      name: "Light Mode (Artisanal Warm Orange)",
      tagline: "Vibrant artisanal orange brand navbar with crisp white body",
      icon: Sun,
      headerBg: "bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white",
      bodyBg: "bg-white text-slate-900 border border-slate-200",
      accent: "text-orange-600 font-bold",
    },
    {
      id: "emerald",
      name: "Emerald Theme (Brand Logo Aligned)",
      tagline: "Glossy lime-mint gradients, royal purple accents & midnight teal",
      icon: Sparkles,
      headerBg: "bg-gradient-to-r from-emerald-950 via-emerald-800 to-purple-950 text-white border-b border-emerald-500/40",
      bodyBg: "bg-[#021c15] text-emerald-100 border border-emerald-700/50",
      accent: "text-emerald-400 font-bold",
    },
    {
      id: "dark",
      name: "Dark Mode (Obsidian Midnight)",
      tagline: "Deep obsidian slate with luminous gold accents and high contrast",
      icon: Moon,
      headerBg: "bg-slate-950 text-white border-b border-slate-800",
      bodyBg: "bg-slate-900 text-slate-100 border border-slate-800",
      accent: "text-amber-400 font-bold",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Page Header */}
      <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Platform Configuration & Themes</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manage global theme defaults for user storefront and manager portals, update showroom brand identity, and customize customer notices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
              : "bg-rose-950/80 text-rose-300 border-rose-800/60"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "appearance"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Themes & Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "identity"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Showroom & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "announcement"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Storefront Announcement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "features"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Feature & Order Toggles</span>
        </button>
      </div>

      {/* Tab 1: Appearance & Themes */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* User Storefront Theme Selection */}
          <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-orange-400" />
                <span>Default Storefront Theme for Users</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the default visual atmosphere presented to customer visitors across the public website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {THEMES.map((th) => {
                const Icon = th.icon;
                const isSelected = form.defaultStorefrontTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleChange("defaultStorefrontTheme", th.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-400/40 shadow-lg"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                          <span className="text-xs font-bold text-white">{th.name}</span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{th.tagline}</p>
                    </div>

                    {/* Miniature Theme Preview Mockup */}
                    <div className="rounded-xl overflow-hidden border border-slate-700/50 text-[10px] shadow-xs">
                      <div className={`p-2 flex items-center justify-between ${th.headerBg}`}>
                        <span className="font-bold">Aameena</span>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-white/40" />
                          <span className="w-2 h-2 rounded-full bg-white/40" />
                        </div>
                      </div>
                      <div className={`p-2.5 ${th.bodyBg}`}>
                        <div className="font-bold">Living Sofa</div>
                        <div className={`text-[9px] mt-0.5 ${th.accent}`}>₹ 68,000</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager Portal Theme Selection */}
          <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Default Theme for Operations Manager Portal</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set the default styling for showroom managers and manufacturing staff dashboards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {THEMES.map((th) => {
                const Icon = th.icon;
                const isSelected = form.defaultManagerTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleChange("defaultManagerTheme", th.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-400/40 shadow-lg"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                          <span className="text-xs font-bold text-white">{th.name}</span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                            Manager Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{th.tagline}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <div className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 max-w-lg">
              <span className="text-xs font-bold text-white">Enable Customer Theme Switcher in Navbar</span>
              <p className="text-xs text-slate-400">
                When enabled, visitors can dynamically choose between Light, Emerald, and Dark modes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableThemeSwitcher}
                onChange={(e) => handleChange("enableThemeSwitcher", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Showroom & Identity */}
      {activeTab === "identity" && (
        <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Showroom Brand & Contact Information</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates store name, official showroom address, GST tax details, and direct contact numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Business Name:</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Store Subtitle:</label>
              <input
                type="text"
                value={form.storeSubtitle}
                onChange={(e) => handleChange("storeSubtitle", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Marketing Tagline:</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Support Phone:</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => handleChange("supportPhone", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">WhatsApp Ordering Hotline:</label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Official Support Email:</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">GSTIN / Tax Registration:</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Main Showroom & Workshop Address:</label>
              <textarea
                rows={2}
                value={form.showroomAddress}
                onChange={(e) => handleChange("showroomAddress", e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Storefront Announcement */}
      {activeTab === "announcement" && (
        <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                <span>Storefront Announcement Banner</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays a prominent promotional or holiday notice banner at the top of the user storefront.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableAnnouncement}
                onChange={(e) => handleChange("enableAnnouncement", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Announcement Message:</label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => handleChange("announcementText", e.target.value)}
                disabled={!form.enableAnnouncement}
                placeholder="e.g. Special Holiday Discounts on Handcrafted Dining Tables"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-emerald-500 outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Banner Accent Color:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "orange", label: "Artisanal Orange", bg: "bg-orange-500 text-white" },
                  { id: "emerald", label: "Emerald Green", bg: "bg-emerald-600 text-white" },
                  { id: "purple", label: "Royal Purple", bg: "bg-purple-600 text-white" },
                  { id: "amber", label: "Honey Amber", bg: "bg-amber-500 text-slate-950" },
                ].map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleChange("announcementColor", color.id)}
                    disabled={!form.enableAnnouncement}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      form.announcementColor === color.id
                        ? "border-white ring-2 ring-emerald-400/50 shadow-md"
                        : "border-slate-800 opacity-70 hover:opacity-100"
                    } ${color.bg}`}
                  >
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Banner Preview */}
            {form.enableAnnouncement && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Live Banner Preview:</span>
                <div
                  className={`p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm ${
                    form.announcementColor === "orange"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                      : form.announcementColor === "emerald"
                      ? "bg-gradient-to-r from-emerald-700 to-teal-700 text-white"
                      : form.announcementColor === "purple"
                      ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white"
                      : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950"
                  }`}
                >
                  <span>{form.announcementText || "No announcement text entered"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Feature & Order Toggles */}
      {activeTab === "features" && (
        <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Operations & Checkout Controls</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle specific features on the storefront and manager order workflows.
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {/* WhatsApp Ordering */}
            <div className="py-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white block">WhatsApp Direct Inquiries & Ordering</span>
                <p className="text-xs text-slate-400">
                  Allows customers to place orders directly into WhatsApp with pre-formatted product specifications.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={form.enableWhatsAppOrdering}
                  onChange={(e) => handleChange("enableWhatsAppOrdering", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* 3D AR View */}
            <div className="py-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white block">3D AR Space Visualization Option</span>
                <p className="text-xs text-slate-400">
                  Enables the interactive 3D and Augmented Reality checkbox on custom furniture inquiries.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={form.enableARView}
                  onChange={(e) => handleChange("enableARView", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* PDF Catalog Download */}
            <div className="py-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-white block">Public PDF Catalog Downloads</span>
                <p className="text-xs text-slate-400">
                  Allows visitors to download complete furniture pricing PDF catalogs from the pricing page.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={form.enableCatalogDownload}
                  onChange={(e) => handleChange("enableCatalogDownload", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="pt-2 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
