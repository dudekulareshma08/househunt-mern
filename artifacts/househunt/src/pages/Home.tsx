import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useListProperties } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const { data: featuredProperties } = useListProperties({ status: "available" });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/properties?location=${encodeURIComponent(searchInput)}`);
    } else {
      navigate("/properties");
    }
  }

  const displayed = featuredProperties?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-[hsl(213,50%,20%)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(42,70%,50%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(42,70%,50%) 0%, transparent 40%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Star className="w-3.5 h-3.5 text-secondary" />
              The smarter way to find your next home
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
              Find Your Perfect <br />
              <span className="text-secondary">Rental Home</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
              Browse thousands of verified rental properties. Connect directly with owners and book your next home with confidence.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by location..."
                  className="pl-10 h-12 bg-white text-foreground border-0 shadow-lg text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-lg">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">1,200+</div>
              <div className="text-sm text-muted-foreground">Happy Renters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">300+</div>
              <div className="text-sm text-muted-foreground">Verified Owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground mt-1">Handpicked available rentals just for you</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/properties")} className="gap-1.5 hidden sm:flex">
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No properties available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline" onClick={() => navigate("/properties")} className="gap-1.5">
            View all properties <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-2">How HouseHunt Works</h2>
          <p className="text-center text-muted-foreground mb-10">Simple steps to find your next home</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Browse Properties", desc: "Search and filter listings by location, price, and type. Find what fits your lifestyle.", step: "01" },
              { icon: Building2, title: "Book with Confidence", desc: "Select your move-in dates and send a booking request directly to the owner.", step: "02" },
              { icon: ShieldCheck, title: "Move In Verified", desc: "Owner confirms your booking and you get all the details you need to move in.", step: "03" },
            ].map(({ icon: Icon, title, desc, step }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex mb-5">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-secondary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                    {step}
                  </div>
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-3">Own a Property? List It Today</h2>
          <p className="text-white/75 mb-6">Join hundreds of property owners who earn reliably through HouseHunt's verified platform.</p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" onClick={() => navigate("/register")}>
            Get Started as Owner
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-primary">HouseHunt</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 HouseHunt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
