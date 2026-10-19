"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  FileText,
  Tag,
  User,
  Image as ImageIcon,
  Upload,
  Loader2,
  Check
} from "lucide-react";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishBlogPost
} from "@/actions/blogActions";

const BLOG_CATEGORIES = [
  "Woodcraft & Design",
  "Maintenance & Care",
  "Turnkey Interiors",
  "Artisan Stories",
  "Showroom Updates",
  "Material Comparison",
];

const IMAGE_PRESETS = [
  { label: "Living Room Teak", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80" },
  { label: "Master Bedroom", url: "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80" },
  { label: "Dining Suite", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80" },
  { label: "Office & Study", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80" },
];

export default function BlogManagementView({ userRole = "ADMIN" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Woodcraft & Design");
  const [authorName, setAuthorName] = useState("Aameena Furniture Artisans");
  const [authorRole, setAuthorRole] = useState("Master Craftsman");
  const [readTimeMinutes, setReadTimeMinutes] = useState(4);
  const [coverImage, setCoverImage] = useState("/images/categories/living.jpg");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Cover Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit. Please choose a smaller photo.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blogs");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setCoverImage(data.url);
        setUploadError("");
      } else {
        setUploadError(data.error || "Failed to upload cover photo.");
      }
    } catch (err) {
      console.error("Cover image upload error:", err);
      setUploadError(err.message || "Network error uploading image");
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await getBlogPosts({ onlyPublished: false, limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to load blog posts." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setCategory("Woodcraft & Design");
    setAuthorName("Aameena Furniture Artisans");
    setAuthorRole("Master Craftsman");
    setReadTimeMinutes(4);
    setCoverImage("/images/categories/living.jpg");
    setExcerpt("");
    setContent("");
    setTagsStr("Sagwan Teak, Handcrafted Furniture, Wood Care");
    setIsFeatured(false);
    setIsPublished(true);
    setSeoTitle("");
    setSeoDesc("");
    setSeoKeywords("");
    setIsUploadingImage(false);
    setUploadError("");
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setTitle(post.title || "");
    setSlug(post.slug || "");
    setCategory(post.category || "Woodcraft & Design");
    setAuthorName(post.authorName || "Aameena Furniture Artisans");
    setAuthorRole(post.authorRole || "Master Craftsman");
    setReadTimeMinutes(post.readTimeMinutes || 4);
    setCoverImage(post.coverImage || "/images/categories/living.jpg");
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setTagsStr(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setIsFeatured(Boolean(post.isFeatured));
    setIsPublished(Boolean(post.isPublished));
    setSeoTitle(post.seoTitle || "");
    setSeoDesc(post.seoDesc || "");
    setSeoKeywords(post.seoKeywords || "");
    setIsUploadingImage(false);
    setUploadError("");
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (!title.trim()) return;
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug: slug.trim() || undefined,
        category,
        authorName,
        authorRole,
        readTimeMinutes: Number(readTimeMinutes) || 4,
        coverImage,
        excerpt,
        content,
        tags: tagsArray,
        isFeatured,
        isPublished,
        seoTitle: seoTitle || undefined,
        seoDesc: seoDesc || undefined,
        seoKeywords: seoKeywords || undefined,
      };

      let res;
      if (editingPost) {
        res = await updateBlogPost(editingPost.id, payload);
      } else {
        res = await createBlogPost(payload);
      }

      if (res.success) {
        setFeedback({
          type: "success",
          message: editingPost ? `Updated "${title}" successfully!` : `Created article "${title}" successfully!`,
        });
        setIsModalOpen(false);
        await loadPosts();
        setTimeout(() => setFeedback(null), 5000);
      } else {
        alert(res.error || "Failed to save article.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id, postTitle) => {
    if (!confirm(`Are you sure you want to permanently delete "${postTitle}"?`)) return;
    try {
      const res = await deleteBlogPost(id);
      if (res.success) {
        setFeedback({ type: "success", message: `Deleted "${postTitle}".` });
        await loadPosts();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(res.error || "Failed to delete post");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await togglePublishBlogPost(id);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublished: !currentStatus } : p))
        );
        setFeedback({
          type: "success",
          message: !currentStatus ? "Article is now LIVE on public /blog!" : "Article converted to Draft (hidden from public).",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(res.error || "Failed to toggle status");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.isPublished).length;
  const draftCount = totalCount - publishedCount;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Blog &amp; SEO Content Desk
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Publish educational guides, woodcraft tips, and product insights to improve Google SEO ranking and inform clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Write New Article</span>
          </button>

          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <span>View Live Blog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Articles</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Live &amp; Published</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{publishedCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Drafts</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{draftCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Reader Views</span>
          <span className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1 block">{totalViews.toLocaleString()}</span>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
            feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, excerpt..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase shrink-0">Category:</span>
          {["All", ...BLOG_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / Cards */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p>Loading blog articles from database...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-800 dark:text-slate-300 text-sm">No Articles Found</p>
            <p>Click &quot;+ Write New Article&quot; above to publish your first post.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="p-4">Article</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    {/* Title & Thumbnail */}
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <img
                          src={post.coverImage || "/images/categories/living.jpg"}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {post.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase">
                                ★ Featured
                              </span>
                            )}
                            <strong className="text-slate-900 dark:text-white font-bold line-clamp-1 block text-xs">
                              {post.title}
                            </strong>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block mt-0.5">
                            /blog/{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-950 text-amber-800 dark:text-amber-300 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="p-4">
                      <div className="text-[11px]">
                        <span className="text-slate-900 dark:text-white font-medium block">{post.authorName}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">{post.authorRole}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(post.id, post.isPublished)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer border ${
                          post.isPublished
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {post.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-slate-200">
                      {(post.viewsCount || 0).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition"
                          title="View Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(post)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-amber-800 dark:text-amber-400 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-950 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ARTICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPost ? `Edit Article: ${editingPost.title}` : "Write New Handcrafted Wood Blog Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePost} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Article Title *:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      if (!slug) handleGenerateSlug();
                    }}
                    placeholder="e.g. Why Certified CP Sagwan Teak Outlasts Commercial Plywood by Generations"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      URL Slug (Permanent SEO link):
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">/blog/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="why-certified-sagwan-teak-outlasts-plywood"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="mt-4 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer"
                  >
                    Auto-Generate
                  </button>
                </div>
              </div>

              {/* Category, Author, Read Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white cursor-pointer"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Author Name &amp; Role:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Master Artisan"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Head Carver"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Estimated Read Time (Mins):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cover Image Upload & Customizer */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Article Cover Image *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    {showUrlInput ? "Hide Presets & Direct URL" : "Presets / Direct URL"}
                  </button>
                </div>

                {/* Upload Button & Action Controls */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <label
                      htmlFor="blog-cover-file-input"
                      className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition text-xs font-bold ${
                        isUploadingImage
                          ? "border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-wait"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                      }`}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
                          <span>Uploading image to server...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Upload Image from Device / Computer</span>
                        </>
                      )}
                      <input
                        id="blog-cover-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={handleFileUpload}
                      />
                    </label>

                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="px-3 py-3 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Remove current cover image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>

                {/* Live Preview Box */}
                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-900 group">
                    <img
                      src={coverImage}
                      alt="Article Cover Preview"
                      className="w-full h-36 object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-2.5">
                      <div className="flex items-center justify-between w-full text-white text-[10px]">
                        <span className="truncate max-w-[75%] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10">
                          {coverImage}
                        </span>
                        <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-3.5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
                    No image uploaded yet. Click above to upload any image file from your device.
                  </div>
                )}

                {/* Optional Manual URL & Presets Dropdown */}
                {showUrlInput && (
                  <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      Or paste an image URL directly:
                    </label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="e.g. /images/categories/living.jpg or https://..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white text-xs font-mono"
                    />
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Quick Presets:</span>
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setCoverImage(preset.url)}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-amber-800 dark:text-amber-300 font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Article Excerpt / Summary (Used for Google snippet &amp; cards):
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 2-sentence preview of the article..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white text-xs leading-relaxed"
                />
              </div>

              {/* Full Content (Markdown format) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Article Full Content (Markdown format supported) *:
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Use ### for Headings, #### for Subheadings, - for bullets
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="### Section Heading&#10;&#10;Write detailed architectural insights here...&#10;&#10;#### Key Benefits&#10;- Natural moisture resistance&#10;- Mortise and tenon joinery&#10;- Lifelong heirloom value"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Tags & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Tags (Comma separated):
                  </label>
                  <input
                    type="text"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    placeholder="Sagwan Teak, Plywood, Furniture Care"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    SEO Keywords (For Meta Tags):
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="teak wood guide, buy teak furniture solapur"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Toggles: Featured & Published */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    ★ Feature this article as Hero Spotlight on /blog
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                    ✓ Publish Live to Public Website
                  </span>
                </label>
              </div>

              {/* Fixed Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Saving Article..." : editingPost ? "Save Changes" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
