import Navbar from "@/components/Navbar";
import { useGetOwnerStats, useListOwnerBookings, useUpdateBookingStatus, getListOwnerBookingsQueryKey, getGetOwnerStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, BookOpen, TrendingUp, Clock, CheckCircle, XCircle, Plus, AlertCircle } from "lucide-react";

function statusColor(s: string) {
  if (s === "confirmed") return "bg-emerald-500 text-white border-0";
  if (s === "cancelled") return "bg-destructive text-white border-0";
  return "bg-amber-500 text-white border-0";
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetOwnerStats();
  const { data: bookings } = useListOwnerBookings();
  const statusMutation = useUpdateBookingStatus();

  function updateStatus(id: number, status: "confirmed" | "cancelled") {
    statusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOwnerBookingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOwnerStatsQueryKey() });
        },
      }
    );
  }

  const pendingBookings = bookings?.filter((b) => b.status === "pending") ?? [];

  if (user?.role === "owner" && !user.isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground">Your owner account is awaiting admin approval. You'll be able to list properties once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link href="/owner/properties/new">
            <Button className="bg-primary text-white gap-1.5">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Properties", value: stats?.totalProperties ?? 0, icon: Building2, color: "bg-primary/10 text-primary" },
            { label: "Available", value: stats?.availableProperties ?? 0, icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
            { label: "Booked", value: stats?.bookedProperties ?? 0, icon: CheckCircle, color: "bg-amber-100 text-amber-600" },
            { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: BookOpen, color: "bg-primary/10 text-primary" },
            { label: "Pending Requests", value: stats?.pendingBookings ?? 0, icon: Clock, color: "bg-amber-100 text-amber-600" },
            { label: "Confirmed Bookings", value: stats?.confirmedBookings ?? 0, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{statsLoading ? "—" : value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/owner/properties">
            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">My Properties</div>
                  <div className="text-xs text-muted-foreground">Manage listings</div>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/owner/bookings">
            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Booking Requests</div>
                  <div className="text-xs text-muted-foreground">{pendingBookings.length} pending</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent pending bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{b.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">{b.renterName} · {b.startDate} to {b.endDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" onClick={() => updateStatus(b.id, "confirmed")} disabled={statusMutation.isPending}>
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1" onClick={() => updateStatus(b.id, "cancelled")} disabled={statusMutation.isPending}>
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
