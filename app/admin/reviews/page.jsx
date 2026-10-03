"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Star,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Filter,
  X,
  Database,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import {
  getAdminReviewQuotes,
  createReviewQuote,
  updateReviewQuote,
  deleteReviewQuote,
  seedBulkReviewPool,
} from "@/actions/reviewActions";
import SearchableSelect from "@/components/SearchableSelect";

export default function AdminReviewsPage() {
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({ totalQuotes: 0, star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 });
  const [selectedRating, setSelectedRating] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeEditQuote, setActiveEditQuote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    rating: 5,
    category: "LIVING_SOFA",
    quoteText: "",
    authorHint: "",
    experienceType: "PURCHASED",
    productPurchased: "",
  });

  const CATEGORY_OPTIONS = [
    { value: "LIVING_SOFA", label: "Living Room Sofa & Recliner" },
    { value: "BEDROOM", label: "Bedroom Storage & King Bed" },
    { value: "DINING", label: "Dining Suite & Chairs" },
    { value: "CUSTOM_MANDIR", label: "Hand-Carved Wooden Mandir" },
    { value: "OFFICE_STUDY", label: "Study Desk & Bookshelf" },
    { value: "SHOWROOM_VISIT", label: "Showroom Tour & Consultation" },
    { value: "WORKSHOP_INSPECTION", label: "Raw Timber Seasoning Tour" },
    { value: "CUSTOM_VILLA", label: "Full Turnkey Hardwood Package" },
  ];

  const loadQuotes = async () => {
    setLoading(true);
    const res = await getAdminReviewQuotes({
      rating: selectedRating === "ALL" ? null : Number(selectedRating),
      search: searchQuery,
      limit: 100,
    });
    if (res.success) {
      setQuotes(res.quotes);
      if (res.stats) setStats(res.stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuotes();
  }, [selectedRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuotes();
  };

  const handleBulkSeed = async () => {
    if (!confirm("Seed or update the database with 100+ authentic reviews across all star ratings?")) return;
    setSeeding(true);
    const res = await seedBulkReviewPool();
    setSeeding(false);
    if (res.success) {
      setToastMessage({
        type: "success",
        text: `Successfully synced database! Total ${res.totalCount} review prompts available.`,
      });
      await loadQuotes();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage({ type: "error", text: res.error || "Failed to seed review pool." });
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createReviewQuote(formData);
    setSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setFormData({
        rating: 5,
        category: "LIVING_SOFA",
        quoteText: "",
        authorHint: "",
        experienceType: "PURCHASED",
        productPurchased: "",
      });
      setToastMessage({ type: "success", text: "New review prompt added to database!" });
      await loadQuotes();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage({ type: "error", text: res.error || "Failed to create prompt." });
    }
  };

  const handleEditPrompt = async (e) => {
    e.preventDefault();
    if (!activeEditQuote) return;
    setSubmitting(true);
    const res = await updateReviewQuote(activeEditQuote.id, activeEditQuote);
    setSubmitting(false);

    if (res.success) {
      setShowEditModal(false);
      setActiveEditQuote(null);
      setToastMessage({ type: "success", text: "Review prompt updated successfully!" });
      await loadQuotes();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage({ type: "error", text: res.error || "Failed to update prompt." });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this review prompt?")) return;
    const res = await deleteReviewQuote(id);
    if (res.success) {
      setToastMessage({ type: "success", text: "Review prompt deleted." });
      setQuotes(quotes.filter((q) => q.id !== id));
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage({ type: "error", text: res.error || "Failed to delete prompt." });
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 border ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-800"
              : "bg-red-950/90 text-red-300 border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Customer Experience & Conversion
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">
            AI Review Prompts Database
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Store 100–200 authentic reviews. When customers visit{" "}
            <span className="text-amber-400 font-mono">/ai-reviews</span>, they choose a 1–5 star rating and are presented with exactly 5 randomized prompts with 1-tap copy and direct Google Maps Solapur redirect.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkSeed}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/60 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Populate or restore authentic reviews pool in database"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{seeding ? "Syncing Pool..." : "Seed 100+ Reviews"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review Prompt</span>
          </button>
        </div>
      </div>

      {/* Star Rating Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedRating("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRating === "ALL"
              ? "bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block">All Prompts</span>
          <span className="text-2xl font-bold font-serif text-white block mt-0.5">{stats.totalQuotes}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Full database pool</span>
        </button>

        {[
          { rating: 5, count: stats.star5, color: "text-amber-400", label: "5 Stars" },
          { rating: 4, count: stats.star4, color: "text-amber-300", label: "4 Stars" },
          { rating: 3, count: stats.star3, color: "text-amber-200", label: "3 Stars" },
          { rating: 2, count: stats.star2, color: "text-amber-100", label: "2 Stars" },
          { rating: 1, count: stats.star1, color: "text-slate-300", label: "1 Star" },
        ].map((item) => (
          <button
            key={item.rating}
            onClick={() => setSelectedRating(String(item.rating))}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedRating === String(item.rating)
                ? "bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
            </div>
            <span className="text-2xl font-bold font-serif text-white block mt-0.5">{item.count}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Saved prompts</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search review keywords, client or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">
            Showing <strong className="text-white">{quotes.length}</strong> prompts
          </span>
          <button
            onClick={loadQuotes}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Prompts Cards / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
          Loading review prompts from PostgreSQL...
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-white font-serif">No Review Prompts Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No prompts found matching current filter. Click "Seed 100+ Reviews" to populate default curated pool or add your own custom prompt.
          </p>
          <button
            onClick={handleBulkSeed}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
          >
            Seed 100+ Reviews Pool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-slate-950 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= q.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                      {q.rating} Star Rating
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {q.category?.replace(/_/g, " ") || "GENERAL"}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium line-clamp-4">
                  "{q.quoteText}"
                </p>

                {q.authorHint && (
                  <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                    <span>—</span>
                    <span>{q.authorHint}</span>
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  {q.experienceType === "VISITED" ? "📍 Showroom / Tour" : "📦 Purchased Item"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(q.quoteText, q.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                    title="Copy review text"
                  >
                    {copiedId === q.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveEditQuote(q);
                      setShowEditModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/70 text-slate-300 hover:text-amber-300 transition-colors"
                    title="Edit prompt"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/70 text-slate-300 hover:text-red-400 transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Review Prompt */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Add Review Prompt</h3>
                <p className="text-xs text-slate-400">Creates an authentic review suggestion for customers.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePrompt} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Star Rating (1 to 5 Stars) *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-1 font-bold ${
                        formData.rating === star
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <SearchableSelect
                label="Product / Craft Category"
                dark={true}
                options={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                allowOther={true}
                otherPlaceholder="Enter custom furniture category..."
              />

              <div>
                <label className="text-slate-300 font-bold block mb-1">Review Prompt Content *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g. Exceptional Sagwan teak craftsmanship! Mortise-and-tenon joints are flawless and the 7-step PU polish finish is stunning..."
                  value={formData.quoteText}
                  onChange={(e) => setFormData({ ...formData, quoteText: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                ></textarea>
                <span className="text-[10px] text-slate-500">
                  {formData.quoteText.length} characters (minimum 5 required)
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Author / City Hint (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kulkarni, Solapur"
                  value={formData.authorHint}
                  onChange={(e) => setFormData({ ...formData, authorHint: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Review Prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Review Prompt */}
      {showEditModal && activeEditQuote && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Edit Review Prompt</h3>
                <p className="text-xs text-slate-400">Update prompt wording or star rating.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setActiveEditQuote(null);
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditPrompt} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Star Rating (1 to 5 Stars) *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setActiveEditQuote({ ...activeEditQuote, rating: star })}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-1 font-bold ${
                        activeEditQuote.rating === star
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <SearchableSelect
                label="Product / Craft Category"
                dark={true}
                options={CATEGORY_OPTIONS}
                value={activeEditQuote.category}
                onChange={(val) => setActiveEditQuote({ ...activeEditQuote, category: val })}
                allowOther={true}
                otherPlaceholder="Enter custom furniture category..."
              />

              <div>
                <label className="text-slate-300 font-bold block mb-1">Review Prompt Content *</label>
                <textarea
                  rows="4"
                  required
                  value={activeEditQuote.quoteText}
                  onChange={(e) => setActiveEditQuote({ ...activeEditQuote, quoteText: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Author / City Hint (Optional)</label>
                <input
                  type="text"
                  value={activeEditQuote.authorHint || ""}
                  onChange={(e) => setActiveEditQuote({ ...activeEditQuote, authorHint: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setActiveEditQuote(null);
                  }}
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
