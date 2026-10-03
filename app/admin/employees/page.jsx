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
} from "@/actions/careerActions";

export default function AdminEmployeesPage() {
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'jobs' | 'applications'
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
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
    location: "Bandra West Flagship, Mumbai",
    type: "Full Time",
    experience: "3+ Years",
    salaryRange: "₹45,000 - ₹65,000 / month",
    description: "",
  });

  const loadAllData = async () => {
    setLoading(true);
    const [empRes, jobRes, appRes] = await Promise.all([
      getEmployees(),
      getJobPostings(false),
      getJobApplications(),
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
      setMessage({ type: "success", text: "Career opening posted live to /careers page!" });
      setShowJobModal(false);
      setNewJob({
        title: "",
        department: "Carpentry & Woodcraft",
        location: "Bandra West Flagship, Mumbai",
        type: "Full Time",
        experience: "3+ Years",
        salaryRange: "₹45,000 - ₹65,000 / month",
        description: "",
      });
      await loadAllData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create position." });
    }
    setSubmitting(false);
  };

  const handleToggleJob = async (job) => {
    const res = await toggleJobStatus(job.id, job.isActive);
    if (res.success) {
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)));
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!confirm(`Delete opening "${title}"?`)) return;
    const res = await deleteJobPosting(id);
    if (res.success) {
      setJobs(jobs.filter((j) => j.id !== id));
      setMessage({ type: "success", text: "Position removed." });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAppStatus = async (appId, status) => {
    const res = await updateApplicationStatus(appId, status);
    if (res.success) {
      setApplications(applications.map((a) => (a.id === appId ? { ...a, status } : a)));
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Human Capital & Talent</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Workforce & Recruitment Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active artisans and staff, publish live job openings to the user /careers page, and review candidate applications.
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
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          ) : (
            <button
              onClick={() => setShowJobModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Career Opening</span>
            </button>
          )}
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "employees"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Workforce Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "jobs"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Live Job Postings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "applications"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Candidate Applications ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: WORKFORCE DIRECTORY */}
      {activeTab === "employees" && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading workforce directory...
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-xs">
                        {emp.name[0]}
                      </div>
                      <span>{emp.name}</span>
                    </td>
                    <td className="p-4 text-amber-400 font-semibold">{emp.roleTitle}</td>
                    <td className="p-4 text-slate-400">{emp.department}</td>
                    <td className="p-4 text-slate-400">
                      <div>{emp.email}</div>
                      <div className="text-[10px] text-slate-500">{emp.phone}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: LIVE JOB OPENINGS */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-950 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-800">
                      {job.department}
                    </span>
                    <button
                      onClick={() => handleToggleJob(job)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                        job.isActive
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {job.isActive ? "Published on /careers" : "Draft / Hidden"}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-white">{job.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-900">
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
                        <span className="text-slate-500 block">Package:</span>
                        <span className="font-semibold text-amber-400">{job.salaryRange}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                  <span className="text-slate-500">
                    {job.applications?.length || 0} Applicants Received
                  </span>
                  <button
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="p-2 bg-red-950/60 hover:bg-red-900 rounded-lg text-red-400 transition-colors"
                    title="Delete Position"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CANDIDATE APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Applied Position</th>
                <th className="p-4">Woodworking Experience</th>
                <th className="p-4">Notes</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4 text-right">Application Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No candidate applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
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
                          `Hello ${app.fullName}, this is Aameena Furniture regarding your application for "${app.job?.title}". We would like to schedule an interview.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => handleAppStatus(app.id, e.target.value)}
                        className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                      >
                        <option value="PENDING">Pending Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <input
                type="email"
                required
                placeholder="Email Address"
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newEmp.phone}
                onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <input
                type="text"
                required
                placeholder="Role / Designation (e.g. Master Wood Carver)"
                value={newEmp.roleTitle}
                onChange={(e) => setNewEmp({ ...newEmp, roleTitle: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              <select
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Carpentry & Joinery">Carpentry & Joinery</option>
                <option value="3D Design Studio">3D Design Studio</option>
                <option value="Timber Processing">Timber Processing & Kiln Drying</option>
                <option value="Finishing & Coating">Finishing & PU Coating</option>
                <option value="Showroom Sales">Showroom Sales & Consultations</option>
                <option value="White-Glove Logistics">White-Glove Logistics</option>
              </select>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add to Workforce"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post New Job Opening */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-white">Publish New Career Opening</h3>
            <p className="text-xs text-slate-400">Position will immediately appear on the public /careers page.</p>

            <form onSubmit={handleAddJob} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Teak Wood Artisan"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Carpentry & Woodcraft">Carpentry & Woodcraft</option>
                    <option value="Design Studio">Design Studio</option>
                    <option value="Showroom Sales">Showroom Sales</option>
                    <option value="Finishing & Coating">Finishing & Coating</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Bandra West Flagship, Mumbai"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Required Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 4+ Years"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 - ₹70,000 / month"
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Job Responsibilities & Scope</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Craft bespoke Grade-A Sagwan Teak sofas, mortise-and-tenon framing..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Position"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold"
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
