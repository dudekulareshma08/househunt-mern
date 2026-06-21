import Navbar from "@/components/Navbar";
import { useAdminListBookings } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, Building2 } from "lucide-react";

function statusColor(s: string) {
  if (s === "confirmed") return "bg-emerald-100 text-emerald-700 border-0";
  if (s === "cancelled") return "bg-destructive/10 text-destructive border-0";
  return "bg-amber-100 text-amber-700 border-0";
}

export default function AdminBookings() {
  const { data: bookings, isLoading } = useAdminListBookings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">{bookings?.length ?? 0} total bookings on the platform</p>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        ) : !bookings?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Property</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Renter</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dates</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rent</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          {b.propertyTitle || `Property #${b.propertyId}`}
                        </div>
                        {b.propertyLocation && (
                          <div className="text-xs text-muted-foreground mt-0.5 ml-5">{b.propertyLocation}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          {b.renterName || `Renter #${b.renterId}`}
                        </div>
                        {b.renterEmail && (
                          <div className="text-xs text-muted-foreground mt-0.5 ml-5">{b.renterEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {b.startDate} → {b.endDate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {b.propertyRent != null && (
                          <span className="font-semibold text-primary text-sm">${b.propertyRent.toLocaleString()}/mo</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColor(b.status)}>{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
