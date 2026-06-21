import Navbar from "@/components/Navbar";
import { useListOwnerBookings, useUpdateBookingStatus, getListOwnerBookingsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, MapPin, Calendar, User, CheckCircle, XCircle } from "lucide-react";

function statusColor(s: string) {
  if (s === "confirmed") return "bg-emerald-500 text-white border-0";
  if (s === "cancelled") return "bg-destructive text-white border-0";
  return "bg-amber-500 text-white border-0";
}

export default function OwnerBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useListOwnerBookings();
  const statusMutation = useUpdateBookingStatus();

  function updateStatus(id: number, status: "confirmed" | "cancelled") {
    statusMutation.mutate(
      { id, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOwnerBookingsQueryKey() }) }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Booking Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage requests for your properties</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        ) : !bookings?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No bookings yet</h3>
            <p className="text-sm text-muted-foreground">Booking requests for your properties will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{b.propertyTitle || `Property #${b.propertyId}`}</h3>
                      <Badge className={statusColor(b.status)}>{b.status}</Badge>
                    </div>
                    {b.renterName && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        {b.renterName} {b.renterEmail && `· ${b.renterEmail}`}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.startDate} to {b.endDate}
                    </div>
                  </div>
                  {b.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" onClick={() => updateStatus(b.id, "confirmed")} disabled={statusMutation.isPending}>
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1.5" onClick={() => updateStatus(b.id, "cancelled")} disabled={statusMutation.isPending}>
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
