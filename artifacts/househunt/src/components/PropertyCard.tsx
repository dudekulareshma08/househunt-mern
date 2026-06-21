import { Link } from "wouter";
import { MapPin, DollarSign, Home, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  rent: number;
  type: string;
  amenities: string[];
  images: string[];
  ownerId: number;
  ownerName?: string | null;
  status: string;
  createdAt: string;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&q=80",
];

export default function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0] || FALLBACK_IMAGES[property.id % FALLBACK_IMAGES.length];

  return (
    <div className="group bg-card border border-card-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="relative overflow-hidden h-48">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge className={property.status === "available" ? "bg-emerald-500 text-white border-0" : "bg-amber-500 text-white border-0"}>
            {property.status === "available" ? "Available" : "Booked"}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground border-0 font-medium capitalize">
            {property.type}
          </Badge>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1 mb-1">{property.title}</h3>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{property.description}</p>

        {property.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{a}</span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">+{property.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-primary">${property.rent.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <Link href={`/properties/${property.id}`}>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
