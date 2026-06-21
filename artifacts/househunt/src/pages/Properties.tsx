import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useListProperties, getListPropertiesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Building2, SlidersHorizontal } from "lucide-react";

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "commercial"];

export default function Properties() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [filters, setFilters] = useState({
    location: params.get("location") || "",
    type: "",
    minRent: "",
    maxRent: "",
    status: "available",
  });
  const [applied, setApplied] = useState(filters);

  const queryParams: Record<string, any> = {};
  if (applied.location) queryParams.location = applied.location;
  if (applied.type && applied.type !== "all") queryParams.type = applied.type;
  if (applied.minRent) queryParams.minRent = parseFloat(applied.minRent);
  if (applied.maxRent) queryParams.maxRent = parseFloat(applied.maxRent);
  if (applied.status && applied.status !== "all") queryParams.status = applied.status;

  const { data: properties, isLoading } = useListProperties(queryParams, {
    query: { queryKey: getListPropertiesQueryKey(queryParams) },
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ ...filters });
  }

  function clearFilters() {
    const reset = { location: "", type: "", minRent: "", maxRent: "", status: "available" };
    setFilters(reset);
    setApplied(reset);
  }

  const hasActiveFilters = applied.location || applied.type || applied.minRent || applied.maxRent;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Browse Properties</h1>

          <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select value={filters.type || "all"} onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Property type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min $"
                value={filters.minRent}
                onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max $"
                value={filters.maxRent}
                onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 px-4"><Search className="w-4 h-4" /></Button>
              {hasActiveFilters && (
                <Button type="button" variant="outline" onClick={clearFilters} className="px-3"><X className="w-4 h-4" /></Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${properties?.length ?? 0} properties found`}
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters active
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties?.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No properties found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 gap-1.5">
                <X className="w-4 h-4" /> Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties!.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
