import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useGetProperty, useCreateBooking, getListMyBookingsQueryKey, getListPropertiesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, DollarSign, User, Home, ArrowLeft, CheckCircle, AlertCircle, Calendar } from "lucide-react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
];

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const propId = parseInt(id!, 10);

  const { data: property, isLoading } = useGetProperty(propId, {
    query: { queryKey: ["/api/properties", propId], enabled: !isNaN(propId) },
  });

  const bookingMutation = useCreateBooking();
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const image = property?.images?.[0] || FALLBACK_IMAGES[propId % FALLBACK_IMAGES.length];

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setBookingError("");
    bookingMutation.mutate(
      { data: { propertyId: propId, startDate: dates.startDate, endDate: dates.endDate } },
      {
        onSuccess: () => {
          setBookingSuccess(true);
          queryClient.invalidateQueries({ queryKey: getListMyBookingsQueryKey() });
        },
        onError: (err: any) => {
          setBookingError(err?.data?.error || "Booking failed. Please try again.");
        },
      }
    );
  }

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-72 bg-muted rounded-2xl" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/properties")}>Back to listings</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-4 text-muted-foreground" onClick={() => navigate("/properties")}>
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80">
              <img src={image} alt={property.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0]; }} />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className={property.status === "available" ? "bg-emerald-500 text-white border-0" : "bg-amber-500 text-white border-0"}>
                  {property.status === "available" ? "Available" : "Booked"}
                </Badge>
                <Badge variant="secondary" className="bg-white/90 text-foreground border-0 capitalize">{property.type}</Badge>
              </div>
            </div>

            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {property.images.slice(1, 4).map((img, i) => (
                  <div key={i} className="h-20 rounded-xl overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]; }} />
                  </div>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {property.ownerName && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Property Owner</p>
                  <p className="font-semibold text-foreground">{property.ownerName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-card-border rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">${property.rent.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Utilities not included</p>

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Booking Requested!</h3>
                  <p className="text-sm text-muted-foreground mb-4">The owner will review and confirm your booking.</p>
                  <Button className="w-full bg-primary text-white" onClick={() => navigate("/my-bookings")}>View My Bookings</Button>
                </div>
              ) : property.status === "booked" ? (
                <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 font-medium text-sm">This property is currently booked.</p>
                </div>
              ) : user?.role === "renter" ? (
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Move-in Date</Label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="date" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} className="pl-9" required min={new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Move-out Date</Label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="date" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} className="pl-9" required min={dates.startDate || new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>
                  {bookingError && (
                    <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5" />{bookingError}
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 font-semibold" disabled={bookingMutation.isPending}>
                    {bookingMutation.isPending ? "Submitting..." : "Request Booking"}
                  </Button>
                </form>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Sign in to book this property</p>
                  <Link href="/login"><Button className="w-full bg-primary text-white">Sign In to Book</Button></Link>
                </div>
              ) : (
                <div className="bg-muted rounded-xl p-4 text-center text-sm text-muted-foreground">
                  Only renters can book properties.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
