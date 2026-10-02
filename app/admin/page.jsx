import Link from "next/link";
import { 
  Shield, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  UserCheck, 
  TrendingUp, 
  AlertCircle, 
  MessageSquare, 
  ArrowUpRight 
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Revenue", value: "₹48,95,000", change: "+18.4%", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Total Furniture Orders", value: "1,248", change: "+12.1%", icon: ShoppingBag, color: "bg-amber-500/10 text-amber-400" },
    { title: "Active Managers", value: "6 Managers", change: "2 Showrooms", icon: UserCheck, color: "bg-blue-500/10 text-blue-400" },
    { title: "Total Employees", value: "42 Staff", change: "Craftsmen & Sales", icon: Users, color: "bg-purple-500/10 text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Super Admin Control Hub</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">Aameena Furniture Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Full system overview, revenue metrics, manager assignments, and WhatsApp automation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/managers"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
          >
            Manage Staff
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{stat.title}</span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif text-white">{stat.value}</h2>
              <span className="text-xs text-emerald-400 font-semibold">{stat.change} from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders Overview */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold font-serif text-white">Recent Furniture Dispatches</h3>
            <Link href="/admin/orders" className="text-xs text-amber-400 font-bold flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { id: "ORD-2026-9812", client: "Rajesh Sharma", item: "Royal Teak 7-Seater Sofa", status: "In Transit", amount: "₹85,000" },
              { id: "ORD-2026-9811", client: "Meera Patel", item: "Imperial King Bed", status: "Processing", amount: "₹62,500" },
              { id: "ORD-2026-9810", client: "Sunil Verma", item: "Monarch 6-Seater Dining", status: "Delivered", amount: "₹54,000" },
            ].map((ord, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{ord.id} - {ord.client}</span>
                  <span className="text-slate-400">{ord.item}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">{ord.amount}</span>
                  <span className="text-amber-400 font-semibold">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Automation Status */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold font-serif text-white">WhatsApp Broadcast Hub</h3>
            <Link href="/admin/whatsapp" className="text-xs text-amber-400 font-bold flex items-center gap-1">
              Configure Templates <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-400">
              <span>API Gateway Status:</span>
              <span className="bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded">CONNECTED</span>
            </div>
            <p className="text-emerald-200/80">Automated order tracking & dispatch WhatsApp templates active for all store managers.</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between text-slate-300">
              <span>Order Dispatch SMS/WhatsApp Template</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between text-slate-300">
              <span>Payment Confirmation Broadcast</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
