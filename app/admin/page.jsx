import Link from "next/link";
import { 
  Shield, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  UserCheck, 
  Star,
  ArrowUpRight,
  MessageSquare,
  Truck,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  // Query real operational data directly from PostgreSQL
  const [
    orders,
    allOrders,
    managerCount,
    employeeCount,
    productCount,
    inquiriesCount,
    reviewsCount,
  ] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.order.findMany({
      select: { totalAmount: true },
    }),
    db.manager.count(),
    db.employee.count(),
    db.product.count(),
    db.serviceInquiry.count(),
    db.customerReviewSubmission.count(),
  ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const stats = [
    {
      title: "Gross Revenue Recorded",
      value: `₹${(totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-400",
      desc: "Live order totals in PostgreSQL",
      link: "/admin/orders",
    },
    {
      title: "Total Customer Orders",
      value: `${allOrders.length} Orders`,
      icon: ShoppingBag,
      color: "bg-amber-500/10 text-amber-400",
      desc: "Active and archived orders",
      link: "/admin/orders",
    },
    {
      title: "Catalog Furniture Products",
      value: `${productCount} Products`,
      icon: Package,
      color: "bg-blue-500/10 text-blue-400",
      desc: "Active handcrafted items",
      link: "/admin/products",
    },
    {
      title: "Verified Customer Reviews",
      value: `${reviewsCount} Reviews`,
      icon: Star,
      color: "bg-purple-500/10 text-purple-400",
      desc: "Real reviews in database",
      link: "/admin/reviews",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Super Admin Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
            Aameena Furniture Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for catalog products, customer orders, team staff, and customer reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/10"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link
            key={idx}
            href={stat.link}
            className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg hover:border-amber-500/50 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{stat.title}</span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif text-white">{stat.value}</h2>
              <p className="text-slate-500 text-[11px]">{stat.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Orders from DB */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold font-serif text-white">Recent Furniture Orders</h3>
            <Link href="/admin/orders" className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent orders registered in database.</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">
                      {ord.orderNumber} - {ord.customerName}
                    </span>
                    <span className="text-slate-400">
                      {ord.city || "Solapur"} • {ord.productionStage?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">
                      ₹{ord.totalAmount?.toLocaleString()}
                    </span>
                    <span className="text-amber-400 font-semibold">{ord.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operational Overview & Navigation */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold font-serif text-white">Quick Management Hub</h3>
            <span className="text-xs text-slate-500">Core Modules</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/admin/reviews"
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between text-amber-400">
                <Star className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{reviewsCount} Reviews</span>
              </div>
              <span className="font-bold text-white block pt-1">Customer Reviews</span>
              <p className="text-[11px] text-slate-400">Moderation & Owner Replies</p>
            </Link>

            <Link
              href="/admin/services"
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between text-blue-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{inquiriesCount} Inquiries</span>
              </div>
              <span className="font-bold text-white block pt-1">Service Inquiries</span>
              <p className="text-[11px] text-slate-400">Bespoke Design Requests</p>
            </Link>

            <Link
              href="/admin/managers"
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between text-purple-400">
                <UserCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{managerCount} Managers</span>
              </div>
              <span className="font-bold text-white block pt-1">Showroom Managers</span>
              <p className="text-[11px] text-slate-400">Staff Credentials & Scope</p>
            </Link>

            <Link
              href="/admin/employees"
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between text-emerald-400">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{employeeCount} Staff</span>
              </div>
              <span className="font-bold text-white block pt-1">Employees & Careers</span>
              <p className="text-[11px] text-slate-400">Staff & Job Applications</p>
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/50 flex items-center justify-between text-xs">
            <span className="text-amber-200">Public Customer Reviews Page</span>
            <Link
              href="/ai-reviews"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>View Live /ai-reviews</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
