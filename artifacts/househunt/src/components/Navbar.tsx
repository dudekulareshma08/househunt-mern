import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Home, Building2, BookOpen, LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function getDashboardLink() {
    if (!user) return null;
    if (user.role === "admin") return { href: "/admin/dashboard", label: "Admin Panel" };
    if (user.role === "owner") return { href: "/owner/dashboard", label: "Owner Dashboard" };
    return { href: "/my-bookings", label: "My Bookings" };
  }

  const dashLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">HouseHunt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/properties">
              <Button variant={location === "/properties" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
                <Building2 className="w-4 h-4" />
                Properties
              </Button>
            </Link>
            {user && dashLink && (
              <Link href={dashLink.href}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  {dashLink.label}
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize px-1.5 py-0.5 bg-background rounded-full border">
                    {user.role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
            <Link href="/properties" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2"><Building2 className="w-4 h-4" />Properties</Button>
            </Link>
            {user && dashLink && (
              <Link href={dashLink.href} onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2"><LayoutDashboard className="w-4 h-4" />{dashLink.label}</Button>
              </Link>
            )}
            {user ? (
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={() => { logout(); setMenuOpen(false); }}>
                <LogOut className="w-4 h-4" />Logout
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Login</Button></Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}><Button className="w-full bg-primary text-white">Get Started</Button></Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
