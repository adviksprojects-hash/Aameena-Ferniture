import Link from "next/link";
import { getBlogPosts } from "@/actions/blogActions";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Tag, 
  Compass, 
  Share2, 
  Flame,
  Award
} from "lucide-react";

export const metadata = {
  title: "Woodcraft Journal & Furniture Design Blog | Aameena Furniture Solapur",
  description: "Expert guides on solid CP Sagwan Teak woodcraft, furniture preservation, turnkey interior planning, and heirloom carpentry insights from Solapur's master artisans.",
  keywords: "teak wood furniture blog, solid wood care guide, turnkey interiors solapur, furniture craftsmanship articles, sagwan furniture guide",
  openGraph: {
    title: "Woodcraft Journal & Furniture Design Blog | Aameena Furniture",
    description: "Expert guides on solid CP Sagwan Teak woodcraft, seasonal care, and turnkey interior planning.",
    type: "website",
    url: "https://aameenafurniture.com/blog",
  },
};

export const revalidate = 60; // ISR cache revalidation

export default async function BlogPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams?.category || "All";
  const query = resolvedParams?.q || "";

  const res = await getBlogPosts({
    category: activeCategory === "All" ? undefined : activeCategory,
    search: query || undefined,
    onlyPublished: true,
  });

  const posts = res?.success && Array.isArray(res.data) ? res.data : [];

  const categories = [
    "All",
    "Woodcraft & Design",
    "Maintenance & Care",
    "Turnkey Interiors",
    "Artisan Stories",
    "Showroom Updates",
  ];

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];
  const regularPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-slate-900 dark:text-stone-100 transition-colors">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-amber-50 pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Artisan Journal &amp; Design Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-tight">
            Knowledge of Pure Wood, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
              Craftsmanship &amp; Living
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-amber-200/90 text-sm sm:text-base leading-relaxed">
            Essential architectural guides, timber preservation techniques, and insights into authentic solid Sagwan Teak joinery directly from our Solapur master workshop.
          </p>

          {/* Quick Search */}
          <form action="/blog" method="GET" className="max-w-lg mx-auto pt-4">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search articles on Teak, Plywood, Polishes, Turnkey packages..."
                className="w-full py-3.5 pl-11 pr-24 rounded-2xl bg-amber-900/60 border border-amber-700/80 text-white placeholder-amber-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-md shadow-xl"
              />
              <Search className="w-4 h-4 text-amber-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 border-amber-600 dark:border-amber-400 shadow-md"
                    : "bg-white dark:bg-stone-900 text-slate-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 shadow-xs"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Featured Post Card (if available and no search filter) */}
        {!query && featuredPost && (
          <div className="relative group rounded-3xl overflow-hidden border border-amber-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Cover Image */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[300px] overflow-hidden bg-stone-100 dark:bg-stone-950">
                <img
                  src={featuredPost.coverImage || "/images/categories/living.jpg"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Featured Article</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{featuredPost.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-slate-600 dark:text-stone-300 text-sm leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0">
                      {featuredPost.authorName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {featuredPost.authorName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-stone-400 block">
                        {featuredPost.authorRole}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>{query ? `Search Results for "${query}"` : "Latest Woodcraft Articles"}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-stone-400">
              Showing {posts.length} {posts.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <Compass className="w-12 h-12 text-slate-400 dark:text-stone-500 mx-auto" />
              <h4 className="text-lg font-bold text-slate-800 dark:text-stone-200">No Articles Found</h4>
              <p className="text-xs text-slate-500 dark:text-stone-400 max-w-md mx-auto">
                No articles matching your current filter. Try searching for a different keyword or view all categories.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-stone-100 dark:bg-stone-950">
                      <img
                        src={post.coverImage || "/images/categories/living.jpg"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{post.readTimeMinutes} min</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0 border-t border-stone-100 dark:border-stone-800/80 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-stone-400 font-medium">
                      By {post.authorName}
                    </span>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter & Showroom Visit Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 p-8 sm:p-10 border border-amber-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Experience Handcrafted Excellence in Solapur
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              Visiting Solapur? Tour Our Master Wood Workshop
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              Touch genuine seasoned CP Sagwan Teak grains, consult with our master artisans, and view full room suites assembled right on the workshop floor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition text-center shadow-md cursor-pointer"
            >
              Book Showroom Visit
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl border border-amber-400/40 hover:bg-amber-900/60 text-amber-200 text-xs font-bold transition text-center cursor-pointer"
            >
              Explore Turnkey Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
