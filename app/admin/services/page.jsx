"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Compass,
  FileText,
  Clock,
} from "lucide-react";
import {
  getAdminServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "@/actions/serviceAdminActions";
import {
  getInquiries,
  updateInquiryStatus,
  deleteServiceInquiry,
} from "@/actions/serviceActions";

const INQUIRY_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending (New)", color: "bg-amber-950 text-amber-300 border-amber-800" },
  { value: "CONSULTATION_SCHEDULED", label: "Consultation Scheduled", color: "bg-sky-950 text-sky-300 border-sky-800" },
  { value: "ESTIMATE_SENT", label: "Estimate / Quote Sent", color: "bg-purple-950 text-purple-300 border-purple-800" },
  { value: "CONVERTED_TO_ORDER", label: "Converted to Order", color: "bg-emerald-950 text-emerald-300 border-emerald-800" },
  { value: "CLOSED", label: "Closed / Archived", color: "bg-slate-900 text-slate-400 border-slate-700" },
];

export default function AdminServicesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("services"); // "services" | "service_inquiries" | "contact_inquiries"
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState(null);
  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Inquiries Search, Filter & Pagination
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("ALL");
  const [inquiryPage, setInquiryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Add Service Form
  const [newServiceImage, setNewServiceImage] = useState(null);
  const [newService, setNewService] = useState({
    title: "",
    tag: "Most Requested",
    description: "",
    features: "3D Room Modeling & Layout Drafting\nSelection of Seasoned Sagwan Teak\nCustom Velvet or Leather Upholstery\n10-Year Anti-Termite Warranty",
    isActive: true,
  });

  // Edit Service Form
  const [editServiceImage, setEditServiceImage] = useState(null);
  const [editServiceData, setEditServiceData] = useState({
    title: "",
    tag: "Most Requested",
    description: "",
    features: "",
    isActive: true,
  });

  const loadAllData = async () => {
    setLoading(true);
    const [srvRes, inqRes] = await Promise.all([
      getAdminServices(),
      getInquiries("ALL"),
    ]);

    if (srvRes.success) setServices(srvRes.data || []);
    if (inqRes.success) setInquiries(inqRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadAllData();
  }, []);

  const handleImageFile = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditServiceImage(reader.result);
      } else {
        setNewServiceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleStatus = async (service) => {
    setUpdatingId(service.id);
    const res = await toggleServiceStatus(service.id);
    if (res.success) {
      setServices(
        services.map((s) => (s.id === service.id ? { ...s, isActive: !service.isActive } : s))
      );
      setMessage({
        type: "success",
        text: `"${service.title}" visibility toggled to ${!service.isActive ? "Active" : "Inactive"}.`,
      });
      setTimeout(() => setMessage(null), 4000);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to permanently delete the service "${service.title}"?`)) return;
    setUpdatingId(service.id);
    const res = await deleteService(service.id);
    if (res.success) {
      setServices(services.filter((s) => s.id !== service.id));
      setMessage({ type: "success", text: `"${service.title}" deleted successfully.` });
      setTimeout(() => setMessage(null), 4000);
    }
    setUpdatingId(null);
  };

  const openEditModal = (service) => {
    setSelectedServiceForEdit(service);
    setEditServiceImage(service.imageUrl || null);
    setEditServiceData({
      title: service.title || "",
      tag: service.tag || "Most Requested",
      description: service.description || "",
      features: Array.isArray(service.features) ? service.features.join("\n") : service.features || "",
      isActive: service.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedServiceForEdit) return;

    setSubmitting(true);
    const res = await updateService(selectedServiceForEdit.id, {
      ...editServiceData,
      imageUrl: editServiceImage,
    });

    if (res.success) {
      setMessage({ type: "success", text: "Service details updated successfully!" });
      setShowEditModal(false);
      await loadAllData();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update service." });
    }
    setSubmitting(false);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceImage) {
      alert("Please upload or capture a photo for this service.");
      return;
    }

    setSubmitting(true);
    const res = await createService({
      ...newService,
      imageUrl: newServiceImage,
    });

    if (res.success) {
      setMessage({ type: "success", text: "Service created and published successfully!" });
      setShowAddModal(false);
      setNewServiceImage(null);
      setNewService({
        title: "",
        tag: "Most Requested",
        description: "",
        features: "3D Room Modeling & Layout Drafting\nSelection of Seasoned Sagwan Teak\nCustom Velvet or Leather Upholstery\n10-Year Anti-Termite Warranty",
        isActive: true,
      });
      await loadAllData();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create service." });
    }
    setSubmitting(false);
  };

  // Inquiry Status Updater
  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    const res = await updateInquiryStatus(inquiryId, newStatus);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
      );
      setMessage({
        type: "success",
        text: `Inquiry status updated to ${newStatus.replace(/_/g, " ")}.`,
      });
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  // Inquiry Delete
  const handleDeleteInquiry = async (inquiryId, clientName) => {
    if (!confirm(`Permanently delete consultation inquiry from ${clientName}?`)) return;
    const res = await deleteServiceInquiry(inquiryId);
    if (res.success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
      setMessage({ type: "success", text: `Inquiry from ${clientName} deleted.` });
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete inquiry." });
    }
  };

  // Separate Service Inquiries vs Contact Inquiries
  const isContactInquiry = (inq) =>
    inq.roomType === "Contact Page" ||
    inq.roomType === "Contact Page Inquiry" ||
    inq.roomType === "Contact Form" ||
    (inq.serviceType && inq.serviceType.startsWith("Contact:"));

  const serviceInquiriesList = useMemo(() => inquiries.filter((inq) => !isContactInquiry(inq)), [inquiries]);
  const contactInquiriesList = useMemo(() => inquiries.filter((inq) => isContactInquiry(inq)), [inquiries]);

  const currentInquiryPool = activeTab === "service_inquiries" ? serviceInquiriesList : contactInquiriesList;

  // Filtered inquiries calculation
  const filteredInquiries = useMemo(() => {
    return currentInquiryPool.filter((inq) => {
      if (inquiryStatusFilter !== "ALL" && inq.status !== inquiryStatusFilter) return false;
      if (inquirySearch.trim()) {
        const q = inquirySearch.toLowerCase();
        return (
          inq.clientName?.toLowerCase().includes(q) ||
          inq.clientPhone?.includes(q) ||
          inq.clientEmail?.toLowerCase().includes(q) ||
          inq.serviceType?.toLowerCase().includes(q) ||
          inq.woodChoice?.toLowerCase().includes(q) ||
          inq.roomType?.toLowerCase().includes(q) ||
          inq.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentInquiryPool, inquirySearch, inquiryStatusFilter]);

  const inquiryTotalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE) || 1;
  const safeInquiryPage = Math.min(Math.max(inquiryPage, 1), inquiryTotalPages);
  const paginatedInquiries = filteredInquiries.slice(
    (safeInquiryPage - 1) * ITEMS_PER_PAGE,
    safeInquiryPage * ITEMS_PER_PAGE
  );

  if (!mounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        <div className="min-h-[420px] flex flex-col items-center justify-center space-y-4 rounded-3xl bg-slate-950 border border-slate-800 p-8" suppressHydrationWarning>
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Loading Services & Customer Inquiries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
            Super Admin Operations • Solapur Hub
          </span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">
            Service & Customer Consultation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage bespoke service offerings, and inspect inquiries submitted from the Services Page and Contact Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "services" && (
            <button
              onClick={() => {
                setNewServiceImage(null);
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-amber-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3" suppressHydrationWarning>
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "services"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Artisanal Service Offerings ({services.length})</span>
        </button>

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => { setActiveTab("service_inquiries"); setInquiryPage(1); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "service_inquiries"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Service Inquiries ({serviceInquiriesList.length})</span>
        </button>

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => { setActiveTab("contact_inquiries"); setInquiryPage(1); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "contact_inquiries"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Inquiries ({contactInquiriesList.length})</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ARTISANAL SERVICE OFFERINGS (PUBLIC SERVICES CRUD)     */}
      {/* ============================================================== */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && services.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading services from PostgreSQL...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 p-8 text-slate-400">
              No services registered in database. Click "Add New Service" above.
            </div>
          ) : (
            services.map((srv) => {
              const isUpdating = updatingId === srv.id;
              const features = Array.isArray(srv.features) ? srv.features : [];

              return (
                <div
                  key={srv.id}
                  className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Service Photo with Tag & Status */}
                    <div className="relative h-56 bg-slate-900 overflow-hidden">
                      <img
                        src={
                          srv.imageUrl ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={srv.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {srv.tag || "Bespoke Service"}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm ${
                            srv.isActive
                              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700/60"
                              : "bg-red-950/90 text-red-300 border border-red-700/60"
                          }`}
                        >
                          {srv.isActive ? "Active on Storefront" : "Hidden / Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold font-serif text-white">{srv.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>

                      {/* Features list */}
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                          Key Service Deliverables:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 pt-0 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(srv)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        srv.isActive
                          ? "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                      }`}
                    >
                      {srv.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{srv.isActive ? "Hide Service" : "Set Active"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(srv)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1 border border-slate-800 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => handleDelete(srv)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/80 text-red-300 font-bold text-xs flex items-center gap-1 border border-red-900/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SERVICE INQUIRIES (FROM /services PAGE)                 */}
      {/* ============================================================== */}
      {activeTab === "service_inquiries" && (
        <div className="space-y-4">
          {/* Search and Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search service inquiries by client name, phone, timber, room..."
                value={inquirySearch}
                onChange={(e) => {
                  setInquirySearch(e.target.value);
                  setInquiryPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-500" /> Status:
              </span>
              <select
                value={inquiryStatusFilter}
                suppressHydrationWarning
                onChange={(e) => {
                  setInquiryStatusFilter(e.target.value);
                  setInquiryPage(1);
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {INQUIRY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Inquiries Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
              <table className="w-full text-left text-xs text-slate-300 min-w-[950px]">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Client Contact</th>
                    <th className="p-4">Service Requested</th>
                    <th className="p-4">Wood & Scope</th>
                    <th className="p-4">Est. Budget</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Inquiry Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedInquiries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-slate-500">
                        {inquirySearch || inquiryStatusFilter !== "ALL"
                          ? "No service consultation inquiries match your filter criteria."
                          : "No customer consultation inquiries submitted from the Services Page yet."}
                      </td>
                    </tr>
                  ) : (
                    paginatedInquiries.map((inq) => {
                      const cleanPhone = (inq.clientPhone || "").replace(/[^0-9]/g, "");
                      const targetPhone = cleanPhone.startsWith("91")
                        ? cleanPhone
                        : cleanPhone.length === 10
                        ? `91${cleanPhone}`
                        : cleanPhone;

                      const waMsg = `Hello ${inq.clientName}, this is Aameena Furniture Solapur regarding your service consultation inquiry for "${inq.serviceType}". We are ready to assist you.`;
                      const waChatUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMsg)}`;

                      return (
                        <tr key={inq.id} className="hover:bg-slate-900/50 transition-colors">
                          {/* Client Details */}
                          <td className="p-4 pl-6">
                            <div className="font-bold text-white text-sm">{inq.clientName}</div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{inq.clientPhone}</span>
                            </div>
                            {inq.clientEmail && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5">
                                <Mail className="w-3 h-3 text-amber-500/70 shrink-0" />
                                <span className="truncate max-w-[180px]">{inq.clientEmail}</span>
                              </div>
                            )}
                          </td>

                          {/* Service Type */}
                          <td className="p-4">
                            <span className="font-bold text-amber-300 block text-xs">
                              {inq.serviceType}
                            </span>
                            {inq.dimensions && (
                              <span className="text-[10px] text-slate-500 block">
                                Scope: {inq.dimensions}
                              </span>
                            )}
                          </td>

                          {/* Wood & Room Type */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-200 border border-amber-800/60 inline-block">
                              {inq.woodChoice || "Grade-A Sagwan Teak"}
                            </span>
                            {inq.roomType && (
                              <span className="text-[10px] text-slate-400 block mt-1">
                                Room: {inq.roomType}
                              </span>
                            )}
                          </td>

                          {/* Budget / Cost */}
                          <td className="p-4">
                            {inq.estimatedCost ? (
                              <span className="font-bold text-white font-mono text-xs">
                                ₹{Number(inq.estimatedCost).toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic">To be estimated</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="p-4 text-[11px] text-slate-400 font-mono">
                            {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="block text-[9px] text-slate-500">
                              {new Date(inq.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="p-4">
                            <select
                              value={inq.status}
                              onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                inq.status === "CONVERTED_TO_ORDER"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : inq.status === "CONSULTATION_SCHEDULED"
                                  ? "bg-sky-950 text-sky-300 border-sky-800"
                                  : inq.status === "ESTIMATE_SENT"
                                  ? "bg-purple-950 text-purple-300 border-purple-800"
                                  : inq.status === "CLOSED"
                                  ? "bg-slate-900 text-slate-400 border-slate-700"
                                  : "bg-amber-950 text-amber-300 border-amber-800"
                              }`}
                            >
                              <option value="PENDING">Pending (New)</option>
                              <option value="CONSULTATION_SCHEDULED">Consultation Scheduled</option>
                              <option value="ESTIMATE_SENT">Estimate / Quote Sent</option>
                              <option value="CONVERTED_TO_ORDER">Converted to Order</option>
                              <option value="CLOSED">Closed / Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inq.notes && (
                                <button
                                  onClick={() => setViewingInquiry(inq)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                                  title="View client notes & details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <a
                                href={waChatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-xs"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                onClick={() => handleDeleteInquiry(inq.id, inq.clientName)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-900/60 transition-colors cursor-pointer"
                                title="Delete inquiry record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Inquiries (10 per page) */}
            {filteredInquiries.length > ITEMS_PER_PAGE && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-white">{(safeInquiryPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-bold text-white">{Math.min(safeInquiryPage * ITEMS_PER_PAGE, filteredInquiries.length)}</span> of{" "}
                  <span className="font-bold text-white">{filteredInquiries.length}</span> inquiries
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeInquiryPage <= 1}
                    onClick={() => setInquiryPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  {Array.from({ length: inquiryTotalPages }, (_, i) => i + 1).map((num) => {
                    if (
                      num === 1 ||
                      num === inquiryTotalPages ||
                      (num >= safeInquiryPage - 1 && num <= safeInquiryPage + 1)
                    ) {
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setInquiryPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            safeInquiryPage === num
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    }
                    if (num === safeInquiryPage - 2 || num === safeInquiryPage + 2) {
                      return (
                        <span key={num} className="px-1 text-slate-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    disabled={safeInquiryPage >= inquiryTotalPages}
                    onClick={() => setInquiryPage((p) => Math.min(p + 1, inquiryTotalPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
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
      {/* TAB 3: CONTACT INQUIRIES (FROM /contact PAGE)                  */}
      {/* ============================================================== */}
      {activeTab === "contact_inquiries" && (
        <div className="space-y-4">
          {/* Search and Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search contact inquiries by customer name, phone, interest, message..."
                value={inquirySearch}
                onChange={(e) => {
                  setInquirySearch(e.target.value);
                  setInquiryPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-500" /> Status:
              </span>
              <select
                value={inquiryStatusFilter}
                suppressHydrationWarning
                onChange={(e) => {
                  setInquiryStatusFilter(e.target.value);
                  setInquiryPage(1);
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {INQUIRY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Inquiries Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
              <table className="w-full text-left text-xs text-slate-300 min-w-[950px]">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Contact Person</th>
                    <th className="p-4">Interested Category</th>
                    <th className="p-4">Customer Message / Inquiry</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedInquiries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-500">
                        {inquirySearch || inquiryStatusFilter !== "ALL"
                          ? "No contact inquiries match your filter criteria."
                          : "No customer inquiries submitted from the Contact Page yet."}
                      </td>
                    </tr>
                  ) : (
                    paginatedInquiries.map((inq) => {
                      const cleanPhone = (inq.clientPhone || "").replace(/[^0-9]/g, "");
                      const targetPhone = cleanPhone.startsWith("91")
                        ? cleanPhone
                        : cleanPhone.length === 10
                        ? `91${cleanPhone}`
                        : cleanPhone;

                      const cleanInterest = (inq.serviceType || "General Consultation").replace(/^Contact:\s*/, "");
                      const waMsg = `Hello ${inq.clientName}, this is Aameena Furniture Solapur regarding your inquiry for "${cleanInterest}". How can we assist you today?`;
                      const waChatUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMsg)}`;

                      return (
                        <tr key={inq.id} className="hover:bg-slate-900/50 transition-colors">
                          {/* Client Details */}
                          <td className="p-4 pl-6">
                            <div className="font-bold text-white text-sm">{inq.clientName}</div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{inq.clientPhone}</span>
                            </div>
                            {inq.clientEmail && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5">
                                <Mail className="w-3 h-3 text-amber-500/70 shrink-0" />
                                <span className="truncate max-w-[180px]">{inq.clientEmail}</span>
                              </div>
                            )}
                          </td>

                          {/* Interested Category */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-block">
                              {cleanInterest}
                            </span>
                          </td>

                          {/* Message */}
                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {inq.notes || <span className="text-slate-500 italic">No additional message provided</span>}
                            </p>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-[11px] text-slate-400 font-mono">
                            {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="block text-[9px] text-slate-500">
                              {new Date(inq.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="p-4">
                            <select
                              value={inq.status}
                              onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                inq.status === "CONVERTED_TO_ORDER"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : inq.status === "CONSULTATION_SCHEDULED"
                                  ? "bg-sky-950 text-sky-300 border-sky-800"
                                  : inq.status === "ESTIMATE_SENT"
                                  ? "bg-purple-950 text-purple-300 border-purple-800"
                                  : inq.status === "CLOSED"
                                  ? "bg-slate-900 text-slate-400 border-slate-700"
                                  : "bg-amber-950 text-amber-300 border-amber-800"
                              }`}
                            >
                              <option value="PENDING">Pending (New)</option>
                              <option value="CONSULTATION_SCHEDULED">Consultation Scheduled</option>
                              <option value="ESTIMATE_SENT">Estimate / Quote Sent</option>
                              <option value="CONVERTED_TO_ORDER">Converted to Order</option>
                              <option value="CLOSED">Closed / Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inq.notes && (
                                <button
                                  onClick={() => setViewingInquiry(inq)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                                  title="View full inquiry message"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <a
                                href={waChatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-xs"
                                title="Chat with customer on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                onClick={() => handleDeleteInquiry(inq.id, inq.clientName)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-900/60 transition-colors cursor-pointer"
                                title="Delete inquiry record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Inquiries (10 per page) */}
            {filteredInquiries.length > ITEMS_PER_PAGE && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-white">{(safeInquiryPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-bold text-white">{Math.min(safeInquiryPage * ITEMS_PER_PAGE, filteredInquiries.length)}</span> of{" "}
                  <span className="font-bold text-white">{filteredInquiries.length}</span> inquiries
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeInquiryPage <= 1}
                    onClick={() => setInquiryPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  {Array.from({ length: inquiryTotalPages }, (_, i) => i + 1).map((num) => {
                    if (
                      num === 1 ||
                      num === inquiryTotalPages ||
                      (num >= safeInquiryPage - 1 && num <= safeInquiryPage + 1)
                    ) {
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setInquiryPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            safeInquiryPage === num
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    }
                    if (num === safeInquiryPage - 2 || num === safeInquiryPage + 2) {
                      return (
                        <span key={num} className="px-1 text-slate-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    disabled={safeInquiryPage >= inquiryTotalPages}
                    onClick={() => setInquiryPage((p) => Math.min(p + 1, inquiryTotalPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold inline-flex items-center gap-1 text-slate-300 transition-colors cursor-pointer"
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
      {/* 🚀 MODAL 1: ADD SERVICE (With Device/Camera Photo Upload)      */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                  Craftsmanship Catalog
                </span>
                <h3 className="text-xl font-bold font-serif text-white mt-0.5">
                  Add New Artisanal Service
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architectural Millwork & Wall Paneling"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tag / Category Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Most Requested, Turnkey B2B, Heritage Craft"
                  value={newService.tag}
                  onChange={(e) => setNewService({ ...newService, tag: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              {/* Image Upload from Device / Camera */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Service Demonstration Photo (Take Photo / Upload File) *</span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose File / Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageFile(e, false)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">Loads from device or phone camera</span>
                </div>

                {newServiceImage && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 w-full h-40">
                    <img src={newServiceImage} alt="Service Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewServiceImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Service Overview & Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain the woodworking craftsmanship, timber seasoning, and warranty details..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Key Deliverables / Features (One per line)
                </label>
                <textarea
                  rows="4"
                  value={newService.features}
                  onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Saving to Database..." : "Publish Service to Website"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ✏️ MODAL 2: EDIT SERVICE                                       */}
      {/* ============================================================== */}
      {showEditModal && selectedServiceForEdit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                  Update Service Details
                </span>
                <h3 className="text-xl font-bold font-serif text-white mt-0.5">
                  Edit Artisanal Service
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Service Title:</label>
                <input
                  type="text"
                  required
                  value={editServiceData.title}
                  onChange={(e) => setEditServiceData({ ...editServiceData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tag / Category Badge:</label>
                <input
                  type="text"
                  value={editServiceData.tag}
                  onChange={(e) => setEditServiceData({ ...editServiceData, tag: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              {/* Edit Photo */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Update Service Photo (Device / Camera)</span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageFile(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                {editServiceImage && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 w-full h-40">
                    <img src={editServiceImage} alt="Service Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditServiceImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Service Description:</label>
                <textarea
                  rows="3"
                  required
                  value={editServiceData.description}
                  onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Key Deliverables (One per line):</label>
                <textarea
                  rows="4"
                  value={editServiceData.features}
                  onChange={(e) => setEditServiceData({ ...editServiceData, features: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Updating Database..." : "Save Service Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🔍 MODAL 3: VIEW INQUIRY DETAILS (SERVICE OR CONTACT)          */}
      {/* ============================================================== */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                  {isContactInquiry(viewingInquiry) ? "Contact Page Submission" : "Bespoke Consultation Record"}
                </span>
                <h3 className="text-xl font-bold font-serif text-white mt-0.5">
                  Inquiry from {viewingInquiry.clientName}
                </h3>
              </div>
              <button
                onClick={() => setViewingInquiry(null)}
                className="p-2 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isContactInquiry(viewingInquiry) ? "Interested In:" : "Service Requested:"}</span>
                  <span className="font-bold text-amber-400">
                    {isContactInquiry(viewingInquiry)
                      ? (viewingInquiry.serviceType || "").replace(/^Contact:\s*/, "")
                      : viewingInquiry.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="font-bold text-emerald-400 font-mono">{viewingInquiry.clientPhone}</span>
                </div>
                {viewingInquiry.clientEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="font-bold text-white">{viewingInquiry.clientEmail}</span>
                  </div>
                )}
                {!isContactInquiry(viewingInquiry) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preferred Wood:</span>
                      <span className="font-bold text-white">{viewingInquiry.woodChoice || "Grade-A Sagwan Teak"}</span>
                    </div>
                    {viewingInquiry.roomType && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Room / Space:</span>
                        <span className="font-bold text-white">{viewingInquiry.roomType}</span>
                      </div>
                    )}
                    {viewingInquiry.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dimensions:</span>
                        <span className="font-bold text-white">{viewingInquiry.dimensions}</span>
                      </div>
                    )}
                    {viewingInquiry.estimatedCost && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Cost:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          ₹{Number(viewingInquiry.estimatedCost).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {viewingInquiry.notes && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">
                    {isContactInquiry(viewingInquiry) ? "Customer Message & Requirement:" : "Consultation Requirement Notes:"}
                  </label>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {viewingInquiry.notes}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={`https://wa.me/${(viewingInquiry.clientPhone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${viewingInquiry.clientName}, regarding your inquiry for "${(viewingInquiry.serviceType || "").replace(/^Contact:\s*/, "")}" at Aameena Furniture Solapur.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp Chat</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewingInquiry(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
