import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useCreateProperty, useUpdateProperty, useGetProperty, getListMyPropertiesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle } from "lucide-react";

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "commercial"];

type FormData = {
  title: string;
  description: string;
  location: string;
  rent: string;
  type: string;
  amenities: string;
  images: string;
};

export default function OwnerPropertyForm() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const propId = id ? parseInt(id, 10) : undefined;

  const { data: existing } = useGetProperty(propId!, {
    query: { enabled: isEdit && !isNaN(propId!) },
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    title: "", description: "", location: "", rent: "",
    type: "apartment", amenities: "", images: "",
  });

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        title: existing.title,
        description: existing.description,
        location: existing.location,
        rent: String(existing.rent),
        type: existing.type,
        amenities: existing.amenities?.join(", ") ?? "",
        images: existing.images?.join(", ") ?? "",
      });
    }
  }, [existing, isEdit]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const data = {
      title: form.title,
      description: form.description,
      location: form.location,
      rent: parseFloat(form.rent),
      type: form.type as any,
      amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split(",").map((i) => i.trim()).filter(Boolean) : [],
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: propId!, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMyPropertiesQueryKey() });
            navigate("/owner/properties");
          },
          onError: (err: any) => setError(err?.data?.error || "Failed to update property."),
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMyPropertiesQueryKey() });
            navigate("/owner/properties");
          },
          onError: (err: any) => setError(err?.data?.error || "Failed to create property."),
        }
      );
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-5 text-muted-foreground" onClick={() => navigate("/owner/properties")}>
          <ArrowLeft className="w-4 h-4" /> Back to properties
        </Button>

        <div className="bg-card border border-card-border rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isEdit ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            {isEdit ? "Update your property details" : "List your property on HouseHunt"}
          </p>

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-medium">Property Title *</Label>
              <Input className="mt-1.5" placeholder="e.g. Modern 2BR Apartment in Downtown" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} />
            </div>

            <div>
              <Label className="text-sm font-medium">Description *</Label>
              <Textarea className="mt-1.5" rows={4} placeholder="Describe your property in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Location *</Label>
                <Input className="mt-1.5" placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div>
                <Label className="text-sm font-medium">Monthly Rent ($) *</Label>
                <Input className="mt-1.5" type="number" placeholder="2500" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required min="1" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Property Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Amenities</Label>
              <Input className="mt-1.5" placeholder="WiFi, Parking, Pool, Gym (comma-separated)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Separate amenities with commas</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Image URLs</Label>
              <Input className="mt-1.5" placeholder="https://example.com/img1.jpg, https://... (comma-separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Optional — provide direct image URLs</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/owner/properties")}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 font-semibold" disabled={isPending}>
                {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Add Property")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
