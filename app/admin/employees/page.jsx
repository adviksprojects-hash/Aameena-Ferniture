"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getEmployees,
  createEmployee,
  getJobPostings,
  createJobPosting,
  toggleJobStatus,
  deleteJobPosting,
  getJobApplications,
  updateApplicationStatus,
  archiveJobApplication,
  restoreJobApplication,
  deleteJobApplication,
} from "@/actions/careerActions";
import SearchableSelect from "@/components/SearchableSelect";
import { validatePhone, validateEmail } from "@/lib/validation";

export default function AdminEmployeesPage() {
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'jobs' | 'applications'
  const [candidateSubTab, setCandidateSubTab] = useState("active"); // 'active' | 'archived'
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [empPhoneError, setEmpPhoneError] = useState(null);
  const [empEmailError, setEmpEmailError] = useState(null);

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states (zero demo data, clean empty states)
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Carpentry & Joinery",
    roleTitle: "",
  });

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

  const loadAllData = async () => {
    setLoading(true);
    const [empRes, jobRes, appRes] = await Promise.all([
      getEmployees(),
      getJobPostings(false),
      getJobApplications({ includeArchived: true }),
    ]);

    if (empRes.success) setEmployees(empRes.data);
    if (jobRes.success) setJobs(jobRes.data);
    if (appRes.success) setApplications(appRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

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
      setMessage({ type: "success", text: "Staff member added to workforce directory!" });
      setShowEmpModal(false);
      setNewEmp({ name: "", email: "", phone: "", department: "Carpentry & Joinery", roleTitle: "" });
      await loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add employee." });
    }
    setSubmitting(false);
  };

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
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create job opening." });
    }
    setSubmitting(false);
  };

  const handleToggleJob = async (jobId, currentStatus) => {
    const res = await toggleJobStatus(jobId, currentStatus);
    if (res.success) {
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, isActive: !currentStatus } : j)));
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!confirm(`Permanently delete "${title}" job opening? All candidate applications for this position will also be removed.`)) return;
    const res = await deleteJobPosting(jobId);
    if (res.success) {
      setMessage({ type: "success", text: `Position "${title}" was removed.` });
      setJobs(jobs.filter((j) => j.id !== jobId));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 3-Stage Application Status handler
  const handleAppStatus = async (appId, status) => {
    const res = await updateApplicationStatus(appId, status);
    if (res.success) {
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      setMessage({
        type: "success",
        text: `Candidate status updated to "${status.replace("_", " ")}" ${
          status === "SELECTED" ? "• Position hired count updated" : ""
        }`,
      });
      loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update status." });
    }
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

  // Filter applications by subtab
  const filteredApplications = applications.filter((app) =>
    candidateSubTab === "archived" ? app.isArchived === true : !app.isArchived
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">People & Talent Operations</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">HR & Workforce Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage craftsman team, configure job position expiry & limits, and evaluate candidate pipelines in 3 distinct stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "employees" ? (
            <button
              onClick={() => setShowEmpModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          ) : activeTab === "jobs" ? (
            <button
              onClick={() => setShowJobModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opening</span>
            </button>
          ) : null}
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

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "employees"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Active Staff ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "jobs"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Openings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "applications"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Candidate Pipeline ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-950 rounded-3xl border border-slate-800">
                No staff members registered in directory. Click "Add Staff Member" to add one.
              </div>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif text-base">
                      {emp.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-serif text-white">{emp.name}</h3>
                      <span className="text-xs text-amber-400 font-semibold">{emp.roleTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-300">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOB OPENINGS WITH TIME LIMIT & CAPACITY AUTOMATION */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-950 rounded-3xl border border-slate-800">
                No job openings created. Click "Post New Opening" to publish one.
              </div>
            ) : (
              jobs.map((job) => {
                const now = new Date();
                const isExpired = job.expiresAt && new Date(job.expiresAt) < now;
                const isCapacityMet = job.maxApplications && job.applications?.length >= job.maxApplications;
                const isTargetHired = job.hiredTarget && (job.hiredCount || 0) >= job.hiredTarget;
                const shouldAutoClose = isExpired || isCapacityMet || isTargetHired;

                return (
                  <div key={job.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-800">
                          {job.department}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleJob(job.id, job.isActive)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${
                              job.isActive && !shouldAutoClose
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {job.isActive && !shouldAutoClose ? "Active on /careers" : "Closed / Inactive"}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold font-serif text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

                      {/* Expiry & Limits Banner */}
                      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 space-y-2 text-[11px]">
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
                              : "No Expiry Set"}
                            {isExpired && " (Expired)"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>Application Capacity:</span>
                          </span>
                          <span className={`font-semibold ${isCapacityMet ? "text-amber-400" : "text-slate-200"}`}>
                            {job.applications?.length || 0} / {job.maxApplications || "Unlimited"}
                            {isCapacityMet && " (Limit Reached)"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hired Target:</span>
                          </span>
                          <span className={`font-semibold ${isTargetHired ? "text-emerald-400 font-bold" : "text-slate-200"}`}>
                            {job.hiredCount || 0} / {job.hiredTarget || 1} Hired
                            {isTargetHired && " (Positions Filled)"}
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
                          <span className="font-semibold">{job.experience}</span>
                        </div>
                        {job.salaryRange && (
                          <div className="col-span-2">
                            <span className="text-slate-500 block">Salary / Package:</span>
                            <span className="font-semibold text-amber-400">{job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                      {shouldAutoClose ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Closing Criteria Met (Auto-Closed)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          Accepting Applications
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-2 bg-red-950/60 hover:bg-red-900 rounded-lg text-red-400 transition-colors"
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

      {/* TAB 3: CANDIDATE PIPELINE (3 STAGES: ON_PROCESS, SELECTED, REJECTED + ARCHIVE) */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCandidateSubTab("active")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  candidateSubTab === "active"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Active Candidates ({applications.filter((a) => !a.isArchived).length})
              </button>
              <button
                onClick={() => setCandidateSubTab("archived")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  candidateSubTab === "archived"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Archive className="w-3 h-3 inline mr-1" />
                Archived Rejected ({applications.filter((a) => a.isArchived).length})
              </button>
            </div>
            <span className="text-[11px] text-slate-500">
              Only 3 Workflow Stages: In Process • Selected • Rejected
            </span>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Evaluation Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      {candidateSubTab === "archived"
                        ? "No archived candidate applications."
                        : "No candidate applications currently active."}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div>{app.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{app.email}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{app.phone}</div>
                      </td>
                      <td className="p-4 text-amber-400 font-semibold">{app.job?.title || "General Application"}</td>
                      <td className="p-4 text-slate-300 font-medium">{app.experience}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{app.coverNotes || "None provided"}</td>
                      <td className="p-4">
                        <a
                          href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${app.fullName}, this is Aameena Furniture HR regarding your application for "${app.job?.title}". We would like to connect with you.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      </td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleAppStatus(app.id, e.target.value)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border focus:outline-none ${
                            app.status === "SELECTED"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : app.status === "REJECTED"
                              ? "bg-red-950 text-red-400 border-red-800"
                              : "bg-blue-950 text-blue-400 border-blue-800"
                          }`}
                        >
                          <option value="ON_PROCESS">⏳ In Process (Evaluation)</option>
                          <option value="SELECTED">✅ Selected (Hired)</option>
                          <option value="REJECTED">❌ Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.isArchived ? (
                            <button
                              onClick={() => handleRestoreCandidate(app.id, app.fullName)}
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                              title="Restore to active candidates"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : app.status === "REJECTED" ? (
                            <button
                              onClick={() => handleArchiveCandidate(app.id, app.fullName)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                              title="Archive rejected candidate"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleDeleteCandidate(app.id, app.fullName)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 transition-colors"
                            title="Delete candidate record permanently"
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
      )}

      {/* Modal: Add Employee */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold font-serif text-white">Add Staff Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Rameshwar Suthar)"
                value={newEmp.name}
                onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
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
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
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

              <input
                type="text"
                required
                placeholder="Role / Designation (e.g. Master Wood Carver)"
                value={newEmp.roleTitle}
                onChange={(e) => setNewEmp({ ...newEmp, roleTitle: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />

              <SearchableSelect
                label="Department"
                dark={true}
                options={[
                  "Carpentry & Joinery",
                  "PU & Teak Polishing",
                  "Upholstery & Leather",
                  "Quality Inspection & Dispatch",
                  "Showroom Sales & Design",
                ]}
                value={newEmp.department}
                onChange={(val) => setNewEmp({ ...newEmp, department: val })}
                allowOther={true}
                otherPlaceholder="Enter custom department..."
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add to Workforce"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Job Opening with Expiry & Capacity Limits */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-white">Post New Job Opening</h3>
            <p className="text-xs text-slate-400">
              Configure posting duration, max candidate applications, and hiring target for automatic closure.
            </p>

            <form onSubmit={handleAddJob} className="space-y-3 text-xs">
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

              {/* Automation Rules: Expiry, Max Applications, Hired Target */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block">
                  Automatic Closure & Duration Controls:
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
                    <label className="text-slate-400 font-semibold block mb-1">
                      Max Applications Limit:
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newJob.maxApplications}
                      onChange={(e) => setNewJob({ ...newJob, maxApplications: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Required Hires Target:
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={newJob.hiredTarget}
                      onChange={(e) => setNewJob({ ...newJob, hiredTarget: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  When deadline passes, or max applications are received, or hired target is reached, the job automatically unpublishes from /careers.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 2+ Years"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monthly Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹35,000 - ₹50,000"
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Overview</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Responsibilities, timber craftsmanship requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Job Opening"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
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
