"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Sparkles, MapPin, CheckCircle2, MessageSquare, ThumbsUp, Filter, Search, Award } from "lucide-react";

export default function AiReviewsPage() {
  const [selectedLocation, setSelectedLocation] = useState("main");
  const [filterRating, setFilterRating] = useState("all");
  const [newReviewText, setNewReviewText] = useState("");
  const [aiSentiment, setAiSentiment] = useState(null);

  const locations = [
    { id: "main", name: "Aameena Furniture Grand Showroom", address: "Main Furniture Hub, Sector 14", rating: 4.9, count: 850 },
    { id: "south", name: "Aameena Furniture South Studio", address: "Interior Market, Ring Road", rating: 4.8, count: 420 },
  ];

  const reviews = [
    {
      id: 1,
      author: "Rajesh Sharma",
      location: "main",
      rating: 5,
      date: "2 days ago",
      text: "The teak wood quality of our 7-seater sofa set is unmatched! Aameena Furniture delivered on time, and their carpenters assembled everything with utmost care.",
      aiAnalysis: "Positive: Excellent wood quality & punctual white-glove installation.",
      verified: true,
    },
    {
      id: 2,
      author: "Priya Nair",
      location: "main",
      rating: 5,
      date: "1 week ago",
      text: "We ordered a custom 6-seater Sheesham dining table. The polish finish and heavy solid wood structure exceeded our expectations.",
      aiAnalysis: "Positive: Outstanding Sheesham polish finish and structural durability.",
      verified: true,
    },
    {
      id: 3,
      author: "Vikram Kapoor",
      location: "south",
      rating: 5,
      date: "2 weeks ago",
      text: "Customized our entire master bedroom wardrobe and king bed. Great interaction with showroom manager. 100% recommended!",
      aiAnalysis: "Positive: High satisfaction with custom wardrobe design & manager communication.",
      verified: true,
    },
    {
      id: 4,
      author: "Ananya Deshmukh",
      location: "south",
      rating: 4,
      date: "1 month ago",
      text: "Solid hardwood sofa set with thick velvet cushioning. Very sturdy and comfortable.",
      aiAnalysis: "Positive: High comfort & sturdy frame construction.",
      verified: true,
    },
  ];

  const handleAnalyzeAiReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    // Simulate AI sentiment engine analysis
    setAiSentiment({
      score: "98% Positive",
      sentiment: "Extremely Positive",
      tags: ["High Teak Quality", "Punctual Delivery", "Polite Installation Staff"],
      summary: "AI model detected high customer enthusiasm regarding solid wood craftsmanship & overall value."
    });
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesLoc = selectedLocation === "all" || r.location === selectedLocation;
    const matchesRating = filterRating === "all" || r.rating === parseInt(filterRating);
    return matchesLoc && matchesRating;
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-800/80 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI-Powered Location Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif">Google Maps Reviews & AI Sentiment Hub</h1>
        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">
          Real-time aggregated customer feedback across Aameena Furniture showroom locations, analyzed by AI to guarantee 100% quality and satisfaction.
        </p>
      </div>

      {/* AI Sentiment Overview Banner */}
      <div className="bg-white rounded-3xl p-8 border border-amber-200/80 shadow-md grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        <div className="space-y-2 text-center lg:text-left">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Overall Google Rating</span>
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <span className="text-5xl font-extrabold text-slate-900 font-serif">4.9</span>
            <div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">Based on 1,270+ Verified Reviews</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-amber-50/70 p-6 rounded-2xl border border-amber-100 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>AI Location Summary Insight:</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            AI analysis across Google Maps locations reveals <strong>99.2% positive sentiment</strong> on Teak wood durability, <strong>97.8% satisfaction</strong> on delivery speed, and high praise for custom furniture finish quality.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">#SolidTeakWood</span>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full">#OnTimeDelivery</span>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full">#CustomCraftsmanship</span>
          </div>
        </div>

      </div>

      {/* Showroom Location Selector */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900">Select Showroom Location:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                selectedLocation === loc.id
                  ? "bg-amber-900 text-amber-50 border-amber-800 shadow-md"
                  : "bg-white text-slate-800 border-amber-200 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Google Location</span>
                <span className="text-xs font-bold bg-amber-500 text-amber-950 px-2.5 py-0.5 rounded-full">
                  ★ {loc.rating}
                </span>
              </div>
              <h3 className="text-base font-bold font-serif mt-2">{loc.name}</h3>
              <p className={`text-xs mt-1 ${selectedLocation === loc.id ? "text-amber-200" : "text-slate-500"}`}>
                {loc.address} ({loc.count} reviews)
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-slate-900">Verified Customer Google Reviews</h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Filter Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-white border border-amber-200 rounded-lg px-2.5 py-1 font-medium focus:outline-none"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl p-6 border border-amber-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-800 text-amber-50 font-bold flex items-center justify-center text-sm font-serif">
                    {review.author[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{review.author}</h3>
                    <p className="text-xs text-slate-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">"{review.text}"</p>

              {/* AI Badge Tag */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">AI Sentiment Tag:</span>
                  <span>{review.aiAnalysis}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Review Submission Simulator */}
      <div className="bg-white rounded-3xl p-8 border border-amber-200/80 shadow-md space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-900">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Test AI Sentiment Review Analyzer</h2>
            <p className="text-xs text-slate-500">Type your furniture feedback to analyze AI sentiment instant score.</p>
          </div>
        </div>

        <form onSubmit={handleAnalyzeAiReview} className="space-y-4">
          <textarea
            rows="3"
            placeholder="Write your review experience about Aameena Furniture (e.g. The teak dining set quality is amazing and delivery was fast!)..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run AI Review Analysis</span>
          </button>
        </form>

        {aiSentiment && (
          <div className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl space-y-3 border border-emerald-800 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>AI Sentiment Result:</span>
              <span className="bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded">{aiSentiment.score}</span>
            </div>
            <p className="text-sm font-semibold text-white">{aiSentiment.sentiment}</p>
            <p className="text-xs text-emerald-200 leading-relaxed">{aiSentiment.summary}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {aiSentiment.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-emerald-900 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-700">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
