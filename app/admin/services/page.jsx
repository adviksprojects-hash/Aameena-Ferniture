"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getAdminServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "@/actions/serviceAdminActions";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

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

  const loadServices = async () => {
    setLoading(true);
    const res = await getAdminServices();
    if (res.success) {
      setServices(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
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
      features: Array.isArray(service.features) ? service.features.join("\n") : "",
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
      setMessage({ type: "success", text: "Service updated successfully!" });
      setShowEditModal(false);
      await loadServices();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update service." });
    }
    setSubmitting(false);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
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
      await loadServices();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create service." });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
            Super Admin Operations • Solapur Hub
          </span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">
            Artisanal Service Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, edit, or remove bespoke craftsmanship services, architectural woodworking offerings, and upload custom demonstration photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadServices}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setNewServiceImage(null);
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Services Grid */}
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      srv.isActive
                        ? "bg-slate-900 text-slate-400 hover:text-white"
                        : "bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
                    }`}
                  >
                    {srv.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{srv.isActive ? "Hide from Users" : "Show on Storefront"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(srv)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1 border border-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      disabled={isUpdating}
                      onClick={() => handleDelete(srv)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/80 text-red-300 font-bold text-xs flex items-center gap-1 border border-red-900/40"
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

              {/* 📸 Image Upload from Device / Camera */}
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
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
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
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md disabled:opacity-50"
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

              {/* 📸 Edit Photo */}
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
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
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
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? "Updating Database..." : "Save Service Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
