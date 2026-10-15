import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/actions/blogActions";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  Sofa, 
  Sparkles,
  BookOpen,
  ArrowRight
} from "lucide-react";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const res = await getBlogPostBySlug(resolved.slug);
  if (!res?.success || !res?.data) {
    return { title: "Article Not Found | Aameena Furniture" };
  }
  const post = res.data;
  return {
    title: `${post.seoTitle || post.title} | Aameena Furniture Solapur`,
    description: post.seoDesc || post.excerpt,
    keywords: post.seoKeywords || `${post.category}, teak furniture, solapur woodworking, aameena furniture`,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      images: post.coverImage ? [post.coverImage] : ["/images/categories/living.jpg"],
    },
  };
}

export default async function BlogPostDetailPage({ params }) {
  const resolved = await params;
  const res = await getBlogPostBySlug(resolved.slug);

  if (!res?.success || !res?.data || (!res.data.isPublished)) {
    notFound();
  }

  const post = res.data;

  // Fetch more articles for the bottom recommendation rail
  const recentRes = await getBlogPosts({ limit: 4, onlyPublished: true });
  const relatedArticles = (recentRes?.data || []).filter((p) => p.slug !== post.slug).slice(0, 3);

  // JSON-LD Structured Data for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? `https://aameenafurniture.com${post.coverImage}` : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "Aameena Furniture & Furnishing",
      logo: {
        "@type": "ImageObject",
        url: "https://aameenafurniture.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://aameenafurniture.com/blog/${post.slug}`,
    },
  };

  const shareText = encodeURIComponent(`*${post.title}* - Read this insightful guide from Aameena Furniture: https://aameenafurniture.com/blog/${post.slug}`);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  // Helper to render markdown-like content blocks with rich typography
  const renderFormattedContent = (contentStr) => {
    const blocks = contentStr.split("\n\n");
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white mt-8 mb-4 tracking-tight">
            {trimmed.replace(/^###\s+/, "")}
          </h2>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-bold font-serif text-amber-900 dark:text-amber-400 mt-6 mb-3">
            {trimmed.replace(/^####\s+/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s+/, ""));
        return (
          <ul key={idx} className="space-y-2 my-4 pl-4 list-disc text-slate-700 dark:text-stone-300">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-slate-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed my-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="min-h-screen bg-stone-50 dark:bg-stone-950 text-slate-900 dark:text-stone-100 transition-colors">
      {/* Inject Google SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <nav className="flex items-center gap-2 text-slate-500 dark:text-stone-400">
            <Link href="/" className="hover:text-amber-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-amber-600 transition">
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-stone-200 font-medium truncate max-w-[200px] sm:max-w-xs">
              {post.title}
            </span>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:underline font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 space-y-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/40">
            {post.category}
          </span>
          <span className="text-xs text-slate-500 dark:text-stone-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{post.readTimeMinutes} min read</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-slate-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed font-sans">
          {post.excerpt}
        </p>

        {/* Author Bio Banner & Share */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-serif font-black text-sm flex items-center justify-center shadow-md">
              {post.authorName?.charAt(0) || "A"}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                {post.authorName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-stone-400 block">
                {post.authorRole} • Aameena Furniture Solapur
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 h-64 sm:h-96 lg:h-[460px]">
          <img
            src={post.coverImage || "/images/categories/living.jpg"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="prose prose-stone dark:prose-invert max-w-none">
          {renderFormattedContent(post.content)}
        </div>

        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-stone-400">Tags:</span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* In-Article Showroom Contact Card */}
        <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 shadow-xl border border-amber-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
              Consult Our Master Artisans for Your Home
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            Interested in handcrafted solid Sagwan Teak dining sets, living room suites, or modular wardrobes? We deliver and assemble across Maharashtra with factory direct guarantees.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition text-center shadow-md cursor-pointer"
            >
              Explore Furniture Catalog
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl border border-amber-400/40 hover:bg-amber-900/60 text-amber-200 text-xs font-bold transition text-center cursor-pointer"
            >
              Direct Showroom Inquiry
            </Link>
          </div>
        </div>
      </div>

      {/* Related Articles Rail */}
      {relatedArticles.length > 0 && (
        <section className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Related Articles &amp; Guides</span>
              </h3>
              <Link href="/blog" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
                View All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((art) => (
                <article
                  key={art.id}
                  className="group bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-40 overflow-hidden bg-stone-200 dark:bg-stone-900">
                    <img
                      src={art.coverImage || "/images/categories/living.jpg"}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-amber-300 uppercase">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white group-hover:text-amber-700 line-clamp-2">
                      <Link href={`/blog/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{art.readTimeMinutes} min read</span>
                    <Link
                      href={`/blog/${art.slug}`}
                      className="font-bold text-amber-700 dark:text-amber-400 group-hover:underline flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
