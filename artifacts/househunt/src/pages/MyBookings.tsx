import Navbar from "@/components/Navbar";
import { useListMyBookings } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

function statusColor(status: string) {
  if (status === "confirmed") return "bg-emerald-500 text-white border-0";
  if (status === "cancelled") return "bg-destructive text-white border-0";
  return "bg-amber-500 text-white border-0";
}

export default function MyBookings() {
  const { data: bookings, isLoading } = useListMyBookings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Track all your rental requests</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !bookings?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse properties and request a booking</p>
            <Link href="/properties"><Button className="bg-primary text-white">Browse Properties</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-base leading-snug">{b.propertyTitle || `Property #${b.propertyId}`}</h3>
                      <Badge className={statusColor(b.status)}>{b.status}</Badge>
                    </div>
                    {b.propertyLocation && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {b.propertyLocation}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{b.startDate} → {b.endDate}</span>
                      </div>
                      {b.propertyRent && (
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="w-3.5 h-3.5" />
                          ${b.propertyRent.toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
