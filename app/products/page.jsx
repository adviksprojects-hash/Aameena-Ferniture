"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowUpDown, 
  Eye, 
  Sparkles 
} from "lucide-react";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("all");

  const productsList = [
    {
      id: 1,
      name: "Royal Teak Wood 7-Seater Sofa Set",
      category: "living",
      price: 85000,
      originalPrice: 110000,
      rating: 4.9,
      reviews: 142,
      material: "teak",
      materialName: "Grade-A Sagwan Teak",
      inStock: true,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
      description: "Handcrafted 7-seater living sofa with royal teak structure & water-repellent velvet fabric."
    },
    {
      id: 2,
      name: "Imperial Handcarved King Bed with Storage",
      category: "bedroom",
      price: 62500,
      originalPrice: 78000,
      rating: 5.0,
      reviews: 98,
      material: "sheesham",
      materialName: "Sheesham Solid Hardwood",
      inStock: true,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      description: "Heavy solid Sheesham bed with hydraulic hydraulic storage box and cushioned headboard."
    },
    {
      id: 3,
      name: "Monarch 6-Seater Teak Dining Table Set",
      category: "dining",
      price: 54000,
      originalPrice: 68000,
      rating: 4.8,
      reviews: 86,
      material: "teak",
      materialName: "Solid Teak Wood",
      inStock: true,
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
      description: "6-seater dining table with ergonomically cushioned high-back wooden chairs."
    },
    {
      id: 4,
      name: "Heritage Wooden 4-Door Wardrobe",
      category: "bedroom",
      price: 48900,
      originalPrice: 59000,
      rating: 4.9,
      reviews: 64,
      material: "teak",
      materialName: "Teak Hardwood",
      inStock: true,
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
      description: "Spacious 4-door wardrobe with full-length mirror and internal digital locker compartment."
    },
    {
      id: 5,
      name: "Executive Reclining Armchair",
      category: "living",
      price: 24500,
      originalPrice: 32000,
      rating: 4.7,
      reviews: 51,
      material: "leatherette",
      materialName: "Teak Frame & Leatherette",
      inStock: true,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      description: "Ultra-comfortable recliner chair for modern living rooms and executive study."
    },
    {
      id: 6,
      name: "Contemporary Teak Center Table with Drawers",
      category: "living",
      price: 18500,
      originalPrice: 24000,
      rating: 4.8,
      reviews: 73,
      material: "teak",
      materialName: "Sagwan Teak",
      inStock: true,
      image: "https://images.unsplash.com/photo-1533779283484-8da696530a65?auto=format&fit=crop&w=600&q=80",
      description: "Minimalist coffee table with glass top and dual concealed storage drawers."
    }
  ];

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesMaterial = selectedMaterial === "all" || product.material === selectedMaterial;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMaterial && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Aameena Furniture Catalog</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Handcrafted Solid Wood Furniture</h1>
        <p className="text-amber-200/90 text-sm max-w-2xl">
          Browse our extensive collection of Sagwan Teak Wood and Sheesham hardwood furniture, built for durability and elegance.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-xl relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Search sofas, beds, dining tables, wardrobes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-amber-900/80 border border-amber-700/80 text-amber-50 placeholder-amber-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm">
        
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "living", "bedroom", "dining"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-800 text-amber-50 shadow-sm"
                  : "bg-amber-50 text-slate-700 hover:bg-amber-100"
              }`}
            >
              {cat === "all" ? "All Categories" : `${cat} Room`}
            </button>
          ))}
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-800" /> Wood Material:
          </span>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Woods</option>
            <option value="teak">Grade-A Sagwan Teak</option>
            <option value="sheesham">Sheesham Hardwood</option>
            <option value="leatherette">Leatherette / Fabric</option>
          </select>
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-4">
          <p className="text-slate-500 text-lg font-medium">No furniture items matched your search criteria.</p>
          <button
            onClick={() => { setSelectedCategory("all"); setSelectedMaterial("all"); setSearchQuery(""); }}
            className="px-6 py-2.5 rounded-full bg-amber-800 text-white text-xs font-bold hover:bg-amber-900"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-amber-900/90 text-amber-100 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {product.materialName}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="capitalize font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                      {product.category} Room
                    </span>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{product.rating} ({product.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{product.description}</p>

                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/contact?inquiry=${encodeURIComponent(product.name)}`}
                  className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire / Request Customization</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
