import Navbar from "@/components/Navbar";
import { useAdminListProperties } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, User } from "lucide-react";

function typeBadge(t: string) {
  return "bg-primary/10 text-primary border-0 capitalize";
}

export default function AdminProperties() {
  const { data: properties, isLoading } = useAdminListProperties();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">All Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">{properties?.length ?? 0} properties on the platform</p>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        ) : !properties?.length ? (
          <div className="text-center py-20">
            <Building2 className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No properties yet</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Property</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rent</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.title}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />{p.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={typeBadge(p.type)}>{p.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <User className="w-3 h-3" />
                          {p.ownerName || `Owner #${p.ownerId}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5 font-semibold text-primary text-sm">
                          ${p.rent.toLocaleString()}/mo
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={p.status === "available" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}>
                          {p.status}
                        </Badge>
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
