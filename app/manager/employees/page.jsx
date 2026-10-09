"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Briefcase,
  Eye,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  FileText,
  Calendar,
  Award,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getEmployees,
  getJobPostings,
  getJobApplications,
} from "@/actions/careerActions";

export default function ManagerEmployeesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'jobs' | 'applications'
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states (10 items per page)
  const ITEMS_PER_PAGE = 10;
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [candidateCurrentPage, setCandidateCurrentPage] = useState(1);

  // Search & filter state
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDeptFilter, setStaffDeptFilter] = useState("ALL");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("ALL");

  // View details modal (read-only)
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  // Filtered staff
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

  // Filtered candidates
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (candidateStatusFilter !== "ALL" && app.status !== candidateStatusFilter) return false;
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        return (
          app.fullName?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.toLowerCase().includes(q) ||
          app.job?.title?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, candidateSearch, candidateStatusFilter]);

  // Paginated Slices
  const staffTotalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE) || 1;
  const safeStaffPage = Math.min(Math.max(staffCurrentPage, 1), staffTotalPages);
  const paginatedEmployees = filteredEmployees.slice((safeStaffPage - 1) * ITEMS_PER_PAGE, safeStaffPage * ITEMS_PER_PAGE);

  const candidateTotalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE) || 1;
  const safeCandidatePage = Math.min(Math.max(candidateCurrentPage, 1), candidateTotalPages);
  const paginatedApplications = filteredApplications.slice((safeCandidatePage - 1) * ITEMS_PER_PAGE, safeCandidatePage * ITEMS_PER_PAGE);


  if (!mounted) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12" suppressHydrationWarning>
        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-stone-900 border border-amber-900/50 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-stone-400 font-semibold tracking-wider uppercase">
            Loading Showroom Workforce Directory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" suppressHydrationWarning>
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-amber-900/50 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Manager Portal • View-Only Mode</span>
            </span>
            <span className="text-[10px] font-semibold text-stone-400">
              Facility Workforce Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Staff & Workforce Directory
          </h1>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            Inspect active factory artisans, open workshop vacancies, and recruitment candidates. Administrative actions (adding, editing, hiring, or removing staff) are authorized for Super Admin only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            suppressHydrationWarning
            onClick={loadData}
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-amber-900/60 transition-all cursor-pointer shadow-md"
            title="Refresh staff records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Notice Box */}
      <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-300">Operations Read-Only Access:</span>
          <p className="text-stone-300 text-[11px] leading-relaxed">
            As a showroom operations manager, you can inspect full staff assignments, job specs, and applicant portfolios. To create new job postings, edit team members, or onboard candidates as staff, please coordinate with Super Admin via the Executive Admin Console.
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-900/50 pb-3 overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-none">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("employees")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "employees"
              ? "bg-amber-500 text-stone-950 shadow-lg font-black"
              : "bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-amber-900/40"
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
              ? "bg-amber-500 text-stone-950 shadow-lg font-black"
              : "bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-amber-900/40"
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
              ? "bg-amber-500 text-stone-950 shadow-lg font-black"
              : "bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-amber-900/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Candidate Pipeline ({applications.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACTIVE STAFF (READ-ONLY DIRECTORY)                      */}
      {/* ============================================================== */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          {/* Search & Dept Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-amber-900/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search staff by name, email, phone, or role..."
                value={staffSearch}
                onChange={(e) => { setStaffSearch(e.target.value); setStaffCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Dept:
              </span>
              <select
                value={staffDeptFilter}
                suppressHydrationWarning
                onChange={(e) => { setStaffDeptFilter(e.target.value); setStaffCurrentPage(1); }}
                className="bg-stone-950 text-stone-200 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
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

          {/* Smooth Horizontal Scrollable Table (2-finger trackpad & 1-finger mobile) */}
          <div className="bg-stone-900 rounded-3xl border border-amber-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-stone-900">
              <table className="w-full text-left text-xs text-stone-300 min-w-[860px]">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-4 pl-6">Staff Member</th>
                    <th className="p-4">Designation / Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-stone-500">
                        {staffSearch || staffDeptFilter !== "ALL"
                          ? "No staff members matched your filter criteria."
                          : "No active staff members registered in directory."}
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {emp.name?.charAt(0)?.toUpperCase() || "E"}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm">{emp.name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                Registered Staff #{emp.id?.slice(-6)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-amber-300 text-xs block">
                            {emp.roleTitle || "Artisan Craftsman"}
                          </span>
                          <span className="text-[10px] text-stone-400">Solapur Showroom / Workshop</span>
                        </td>

                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-stone-800 text-amber-200 border border-amber-900/60 inline-flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>{emp.department}</span>
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1 text-[11px]">
                            {emp.email && (
                              <a
                                href={`mailto:${emp.email}`}
                                className="flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors"
                              >
                                <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{emp.email}</span>
                              </a>
                            )}
                            {emp.phone && (
                              <a
                                href={`tel:${emp.phone}`}
                                className="flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors font-mono text-[10px]"
                              >
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{emp.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                              emp.status === "ACTIVE"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                : "bg-stone-800 text-stone-400 border-stone-700"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{emp.status || "ACTIVE"}</span>
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setViewingStaff(emp)}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-900/60 transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Staff Directory */}
            {filteredEmployees.length > ITEMS_PER_PAGE && (
              <div className="p-4 bg-stone-950 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
                <div>
                  Showing <span className="font-bold text-white">{(safeStaffPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-bold text-white">{Math.min(safeStaffPage * ITEMS_PER_PAGE, filteredEmployees.length)}</span> of{" "}
                  <span className="font-bold text-white">{filteredEmployees.length}</span> staff members
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeStaffPage <= 1}
                    onClick={() => setStaffCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-stone-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  {Array.from({ length: staffTotalPages }, (_, i) => i + 1).map((num) => {
                    if (
                      num === 1 ||
                      num === staffTotalPages ||
                      (num >= safeStaffPage - 1 && num <= safeStaffPage + 1)
                    ) {
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setStaffCurrentPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            safeStaffPage === num
                              ? "bg-amber-500 text-stone-950 font-black"
                              : "bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    }
                    if (num === safeStaffPage - 2 || num === safeStaffPage + 2) {
                      return (
                        <span key={num} className="px-1 text-stone-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    disabled={safeStaffPage >= staffTotalPages}
                    onClick={() => setStaffCurrentPage((p) => Math.min(p + 1, staffTotalPages))}
                    className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-stone-300 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: JOB OPENINGS (READ-ONLY DIRECTORY)                      */}
      {/* ============================================================== */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-stone-500 bg-stone-900 rounded-3xl border border-amber-900/50">
                No job openings registered yet. Openings posted by Super Admin will appear here.
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
                    className="bg-stone-900 p-6 rounded-3xl border border-amber-900/50 space-y-4 flex flex-col justify-between hover:border-amber-700/60 transition-all shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-950 text-amber-300 px-3 py-1 rounded-full border border-amber-900/60">
                          {job.department}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                            job.isActive && !shouldAutoClose
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                              : "bg-stone-800 text-stone-400 border-stone-700"
                          }`}
                        >
                          {job.isActive && !shouldAutoClose ? "✓ Active on /careers" : "✕ Inactive / Closed"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-serif text-white">{job.title}</h3>
                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">{job.description}</p>

                      {/* Expiry & Target Info */}
                      <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-amber-900/40 space-y-2 text-[11px]">
                        <div className="flex justify-between items-center text-stone-300">
                          <span className="flex items-center gap-1.5 text-stone-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Application Deadline:
                          </span>
                          <span className={`font-semibold ${isExpired ? "text-red-400 font-bold" : "text-stone-200"}`}>
                            {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString("en-IN") : "No fixed expiry"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-stone-300">
                          <span className="flex items-center gap-1.5 text-stone-400">
                            <Users className="w-3.5 h-3.5 text-amber-400" /> Total Applications:
                          </span>
                          <span className="font-semibold text-stone-200">
                            {job.applications?.length || 0}
                            {job.maxApplications ? ` / ${job.maxApplications} max` : " applicants"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-stone-300">
                          <span className="flex items-center gap-1.5 text-stone-400">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> Target Openings Hired:
                          </span>
                          <span className="font-bold text-emerald-400">
                            {job.hiredCount || 0} of {job.hiredTarget || 1} Positions Filled
                          </span>
                        </div>
                      </div>

                      {/* Specs pills */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                          <span className="text-stone-400 block">Experience:</span>
                          <span className="font-semibold text-stone-200">{job.experience || "3+ Years"}</span>
                        </div>
                        {job.salaryRange && (
                          <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                            <span className="text-stone-400 block">Salary / Package:</span>
                            <span className="font-semibold text-amber-400">{job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-900/40 text-xs flex items-center justify-between text-stone-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-amber-400" /> {job.location || "Solapur Facility"}
                      </span>
                      <a
                        href="/careers"
                        target="_blank"
                        className="text-amber-300 hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>View on Public Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CANDIDATE PIPELINE (READ-ONLY DIRECTORY)               */}
      {/* ============================================================== */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-amber-900/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search candidate by name, phone, or job..."
                value={candidateSearch}
                onChange={(e) => { setCandidateSearch(e.target.value); setCandidateCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Stage:
              </span>
              <select
                value={candidateStatusFilter}
                suppressHydrationWarning
                onChange={(e) => { setCandidateStatusFilter(e.target.value); setCandidateCurrentPage(1); }}
                className="bg-stone-950 text-stone-200 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Evaluation Stages</option>
                <option value="ON_PROCESS">Under Review (ON_PROCESS)</option>
                <option value="SELECTED">Selected for Staff (SELECTED)</option>
                <option value="REJECTED">Archived / Rejected (REJECTED)</option>
              </select>
            </div>
          </div>

          {/* Smooth Horizontal Scrollable Table for Candidate Records */}
          <div className="bg-stone-900 rounded-3xl border border-amber-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-stone-900">
              <table className="w-full text-left text-xs text-stone-300 min-w-[950px]">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-4 pl-6">Candidate</th>
                    <th className="p-4">Position Applied</th>
                    <th className="p-4">Experience & Portfolio</th>
                    <th className="p-4">WhatsApp Contact</th>
                    <th className="p-4">Evaluation Stage</th>
                    <th className="p-4 pr-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-stone-500">
                        No candidate applications currently match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((app) => {
                      const cleanPhone = (app.phone || "").replace(/[^0-9]/g, "");
                      const targetPhone = cleanPhone.startsWith("91")
                        ? cleanPhone
                        : cleanPhone.length === 10
                        ? `91${cleanPhone}`
                        : cleanPhone;

                      const waChatUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
                        `Hello ${app.fullName}, this is Aameena Furniture Solapur regarding your application for "${app.job?.title || "Woodcraft Artisan"}".`
                      )}`;

                      return (
                        <tr key={app.id} className="hover:bg-stone-800/40 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                                {app.fullName?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                              <div>
                                <span className="font-bold text-white block text-sm">{app.fullName}</span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  Applied {new Date(app.createdAt).toLocaleDateString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-amber-300 block text-xs">
                              {app.job?.title || "General Application"}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {app.job?.department || "Solapur Facility"}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="block font-semibold text-stone-200">{app.experience || "Not stated"}</span>
                            {app.portfolioUrl && (
                              <a
                                href={app.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>View Portfolio</span>
                              </a>
                            )}
                          </td>

                          <td className="p-4">
                            {app.phone ? (
                              <a
                                href={waChatUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold transition-colors"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-400" />
                                <span>{app.phone}</span>
                              </a>
                            ) : (
                              <span className="text-stone-500 text-[10px]">No phone</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold border inline-block ${
                                app.status === "SELECTED"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : app.status === "REJECTED"
                                  ? "bg-red-950 text-red-300 border-red-800"
                                  : "bg-amber-950 text-amber-300 border-amber-800"
                              }`}
                            >
                              {app.status === "SELECTED"
                                ? "✓ Selected / Hired"
                                : app.status === "REJECTED"
                                ? "✕ Rejected / Archived"
                                : "⏳ Under Review"}
                            </span>
                          </td>

                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => setViewingCandidate(app)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-900/60 transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Notes</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Candidate Applications */}
            {filteredApplications.length > ITEMS_PER_PAGE && (
              <div className="p-4 bg-stone-950 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
                <div>
                  Showing <span className="font-bold text-white">{(safeCandidatePage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-bold text-white">{Math.min(safeCandidatePage * ITEMS_PER_PAGE, filteredApplications.length)}</span> of{" "}
                  <span className="font-bold text-white">{filteredApplications.length}</span> candidates
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeCandidatePage <= 1}
                    onClick={() => setCandidateCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-stone-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  {Array.from({ length: candidateTotalPages }, (_, i) => i + 1).map((num) => {
                    if (
                      num === 1 ||
                      num === candidateTotalPages ||
                      (num >= safeCandidatePage - 1 && num <= safeCandidatePage + 1)
                    ) {
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCandidateCurrentPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            safeCandidatePage === num
                              ? "bg-amber-500 text-stone-950 font-black"
                              : "bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    }
                    if (num === safeCandidatePage - 2 || num === safeCandidatePage + 2) {
                      return (
                        <span key={num} className="px-1 text-stone-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    disabled={safeCandidatePage >= candidateTotalPages}
                    onClick={() => setCandidateCurrentPage((p) => Math.min(p + 1, candidateTotalPages))}
                    className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-stone-300 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: INSPECT STAFF MEMBER (READ-ONLY)                     */}
      {/* ============================================================== */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-900/60 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-stone-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Staff Record #{viewingStaff.id?.slice(-6)?.toUpperCase()}
                </span>
                <h3 className="text-xl font-bold font-serif text-white mt-0.5">{viewingStaff.name}</h3>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Designation / Role:</span>
                <span className="font-bold text-amber-300 text-sm">{viewingStaff.roleTitle}</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Department:</span>
                <span className="font-bold text-stone-200">{viewingStaff.department}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Email:</span>
                  <span className="font-semibold text-stone-200 break-all">{viewingStaff.email || "—"}</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Phone:</span>
                  <span className="font-semibold text-stone-200 font-mono">{viewingStaff.phone || "—"}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex justify-between items-center">
                <span className="text-stone-400 text-[10px] uppercase font-semibold">Current Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {viewingStaff.status || "ACTIVE"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingStaff(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: INSPECT CANDIDATE DETAILS (READ-ONLY)                */}
      {/* ============================================================== */}
      {viewingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-900/60 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-stone-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Applicant Profile
                </span>
                <h3 className="text-xl font-bold font-serif text-white mt-0.5">{viewingCandidate.fullName}</h3>
                <span className="text-xs text-stone-400">Position: {viewingCandidate.job?.title}</span>
              </div>
              <button
                onClick={() => setViewingCandidate(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Phone:</span>
                  <span className="font-semibold text-stone-200 font-mono">{viewingCandidate.phone || "—"}</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Email:</span>
                  <span className="font-semibold text-stone-200 break-all">{viewingCandidate.email || "—"}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Stated Experience:</span>
                <span className="font-bold text-amber-300">{viewingCandidate.experience || "Not stated"}</span>
              </div>

              {viewingCandidate.portfolioUrl && (
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Portfolio Link:</span>
                  <a
                    href={viewingCandidate.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{viewingCandidate.portfolioUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Applicant Cover Note:</span>
                <p className="text-stone-300 leading-relaxed italic">
                  "{viewingCandidate.coverNotes || "No additional notes provided by candidate."}"
                </p>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex justify-between items-center">
                <span className="text-stone-400 text-[10px] uppercase font-semibold">Workflow Status:</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {viewingCandidate.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingCandidate(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
