"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function ProductsClient({ initialProducts = [] }) {
  const [products] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFinishes, setSelectedFinishes] = useState({});

  const FINISH_OPTIONS = [
    { id: "natural", name: "Natural Honey Teak", color: "bg-amber-600", border: "border-amber-500" },
    { id: "walnut", name: "Warm Walnut Satin", color: "bg-amber-900", border: "border-amber-800" },
    { id: "espresso", name: "Deep Dark Espresso", color: "bg-stone-900", border: "border-stone-800" },
  ];

  const handleFinishChange = (productId, finish) => {
    setSelectedFinishes((prev) => ({ ...prev, [productId]: finish }));
  };

  const getWhatsAppLink = (product) => {
    const finish = selectedFinishes[product.id] || "Natural Honey Teak";
    const message = `Hello Aameena Furniture, I am interested in ordering the "${product.title}".
- Wood: ${product.woodType}
- Selected Finish: ${finish}
- Listed Price: ₹${product.price?.toLocaleString()}
- Dimensions: ${product.dimensions || "Standard"}

Could you share customization lead time and delivery schedule?`;

    return `https://wa.me/919876500001?text=${encodeURIComponent(message)}`;
  };

  const filteredProducts = products.filter((p) => {
    const catSlug = p.Category?.slug || "general";
    const matchesCategory = selectedCategory === "all" || catSlug === selectedCategory;
    const matchesMaterial =
      selectedMaterial === "all" ||
      p.woodType.toLowerCase().includes(selectedMaterial.toLowerCase());
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.woodType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesMaterial && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>Aameena Furniture Heritage Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Handcrafted Solid Wood Furniture</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
          Artisanal heirloom pieces crafted from seasoned Grade-A Sagwan Teak, Indian Sheesham, and Rosewood.
          Finished with hand-rubbed PU polishes and built with traditional mortise-and-tenon joinery.
        </p>

        {/* Live Search */}
        <div className="pt-4 max-w-xl relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Search sofas, beds, dining tables, teak desks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Collections" },
            { id: "living", label: "Living Room" },
            { id: "bedroom", label: "Bedroom" },
            { id: "dining", label: "Dining Suite" },
            { id: "office", label: "Office & Study" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-900 text-amber-50 shadow-md scale-102"
                  : "bg-amber-50 text-slate-700 hover:bg-amber-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Material Dropdown */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-800" /> Wood Spec:
          </span>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Hardwoods</option>
            <option value="teak">Grade-A Sagwan Teak</option>
            <option value="sheesham">Indian Sheesham</option>
            <option value="rosewood">Indian Rosewood</option>
            <option value="walnut">American Walnut</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4">
          <p className="text-slate-600 text-lg font-medium">No furniture items matched your current filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedMaterial("all");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-full bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const currentFinish = selectedFinishes[product.id] || "Natural Honey Teak";
            const inStock = product.stock > 0;
            const primaryImg =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Tag */}
                  <div className="relative h-64 overflow-hidden bg-amber-50">
                    <img
                      src={primaryImg}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                      {product.woodType}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm ${
                          inStock
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700/60"
                            : "bg-amber-950/90 text-amber-300 border border-amber-700/60"
                        }`}
                      >
                        {inStock ? "Ready to Ship" : "Custom Built to Order"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="capitalize font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                        {product.Category?.name || "Collection"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>5.0 (Artisan Verified)</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-slate-900 line-clamp-1">{product.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {product.description || "Bespoke solid wood construction, finished with eco-friendly polishes."}
                    </p>

                    {/* Finish Swatch Selector */}
                    <div className="pt-2 border-t border-amber-100 space-y-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Select Wood Finish: <span className="text-amber-900 font-bold">{currentFinish}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {FINISH_OPTIONS.map((finish) => {
                          const isSelected = currentFinish === finish.name;
                          return (
                            <button
                              key={finish.id}
                              onClick={() => handleFinishChange(product.id, finish.name)}
                              className={`w-6 h-6 rounded-full ${finish.color} border-2 transition-all ${
                                isSelected ? "ring-2 ring-amber-600 scale-110" : "opacity-75 hover:opacity-100"
                              }`}
                              title={finish.name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{product.price?.toLocaleString()}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{product.compareAtPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 space-y-2">
                  <a
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-700/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
