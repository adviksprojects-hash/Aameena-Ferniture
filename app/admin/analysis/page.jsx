import { BarChart3, TrendingUp, DollarSign, ArrowUpRight, ShoppingBag } from "lucide-react";

export default function AdminAnalysisPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Business Intelligence</span>
        <h1 className="text-2xl font-bold font-serif text-white mt-1">Sales & Revenue Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Growth charts, top selling furniture categories, and financial metrics.</p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Monthly Sales Target</span>
          <p className="text-3xl font-extrabold text-white font-serif">86% Achieved</p>
          <p className="text-xs text-emerald-400 font-semibold">₹48.95L / ₹55.00L Goal</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Top Performing Category</span>
          <p className="text-3xl font-extrabold text-amber-400 font-serif">Sagwan Teak Sofas</p>
          <p className="text-xs text-slate-400">42% of Total Sales Revenue</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Average Order Value</span>
          <p className="text-3xl font-extrabold text-white font-serif">₹67,500</p>
          <p className="text-xs text-emerald-400 font-semibold">+8.5% higher ticket size</p>
        </div>
      </div>

      {/* Category Sales Breakdown */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold font-serif text-white">Furniture Revenue Share</h3>
        
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Living Room Sofas & Center Tables</span>
              <span>42% (₹20.5 Lakhs)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[42%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Bedroom King Beds & Wardrobes</span>
              <span>32% (₹15.6 Lakhs)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full w-[32%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Dining Table Sets</span>
              <span>26% (₹12.8 Lakhs)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-700 rounded-full w-[26%]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
