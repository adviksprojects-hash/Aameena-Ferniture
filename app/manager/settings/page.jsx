"use client";

import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { getManagerProfile, updateManagerProfile } from "@/actions/managerActions";

export default function ManagerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    branch: "",
    address: "",
    phone: "",
    email: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getManagerProfile();
      if (res.success && res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error("Failed to load manager profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateManagerProfile(profile);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Facility preferences saved to database successfully!",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save preferences to database.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="bg-stone-900 border border-amber-900/40 p-6 rounded-3xl shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Account Preferences</span>
        <h1 className="text-2xl font-bold font-serif text-white mt-1">Manager Manufacturer Profile</h1>
        <p className="text-xs text-amber-200/80 mt-1">
          Manage manufacturer unit details and operational contact settings connected directly to the database.
        </p>
      </div>

      <div className="bg-stone-900 border border-amber-900/40 p-6 lg:p-8 rounded-3xl shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-amber-300">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Loading facility profile from database...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-amber-200 uppercase">Manager Name:</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                className="w-full p-3 rounded-xl bg-stone-950 border border-amber-900/60 text-white font-medium focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-amber-200 uppercase">Assigned Furniture Manufacturer Unit:</label>
              <input
                type="text"
                value={profile.branch}
                disabled
                className="w-full p-3 rounded-xl bg-stone-950/60 border border-amber-900/30 text-amber-300/70 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-amber-200 uppercase">Facility Physical Address:</label>
              <input
                type="text"
                value={profile.address || ""}
                disabled
                className="w-full p-3 rounded-xl bg-stone-950/60 border border-amber-900/30 text-amber-300/70 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-amber-200 uppercase">Facility Contact Phone:</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
                className="w-full p-3 rounded-xl bg-stone-950 border border-amber-900/60 text-white font-medium focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences to Database</span>
                </>
              )}
            </button>
          </form>
        )}

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2.5 animate-in fade-in duration-200 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                : "bg-rose-950/60 text-rose-300 border-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
