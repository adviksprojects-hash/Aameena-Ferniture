"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "Aameena Furniture & Furnishing",
    supportEmail: "info@aameenafurniture.com",
    phone: "+91 97303 92917",
    gstin: "07AAAAA0000A1Z5",
    currency: "INR (₹)",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">System Configuration</span>
        <h1 className="text-2xl font-bold font-serif text-white mt-1">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure store profile, tax GSTIN, currency formats, and notification preferences.</p>
      </div>

      <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase">Store Business Name:</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Support Email:</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Support Phone:</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Tax / GSTIN Number:</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Base Currency:</label>
              <input
                type="text"
                value={settings.currency}
                disabled
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>

        {saved && (
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings saved successfully!</span>
          </div>
        )}
      </div>

    </div>
  );
}
