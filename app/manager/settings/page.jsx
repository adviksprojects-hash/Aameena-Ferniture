"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";

export default function ManagerSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Suresh Kumar",
    branch: "AMEENA Distributors’s Sofa Set Furniture Company - Solapur",
    phone: "+91 97303 92917",
    notifications: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Account Preferences</span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager Manufacturer Profile</h1>
        <p className="text-xs text-slate-600 mt-1">Manage manufacturer unit details and operational notification alerts.</p>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/70 shadow-sm space-y-4">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Manager Name:</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Assigned Furniture Manufacturer Unit:</label>
            <input
              type="text"
              value={profile.branch}
              disabled
              className="w-full p-3 rounded-xl bg-amber-100/50 border border-amber-200 text-slate-500 font-medium font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Facility Contact Phone:</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>

        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile preferences saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
