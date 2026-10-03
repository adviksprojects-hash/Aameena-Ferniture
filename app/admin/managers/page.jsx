"use client";

import { useState, useEffect } from "react";
import { UserCheck, Plus, RefreshCw, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { getManagers, createManager, toggleManagerStatus } from "@/actions/managerActions";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newMgr, setNewMgr] = useState({ name: "", email: "", phone: "", branchId: "" });

  const loadData = async () => {
    setLoading(true);
    const res = await getManagers();
    if (res.success) {
      setManagers(res.managers);
      setBranches(res.branches);
      if (res.branches.length > 0 && !newMgr.branchId) {
        setNewMgr((prev) => ({ ...prev, branchId: res.branches[0].id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddManager = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const res = await createManager(newMgr);
    if (res.success) {
      setMessage({ type: "success", text: "Manager assigned to showroom and synchronized with database!" });
      setShowModal(false);
      setNewMgr({ name: "", email: "", phone: "", branchId: branches[0]?.id || "" });
      await loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to assign manager." });
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (mgr) => {
    const res = await toggleManagerStatus(mgr.id, mgr.status);
    if (res.success) {
      setManagers(
        managers.map((m) =>
          m.id === mgr.id ? { ...m, status: m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : m
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Staff Access Control</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Manager Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign store managers to showroom branches and configure portal access rights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Manager</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Managers Grid */}
      {loading && managers.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 p-8 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
          Loading showroom managers from database...
        </div>
      ) : managers.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 p-8 text-slate-500">
          No showroom managers found. Click "Add New Manager" to assign one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managers.map((mgr) => {
            const displayName = mgr.user?.name || "Manager";
            const email = mgr.user?.email || "No email";
            const branchName = mgr.branch?.name || "Unassigned Branch";
            const city = mgr.branch?.city || "";

            return (
              <div key={mgr.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif text-base">
                      {displayName[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-serif text-white">{displayName}</h3>
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {branchName} {city && `(${city})`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(mgr)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                      mgr.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {mgr.status}
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{mgr.phone || "No phone provided"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold font-serif text-white">Add Store Manager</h3>
            <p className="text-xs text-slate-400">Assigns manager credentials and links them to an official showroom branch.</p>

            <form onSubmit={handleAddManager} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={newMgr.name}
                  onChange={(e) => setNewMgr({ ...newMgr, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="suresh@aameenafurniture.com"
                  value={newMgr.email}
                  onChange={(e) => setNewMgr({ ...newMgr, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00001"
                  value={newMgr.phone}
                  onChange={(e) => setNewMgr({ ...newMgr, phone: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Showroom Branch *</label>
                <select
                  value={newMgr.branchId}
                  onChange={(e) => setNewMgr({ ...newMgr, branchId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "Assign Manager"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
