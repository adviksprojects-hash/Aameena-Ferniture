"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Briefcase,
  UserCheck,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  X,
  FileText,
  Clock,
  Archive,
  RotateCcw,
  Calendar,
  Award,
  Sparkles,
  AlertTriangle,
  Edit2,
  UserPlus,
  Search,
  Filter,
  Eye,
  Check,
  Building2,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getJobPostings,
  createJobPosting,
  updateJobPosting,
  toggleJobStatus,
  deleteJobPosting,
  getJobApplications,
  updateApplicationStatus,
  archiveJobApplication,
  restoreJobApplication,
  deleteJobApplication,
  hireCandidateAsEmployee,
} from "@/actions/careerActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateEmail } from "@/lib/validation";

export default function AdminEmployeesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'jobs' | 'applications'
  const [candidateSubTab, setCandidateSubTab] = useState("active"); // 'active' | 'archived'
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Search & Filter state
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDeptFilter, setStaffDeptFilter] = useState("ALL");
  const [candidateSearch, setCandidateSearch] = useState("");

  // Modals state
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation errors
  const [empPhoneError, setEmpPhoneError] = useState(null);
  const [empEmailError, setEmpEmailError] = useState(null);

  // Add Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Carpentry & Joinery",
    roleTitle: "",
  });

  // Edit Employee Form State
  const [editingEmp, setEditingEmp] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "Carpentry & Joinery",
    roleTitle: "",
    status: "ACTIVE",
  });

  // Add Job Form State
  const [newJob, setNewJob] = useState({
    title: "",
    department: "Carpentry & Woodcraft",
    location: "Solapur Facility",
    type: "Full Time",
    experience: "",
    salaryRange: "",
    description: "",
    expiresAt: "",
    maxApplications: "",
    hiredTarget: "",
  });

  // Edit Job Form State
  const [editingJob, setEditingJob] = useState({
    id: "",
    title: "",
    department: "Carpentry & Woodcraft",
    location: "Solapur Facility",
    type: "Full Time",
    experience: "",
    salaryRange: "",
    description: "",
    expiresAt: "",
    maxApplications: "",
    hiredTarget: "",
    isActive: true,
  });

  // Hire Candidate Form State
  const [hiringCandidate, setHiringCandidate] = useState(null);
  const [hireFormData, setHireFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Carpentry & Joinery",
    roleTitle: "",
  });

  const loadAllData = async () => {
    setLoading(true);
    const [empRes, jobRes, appRes] = await Promise.all([
      getEmployees(),
      getJobPostings(false),
      getJobApplications({ includeArchived: true }),
    ]);

    if (empRes.success) setEmployees(empRes.data || []);
    if (jobRes.success) setJobs(jobRes.data || []);
    if (appRes.success) setApplications(appRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadAllData();
  }, []);

  // ==========================================
  // EMPLOYEE (ACTIVE STAFF) CRUD
  // ==========================================
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmpPhoneError(null);
    setEmpEmailError(null);

    const emailCheck = validateEmail(newEmp.email);
    if (!emailCheck.valid) {
      setEmpEmailError(emailCheck.error);
      return;
    }

    if (newEmp.phone && newEmp.phone.trim()) {
      const phoneCheck = validatePhone(newEmp.phone);
      if (!phoneCheck.valid) {
        setEmpPhoneError(phoneCheck.error);
        return;
      }
    }

    setSubmitting(true);
    const res = await createEmployee(newEmp);
    if (res.success) {
      setMessage({ type: "success", text: `Staff member "${newEmp.name}" added to workforce directory!` });
      setShowEmpModal(false);
      setNewEmp({ name: "", email: "", phone: "", department: "Carpentry & Joinery", roleTitle: "" });
      await loadAllData();
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add employee." });
    }
    setSubmitting(false);
  };

  const handleOpenEditEmp = (emp) => {
    setEmpPhoneError(null);
    setEmpEmailError(null);
    setEditingEmp({
      id: emp.id,
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "Carpentry & Joinery",
      roleTitle: emp.roleTitle || "",
      status: emp.status || "ACTIVE",
    });
    setShowEditEmpModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setEmpPhoneError(null);
    setEmpEmailError(null);

    const emailCheck = validateEmail(editingEmp.email);
    if (!emailCheck.valid) {
      setEmpEmailError(emailCheck.error);
      return;
    }

    if (editingEmp.phone && editingEmp.phone.trim()) {
      const phoneCheck = validatePhone(editingEmp.phone);
      if (!phoneCheck.valid) {
        setEmpPhoneError(phoneCheck.error);
        return;
      }
    }

    setSubmitting(true);
    const res = await updateEmployee(editingEmp.id, editingEmp);
    if (res.success) {
      setMessage({ type: "success", text: `Staff record for "${editingEmp.name}" updated successfully!` });
      setShowEditEmpModal(false);
      await loadAllData();
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update employee." });
    }
    setSubmitting(false);
  };

  const handleDeleteEmployee = async (empId, name) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from the active workforce directory?`)) return;
    const res = await deleteEmployee(empId);
    if (res.success) {
      setMessage({ type: "success", text: `Staff member "${name}" was removed from the workforce.` });
      setEmployees(employees.filter((emp) => emp.id !== empId));
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete employee." });
    }
  };

  // ==========================================
  // JOB OPENINGS CRUD
  // ==========================================
  const handleAddJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createJobPosting(newJob);
    if (res.success) {
      setMessage({ type: "success", text: "Job position published to Careers portal with deadline & capacity controls!" });
      setShowJobModal(false);
      setNewJob({
        title: "",
        department: "Carpentry & Woodcraft",
        location: "Solapur Facility",
        type: "Full Time",
        experience: "",
        salaryRange: "",
        description: "",
        expiresAt: "",
        maxApplications: "",
        hiredTarget: "",
      });
      await loadAllData();
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create job opening." });
    }
    setSubmitting(false);
  };

  const handleOpenEditJob = (job) => {
    setEditingJob({
      id: job.id,
      title: job.title || "",
      department: job.department || "Carpentry & Woodcraft",
      location: job.location || "Solapur Facility",
      type: job.type || "Full Time",
      experience: job.experience || "",
      salaryRange: job.salaryRange || "",
      description: job.description || "",
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split("T")[0] : "",
      maxApplications: job.maxApplications || "",
      hiredTarget: job.hiredTarget || 1,
      isActive: job.isActive !== false,
    });
    setShowEditJobModal(true);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await updateJobPosting(editingJob.id, editingJob);
    if (res.success) {
      setMessage({ type: "success", text: `Job opening "${editingJob.title}" updated and synced with /careers!` });
      setShowEditJobModal(false);
      await loadAllData();
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update job opening." });
    }
    setSubmitting(false);
  };

  const handleToggleJob = async (jobId, currentStatus) => {
    const res = await toggleJobStatus(jobId, currentStatus);
    if (res.success) {
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, isActive: !currentStatus } : j)));
      setMessage({
        type: "success",
        text: `Position status updated: ${!currentStatus ? "Published on /careers" : "Hidden from /careers"}.`,
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!confirm(`Permanently delete "${title}" job opening? All candidate applications for this position will also be removed.`)) return;
    const res = await deleteJobPosting(jobId);
    if (res.success) {
      setMessage({ type: "success", text: `Position "${title}" was permanently removed.` });
      setJobs(jobs.filter((j) => j.id !== jobId));
      setTimeout(() => setMessage(null), 3500);
    }
  };

  // ==========================================
  // CANDIDATE PIPELINE & HIRING
  // ==========================================
  const handleAppStatus = async (appId, status) => {
    const res = await updateApplicationStatus(appId, status);
    if (res.success) {
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      setMessage({
        type: "success",
        text: `Candidate status updated to "${status.replace("_", " ")}" ${
          status === "SELECTED" ? "• Ready to onboard as staff" : ""
        }`,
      });
      loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  const handleOpenHireCandidate = (app) => {
    setHiringCandidate(app);
    setHireFormData({
      name: app.fullName || "",
      email: app.email || "",
      phone: app.phone || "",
      department: app.job?.department || "Carpentry & Joinery",
      roleTitle: app.job?.title || "Craftsman",
    });
    setShowHireModal(true);
  };

  const handleConfirmHireCandidate = async (e) => {
    e.preventDefault();
    if (!hiringCandidate) return;

    setSubmitting(true);
    const res = await hireCandidateAsEmployee(hiringCandidate.id, hireFormData);
    if (res.success) {
      setMessage({
        type: "success",
        text: `Candidate "${hireFormData.name}" hired successfully and added to Active Staff!`,
      });
      setShowHireModal(false);
      setHiringCandidate(null);
      await loadAllData();
      setActiveTab("employees"); // Switch to Active Staff tab to view newly hired member
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to hire candidate." });
    }
    setSubmitting(false);
  };

  const handleArchiveCandidate = async (appId, name) => {
    const res = await archiveJobApplication(appId);
    if (res.success) {
      setMessage({ type: "success", text: `Candidate "${name}" moved to rejected archive.` });
      loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to archive candidate." });
    }
  };

  const handleRestoreCandidate = async (appId, name) => {
    const res = await restoreJobApplication(appId);
    if (res.success) {
      setMessage({ type: "success", text: `Candidate "${name}" restored to active applications.` });
      loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to restore candidate." });
    }
  };

  const handleDeleteCandidate = async (appId, name) => {
    if (!confirm(`Permanently delete application record for ${name}?`)) return;
    const res = await deleteJobApplication(appId);
    if (res.success) {
      setMessage({ type: "success", text: `Application for ${name} removed.` });
      setApplications(applications.filter((a) => a.id !== appId));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Filtered staff list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (staffDeptFilter !== "ALL" && emp.department !== staffDeptFilter) return false;
      if (staffSearch.trim()) {
        const q = staffSearch.toLowerCase();
        return (
          emp.name?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.phone?.toLowerCase().includes(q) ||
          emp.roleTitle?.toLowerCase().includes(q) ||
          emp.department?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, staffSearch, staffDeptFilter]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  }, [employees]);

  // Filtered applications by subtab and search
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => (candidateSubTab === "archived" ? app.isArchived === true : !app.isArchived))
      .filter((app) => {
        if (!candidateSearch.trim()) return true;
        const q = candidateSearch.toLowerCase();
        return (
          app.fullName?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.toLowerCase().includes(q) ||
          app.job?.title?.toLowerCase().includes(q)
        );
      });
  }, [applications, candidateSubTab, candidateSearch]);

  if (!mounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-slate-950 border border-slate-800 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Initializing Workforce & Careers Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-800/60">
              Admin Exclusive Access • Full CRUD Controls
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Workforce, Recruitment & Careers Desk
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manage your master craftsmen, post or edit career openings anytime, evaluate candidates across 3 workflow stages, and onboard selected applicants directly with full administrative authorization.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            suppressHydrationWarning
            onClick={loadAllData}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {activeTab === "employees" ? (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowEmpModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          ) : activeTab === "jobs" ? (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowJobModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opening</span>
            </button>
          ) : null}
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
            type="button"
            suppressHydrationWarning
            onClick={() => setMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("employees")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "employees"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Staff ({employees.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("jobs")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "jobs"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Openings ({jobs.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("applications")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "applications"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Candidate Pipeline ({applications.length})</span>
        </button>
      </div>

      {/* Horizontal Swipe Indicator for small laptop screens & mobile */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-amber-500/80 inline" />
          <span>Tip: Two-finger trackpad swipe (or mobile touch swipe) scrolls data tables smoothly left-to-right.</span>
        </span>
        <span className="text-amber-500/80 font-mono text-[10px]">ADMIN EDIT MODE</span>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACTIVE STAFF (FULL CRUD: ADD, EDIT, DELETE, STATUS)     */}
      {/* ============================================================== */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search staff by name, email, phone, or role..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Dept:
              </span>
              <select
                value={staffDeptFilter}
                suppressHydrationWarning
                onChange={(e) => setStaffDeptFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horizontal Scrollable Table for Staff Directory */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
              <table className="w-full text-left text-xs text-slate-300 min-w-[860px]">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Staff Member</th>
                    <th className="p-4">Designation / Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-500">
                        {staffSearch || staffDeptFilter !== "ALL"
                          ? "No staff members matched your filter criteria."
                          : "No active staff members registered in directory. Click 'Add Staff Member' above."}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center font-serif text-base shrink-0 shadow-inner">
                              {emp.name?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                                {emp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                ID: #{emp.id?.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                            {emp.roleTitle}
                          </span>
                        </td>

                        <td className="p-4 text-slate-300 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{emp.department}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-400">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3 h-3 text-amber-500/70" />
                              <span className="truncate max-w-[200px]">{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                                <Phone className="w-3 h-3 text-amber-500/70" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                              emp.status === "ACTIVE"
                                ? "bg-emerald-950/90 text-emerald-400 border-emerald-800"
                                : emp.status === "ON_LEAVE"
                                ? "bg-amber-950/90 text-amber-400 border-amber-800"
                                : "bg-red-950/90 text-red-400 border-red-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                emp.status === "ACTIVE"
                                  ? "bg-emerald-400"
                                  : emp.status === "ON_LEAVE"
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                            />
                            <span>{emp.status || "ACTIVE"}</span>
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditEmp(emp)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                              title="Edit staff details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/60 hover:border-red-700 transition-colors cursor-pointer"
                              title="Delete employee permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: JOB OPENINGS (FULL CRUD: POST, EDIT, HIDE/UNHIDE, DELETE)*/}
      {/* ============================================================== */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-slate-500 bg-slate-950 rounded-3xl border border-slate-800">
                No job openings created yet. Click "Post New Opening" to publish one to /careers.
              </div>
            ) : (
              jobs.map((job) => {
                const now = new Date();
                const isExpired = job.expiresAt && new Date(job.expiresAt) < now;
                const isCapacityMet = job.maxApplications && job.applications?.length >= job.maxApplications;
                const isTargetHired = job.hiredTarget && (job.hiredCount || 0) >= job.hiredTarget;
                const shouldAutoClose = isExpired || isCapacityMet || isTargetHired;

                return (
                  <div
                    key={job.id}
                    className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-800">
                          {job.department}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleJob(job.id, job.isActive)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                              job.isActive && !shouldAutoClose
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            }`}
                            title={job.isActive ? "Click to hide from /careers" : "Click to publish on /careers"}
                          >
                            {job.isActive && !shouldAutoClose ? "✓ Active on /careers" : "✕ Hidden / Inactive"}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold font-serif text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

                      {/* Expiry & Limits Banner */}
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-[11px]">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Application Deadline:</span>
                          </span>
                          <span className={`font-semibold ${isExpired ? "text-red-400 font-bold" : "text-slate-200"}`}>
                            {job.expiresAt
                              ? new Date(job.expiresAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "No Deadline Set"}
                            {isExpired && " (Expired)"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>Capacity / Applied:</span>
                          </span>
                          <span className={`font-semibold ${isCapacityMet ? "text-amber-400" : "text-slate-200"}`}>
                            {job.applications?.length || 0} / {job.maxApplications || "Unlimited"}
                            {isCapacityMet && " (Full)"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hired Target:</span>
                          </span>
                          <span className={`font-semibold ${isTargetHired ? "text-emerald-400 font-bold" : "text-slate-200"}`}>
                            {job.hiredCount || 0} / {job.hiredTarget || 1} Hired
                            {isTargetHired && " (Target Filled)"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-500 block">Location:</span>
                          <span className="font-semibold">{job.location}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Experience:</span>
                          <span className="font-semibold">{job.experience || "Any"}</span>
                        </div>
                        {job.salaryRange && (
                          <div className="col-span-2">
                            <span className="text-slate-500 block">Salary / Package:</span>
                            <span className="font-semibold text-amber-400">{job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Position</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-2 bg-red-950/60 hover:bg-red-900 rounded-xl text-red-400 transition-colors cursor-pointer"
                        title="Delete Position Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CANDIDATE PIPELINE (3 STAGES + 1-CLICK HIRE AS STAFF)   */}
      {/* ============================================================== */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setCandidateSubTab("active")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  candidateSubTab === "active"
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Active Applicants ({applications.filter((a) => !a.isArchived).length})
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setCandidateSubTab("archived")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  candidateSubTab === "archived"
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Archive className="w-3.5 h-3.5 inline mr-1" />
                Archived Rejected ({applications.filter((a) => a.isArchived).length})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search candidate by name, phone, role..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Horizontal Scrollable Candidates Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
              <table className="w-full text-left text-xs text-slate-300 min-w-[950px]">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Candidate</th>
                    <th className="p-4">Position Applied</th>
                    <th className="p-4">Experience & Portfolio</th>
                    <th className="p-4">Applicant Note</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">Evaluation Stage</th>
                    <th className="p-4 pr-6 text-right">Hire / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-slate-500">
                        {candidateSubTab === "archived"
                          ? "No archived candidate applications."
                          : "No candidate applications currently match your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-white">
                          <div className="font-serif text-sm">{app.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{app.email}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{app.phone}</div>
                        </td>

                        <td className="p-4">
                          <span className="text-amber-400 font-semibold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                            {app.job?.title || "General Application"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-300">
                          <div>{app.experience || "Not specified"}</div>
                          {app.portfolioUrl && (
                            <a
                              href={app.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-sky-400 hover:underline block mt-0.5"
                            >
                              View Portfolio ↗
                            </a>
                          )}
                        </td>

                        <td className="p-4 text-slate-400 max-w-xs truncate" title={app.coverNotes}>
                          {app.coverNotes || "None provided"}
                        </td>

                        <td className="p-4">
                          <a
                            href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${app.fullName}, this is Aameena Furniture recruitment desk regarding your application for "${app.job?.title}". We would like to schedule a discussion.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>

                        <td className="p-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleAppStatus(app.id, e.target.value)}
                            className={`rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none cursor-pointer ${
                              app.status === "SELECTED"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : app.status === "REJECTED"
                                ? "bg-red-950 text-red-400 border-red-800"
                                : "bg-blue-950 text-blue-400 border-blue-800"
                            }`}
                          >
                            <option value="ON_PROCESS">⏳ In Process (Evaluation)</option>
                            <option value="SELECTED">✅ Selected (Hire Ready)</option>
                            <option value="REJECTED">❌ Rejected</option>
                          </select>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* 1-Click Hire as Employee Button */}
                            {!app.isArchived && (
                              <button
                                onClick={() => handleOpenHireCandidate(app)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer"
                                title="Hire candidate and onboard directly into Active Staff"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Hire Staff</span>
                              </button>
                            )}

                            {app.isArchived ? (
                              <button
                                onClick={() => handleRestoreCandidate(app.id, app.fullName)}
                                className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors cursor-pointer"
                                title="Restore candidate to active pool"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : app.status === "REJECTED" ? (
                              <button
                                onClick={() => handleArchiveCandidate(app.id, app.fullName)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                                title="Archive rejected candidate"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleDeleteCandidate(app.id, app.fullName)}
                              className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 transition-colors cursor-pointer"
                              title="Delete application record permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD STAFF MEMBER                                      */}
      {/* ============================================================== */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">Add Staff Member</h3>
              <button
                onClick={() => setShowEmpModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Suthar"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rameshwar@aameenafurniture.com"
                  value={newEmp.email}
                  onChange={(e) => {
                    setNewEmp({ ...newEmp, email: e.target.value });
                    if (empEmailError) setEmpEmailError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white ${
                    empEmailError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {empEmailError && <p className="text-[10px] text-red-500 font-semibold mt-1">{empEmailError}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number (10 digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newEmp.phone}
                  onChange={(e) => {
                    setNewEmp({ ...newEmp, phone: e.target.value });
                    if (empPhoneError) setEmpPhoneError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white ${
                    empPhoneError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {empPhoneError && <p className="text-[10px] text-red-500 font-semibold mt-1">{empPhoneError}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Wood Carver & Joinery Lead"
                  value={newEmp.roleTitle}
                  onChange={(e) => setNewEmp({ ...newEmp, roleTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <SearchableSelect
                label="Department"
                dark={true}
                options={[
                  "Carpentry & Joinery",
                  "PU & Teak Polishing",
                  "Upholstery & Fabrics",
                  "Quality Inspection & Dispatch",
                  "Showroom Sales & Design",
                  "Workshop Logistics & Timber Procurement",
                ]}
                value={newEmp.department}
                onChange={(val) => setNewEmp({ ...newEmp, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Adding Staff..." : "Add to Workforce"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT STAFF MEMBER                                     */}
      {/* ============================================================== */}
      {showEditEmpModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">Edit Staff Details</h3>
              <button
                onClick={() => setShowEditEmpModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingEmp.name}
                  onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingEmp.email}
                  onChange={(e) => {
                    setEditingEmp({ ...editingEmp, email: e.target.value });
                    if (empEmailError) setEmpEmailError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white ${
                    empEmailError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {empEmailError && <p className="text-[10px] text-red-500 font-semibold mt-1">{empEmailError}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editingEmp.phone}
                  onChange={(e) => {
                    setEditingEmp({ ...editingEmp, phone: e.target.value });
                    if (empPhoneError) setEmpPhoneError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-white ${
                    empPhoneError ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {empPhoneError && <p className="text-[10px] text-red-500 font-semibold mt-1">{empPhoneError}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={editingEmp.roleTitle}
                  onChange={(e) => setEditingEmp({ ...editingEmp, roleTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <SearchableSelect
                label="Department"
                dark={true}
                options={[
                  "Carpentry & Joinery",
                  "PU & Teak Polishing",
                  "Upholstery & Fabrics",
                  "Quality Inspection & Dispatch",
                  "Showroom Sales & Design",
                  "Workshop Logistics & Timber Procurement",
                ]}
                value={editingEmp.department}
                onChange={(val) => setEditingEmp({ ...editingEmp, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div>
                <label className="text-slate-300 font-bold block mb-1">Staff Employment Status</label>
                <select
                  value={editingEmp.status}
                  onChange={(e) => setEditingEmp({ ...editingEmp, status: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ACTIVE">ACTIVE (On Duty)</option>
                  <option value="ON_LEAVE">ON_LEAVE (Temporary Leave)</option>
                  <option value="INACTIVE">INACTIVE (Resigned / Relieved)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditEmpModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: POST NEW JOB OPENING                                  */}
      {/* ============================================================== */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Post New Job Opening</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Will be published on /careers public portal.</p>
              </div>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Teak Wood Carver"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <SearchableSelect
                label="Department"
                dark={true}
                options={[
                  "Carpentry & Woodcraft",
                  "Finishing & Polishing",
                  "Design & 3D Drafting",
                  "Showroom & Client Sales",
                  "Logistics & Assembly",
                ]}
                value={newJob.department}
                onChange={(val) => setNewJob({ ...newJob, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div>
                <label className="text-slate-300 font-bold block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Solapur Facility"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Automatic closure rules */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-400 block">
                  Application Deadline & Capacity Controls:
                </span>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Display Deadline / Expiry Date (Web Expiry):
                  </label>
                  <input
                    type="date"
                    value={newJob.expiresAt}
                    onChange={(e) => setNewJob({ ...newJob, expiresAt: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Max Applications:</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newJob.maxApplications}
                      onChange={(e) => setNewJob({ ...newJob, maxApplications: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Required Hires:</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={newJob.hiredTarget}
                      onChange={(e) => setNewJob({ ...newJob, hiredTarget: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 3+ Years"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monthly Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹40,000 - ₹60,000"
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Overview *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Responsibilities, timber craftsmanship requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Publishing..." : "Publish Job Opening"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: EDIT JOB OPENING (UPDATE ANYTIME)                     */}
      {/* ============================================================== */}
      {showEditJobModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Edit Job Position</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Update specifications, deadline, and capacity controls anytime.</p>
              </div>
              <button
                onClick={() => setShowEditJobModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <SearchableSelect
                label="Department"
                dark={true}
                options={[
                  "Carpentry & Woodcraft",
                  "Finishing & Polishing",
                  "Design & 3D Drafting",
                  "Showroom & Client Sales",
                  "Logistics & Assembly",
                ]}
                value={editingJob.department}
                onChange={(val) => setEditingJob({ ...editingJob, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div>
                <label className="text-slate-300 font-bold block mb-1">Location</label>
                <input
                  type="text"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Automatic closure rules */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-400 block">
                  Application Deadline & Capacity Controls:
                </span>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Display Deadline / Expiry Date:
                  </label>
                  <input
                    type="date"
                    value={editingJob.expiresAt}
                    onChange={(e) => setEditingJob({ ...editingJob, expiresAt: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Max Applications:</label>
                    <input
                      type="number"
                      value={editingJob.maxApplications}
                      onChange={(e) => setEditingJob({ ...editingJob, maxApplications: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Required Hires:</label>
                    <input
                      type="number"
                      value={editingJob.hiredTarget}
                      onChange={(e) => setEditingJob({ ...editingJob, hiredTarget: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Experience</label>
                  <input
                    type="text"
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monthly Salary</label>
                  <input
                    type="text"
                    value={editingJob.salaryRange}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Overview *</label>
                <textarea
                  rows="3"
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="jobIsActiveCheck"
                  checked={editingJob.isActive}
                  onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <label htmlFor="jobIsActiveCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Accept applications on /careers portal
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Updating..." : "Save Job Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditJobModal(false)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: HIRE CANDIDATE DIRECTLY INTO WORKFORCE                */}
      {/* ============================================================== */}
      {showHireModal && hiringCandidate && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Hire Candidate as Staff</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Confirm appointment details to onboard candidate into Active Staff.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHireModal(false);
                  setHiringCandidate(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/80 text-xs text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Onboarding from Candidate Pipeline</span>
              </span>
              <p className="text-[11px] text-emerald-300/80">
                This action will mark the application as <span className="font-bold">SELECTED</span> and create an active staff profile in the employee directory.
              </p>
            </div>

            <form onSubmit={handleConfirmHireCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={hireFormData.name}
                  onChange={(e) => setHireFormData({ ...hireFormData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Workforce Email *</label>
                <input
                  type="email"
                  required
                  value={hireFormData.email}
                  onChange={(e) => setHireFormData({ ...hireFormData, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={hireFormData.phone}
                  onChange={(e) => setHireFormData({ ...hireFormData, phone: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Official Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Wood Carver"
                  value={hireFormData.roleTitle}
                  onChange={(e) => setHireFormData({ ...hireFormData, roleTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <SearchableSelect
                label="Assigned Department"
                dark={true}
                options={[
                  "Carpentry & Joinery",
                  "PU & Teak Polishing",
                  "Upholstery & Fabrics",
                  "Quality Inspection & Dispatch",
                  "Showroom Sales & Design",
                  "Workshop Logistics & Timber Procurement",
                ]}
                value={hireFormData.department}
                onChange={(val) => setHireFormData({ ...hireFormData, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Hiring..." : "Confirm & Add to Staff"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHireModal(false);
                    setHiringCandidate(null);
                  }}
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
