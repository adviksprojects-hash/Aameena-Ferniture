"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Ban,
  X,
  Search,
  Filter,
  Users,
  Building2,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  getManagers,
  createManager,
  toggleManagerStatus,
  deleteManager,
} from "@/actions/managerActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateEmail } from "@/lib/validation";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  const [showModal, setShowModal] = useState(false);
  const [newMgr, setNewMgr] = useState({ name: "", email: "", phone: "", branchId: "" });

  const loadData = async () => {
    setLoading(true);
    const res = await getManagers();
    if (res.success) {
      setManagers(res.managers || []);
      setBranches(res.branches || []);
      if (res.branches?.length > 0 && !newMgr.branchId) {
        setNewMgr((prev) => ({ ...prev, branchId: res.branches[0].id }));
      }
    }
    setLoading(false);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const handleAddManager = async (e) => {
    e.preventDefault();
    setPhoneError(null);
    setEmailError(null);

    const phoneCheck = validatePhone(newMgr.phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      return;
    }

    const emailCheck = validateEmail(newMgr.email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.error);
      return;
    }

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
    const nextStatus = mgr.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await toggleManagerStatus(mgr.id, mgr.status);
    if (res.success) {
      setManagers(
        managers.map((m) =>
          m.id === mgr.id ? { ...m, status: nextStatus } : m
        )
      );
      setMessage({
        type: "success",
        text: `Manager "${mgr.user?.name || mgr.phone}" marked as ${nextStatus} (${
          nextStatus === "INACTIVE" ? "Restricted from Manager Portal" : "Portal Access Enabled"
        }).`,
      });
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update manager status." });
    }
  };

  const handleDeleteManager = async (mgr) => {
    const name = mgr.user?.name || mgr.user?.email || "this manager";
    if (!confirm(`Are you sure you want to permanently delete ${name}? Their manager portal access will be revoked immediately.`)) return;

    const res = await deleteManager(mgr.id);
    if (res.success) {
      setMessage({ type: "success", text: `Manager ${name} was permanently removed from database.` });
      setManagers(managers.filter((m) => m.id !== mgr.id));
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete manager." });
    }
  };

  // KPIs
  const totalCount = managers.length;
  const activeCount = managers.filter((m) => m.status === "ACTIVE").length;
  const inactiveCount = managers.filter((m) => m.status !== "ACTIVE").length;
  const uniqueBranchesCount = new Set(managers.map((m) => m.branch?.name || "Main Hub")).size;

  // Filtered list
  const filteredManagers = useMemo(() => {
    return managers.filter((mgr) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && mgr.status !== "ACTIVE") return false;
        if (statusFilter === "INACTIVE" && mgr.status === "ACTIVE") return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (mgr.user?.name || "").toLowerCase();
        const email = (mgr.user?.email || "").toLowerCase();
        const phone = (mgr.phone || "").toLowerCase();
        const branch = (mgr.branch?.name || "").toLowerCase();
        const city = (mgr.branch?.city || "").toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          branch.includes(query) ||
          city.includes(query)
        );
      }

      return true;
    });
  }, [managers, statusFilter, searchQuery]);

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-800/60">
              Staff Administration & Security
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Showroom Manager Management
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Assign showroom leads, delegate manufacturing branch permissions, grant or restrict portal access, and monitor executive staff assignments across Solapur facilities.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadData}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Manager</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Total Staff</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-serif">{totalCount}</div>
          <p className="text-[11px] text-slate-500">Registered manager accounts</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-semibold">Active Leads</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-serif">{activeCount}</div>
          <p className="text-[11px] text-slate-500">Full portal access enabled</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-semibold">Restricted</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-serif">{inactiveCount}</div>
          <p className="text-[11px] text-slate-500">Access temporarily held</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-sky-400">
            <span className="font-semibold">Assigned Hubs</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-serif">{uniqueBranchesCount}</div>
          <p className="text-[11px] text-slate-500">Solapur showrooms covered</p>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800 shadow-md"
              : "bg-red-950/90 text-red-300 border border-red-800 shadow-md"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by manager name, email, phone, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter:
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {["ALL", "ACTIVE", "INACTIVE"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter === "ALL" ? "All Staff" : filter === "ACTIVE" ? "Active" : "Restricted"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Managers Card Grid */}
      {loading && managers.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs font-semibold">Synchronizing managers from database...</p>
        </div>
      ) : filteredManagers.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 p-8 space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-300">
              {searchQuery || statusFilter !== "ALL"
                ? "No managers matched your search criteria."
                : "No showroom managers registered yet."}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search terms or clearing the status filter."
                : "Add showroom managers to grant them operational access to catalog and order tracking."}
            </p>
          </div>
          {(!searchQuery && statusFilter === "ALL") && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Add First Manager
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((mgr) => {
            const displayName = mgr.user?.name || "Manager";
            const email = mgr.user?.email || "No email";
            const branchName = mgr.branch?.name || "Solapur Main Facility";
            const city = mgr.branch?.city || "Solapur";
            const isActive = mgr.status === "ACTIVE";

            return (
              <div
                key={mgr.id}
                className={`bg-slate-950 p-6 rounded-3xl border transition-all duration-300 space-y-5 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between ${
                  isActive
                    ? "border-slate-800/90 hover:border-amber-500/60"
                    : "border-red-950/80 bg-slate-950/90 hover:border-red-800/80"
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header with Avatar & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center font-serif text-lg shadow-inner transition-transform group-hover:scale-105 ${
                          isActive
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {displayName[0]?.toUpperCase() || "M"}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold font-serif text-white group-hover:text-amber-400 transition-colors">
                          {displayName}
                        </h3>
                        <span className="text-xs text-amber-400/90 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{branchName} {city && `(${city})`}</span>
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? "bg-emerald-950/90 text-emerald-400 border-emerald-800"
                          : "bg-red-950/90 text-red-400 border-red-800"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span>{isActive ? "ACTIVE" : "RESTRICTED"}</span>
                    </span>
                  </div>

                  {/* Contact Badges */}
                  <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-900">
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition-colors group/item"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-500/80 group-hover/item:text-amber-400 shrink-0" />
                      <span className="truncate">{email}</span>
                    </a>

                    <a
                      href={mgr.phone ? `tel:${mgr.phone}` : "#"}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition-colors group/item"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-500/80 group-hover/item:text-amber-400 shrink-0" />
                      <span className="truncate font-mono">{mgr.phone || "No phone provided"}</span>
                    </a>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(mgr)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isActive
                        ? "bg-slate-900 hover:bg-red-950/80 text-slate-300 hover:text-red-300 border-slate-800 hover:border-red-800"
                        : "bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border-emerald-800"
                    }`}
                    title={isActive ? "Restrict manager from accessing portal" : "Enable portal access"}
                  >
                    {isActive ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-red-400" />
                        <span>Restrict Access</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Activate Access</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteManager(mgr)}
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/60 hover:border-red-700 transition-colors cursor-pointer"
                    title="Delete manager account permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Manager Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Add Showroom Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign administrative credentials and link them to a Solapur facility.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-4 text-xs">
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
                  onChange={(e) => {
                    setNewMgr({ ...newMgr, email: e.target.value });
                    if (emailError) setEmailError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    emailError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {emailError && <p className="text-[10px] text-red-500 font-semibold mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876500001"
                  value={newMgr.phone}
                  onChange={(e) => {
                    setNewMgr({ ...newMgr, phone: e.target.value });
                    if (phoneError) setPhoneError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    phoneError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {phoneError && <p className="text-[10px] text-red-500 font-semibold mt-1">{phoneError}</p>}
              </div>

              <SearchableSelect
                label="Showroom Branch Hub"
                required
                dark={true}
                options={branches.map((b) => ({ value: b.id, label: `${b.name} (${b.city})` }))}
                value={newMgr.branchId}
                onChange={(val) => setNewMgr({ ...newMgr, branchId: val })}
                allowOther={true}
                otherPlaceholder="Enter custom showroom branch name..."
              />

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Assigning Manager..." : "Assign Manager"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
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
