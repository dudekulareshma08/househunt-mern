import Navbar from "@/components/Navbar";
import { useListMyProperties, useDeleteProperty, getListMyPropertiesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Building2, Pencil, Trash2, MapPin, DollarSign } from "lucide-react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80",
];

export default function OwnerProperties() {
  const queryClient = useQueryClient();
  const { data: properties, isLoading } = useListMyProperties();
  const deleteMutation = useDeleteProperty();

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this property?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMyPropertiesQueryKey() }),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
            <p className="text-muted-foreground text-sm mt-1">{properties?.length ?? 0} properties listed</p>
          </div>
          <Link href="/owner/properties/new">
            <Button className="bg-primary text-white gap-1.5">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !properties?.length ? (
          <div className="text-center py-20">
            <Building2 className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No properties yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first property to start renting</p>
            <Link href="/owner/properties/new">
              <Button className="bg-primary text-white gap-1.5"><Plus className="w-4 h-4" />Add Property</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => {
              const image = p.images?.[0] || FALLBACK_IMAGES[p.id % FALLBACK_IMAGES.length];
              return (
                <div key={p.id} className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
                  <div className="relative h-40 overflow-hidden">
                    <img src={image} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0]; }} />
                    <div className="absolute top-2 right-2">
                      <Badge className={p.status === "available" ? "bg-emerald-500 text-white border-0" : "bg-amber-500 text-white border-0"}>
                        {p.status === "available" ? "Available" : "Booked"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">{p.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />{p.location}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-bold text-primary">${p.rent.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/owner/properties/${p.id}/edit`}>
                          <Button size="icon" variant="outline" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
