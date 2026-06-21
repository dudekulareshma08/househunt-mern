import Navbar from "@/components/Navbar";
import { useAdminGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, Building2, BookOpen, TrendingUp, Clock, CheckCircle, UserCheck, UserX } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Property Owners", value: stats?.totalOwners, icon: UserCheck, color: "bg-emerald-100 text-emerald-600" },
    { label: "Renters", value: stats?.totalRenters, icon: Users, color: "bg-sky-100 text-sky-600" },
    { label: "Total Properties", value: stats?.totalProperties, icon: Building2, color: "bg-violet-100 text-violet-600" },
    { label: "Available", value: stats?.availableProperties, icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
    { label: "Currently Booked", value: stats?.bookedProperties, icon: CheckCircle, color: "bg-amber-100 text-amber-600" },
    { label: "Total Bookings", value: stats?.totalBookings, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Pending Bookings", value: stats?.pendingBookings, icon: Clock, color: "bg-amber-100 text-amber-600" },
  ];

  const navLinks = [
    { href: "/admin/users", icon: Users, label: "Manage Users", desc: "View & approve accounts" },
    { href: "/admin/properties", icon: Building2, label: "All Properties", desc: "Monitor listings" },
    { href: "/admin/bookings", icon: BookOpen, label: "All Bookings", desc: "Track platform activity" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-foreground">{isLoading ? "—" : (value ?? 0)}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {navLinks.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href}>
              <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">{label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
