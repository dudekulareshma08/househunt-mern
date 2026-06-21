import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import MyBookings from "@/pages/MyBookings";
import OwnerDashboard from "@/pages/owner/Dashboard";
import OwnerProperties from "@/pages/owner/Properties";
import OwnerPropertyForm from "@/pages/owner/PropertyForm";
import OwnerBookings from "@/pages/owner/Bookings";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminProperties from "@/pages/admin/Properties";
import AdminBookings from "@/pages/admin/Bookings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ children, role }: { children: ReactNode; role?: "admin" | "owner" | "renter" }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role && !(role === "owner" && user.role === "admin")) return <Redirect to="/" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/my-bookings">
        <ProtectedRoute role="renter"><MyBookings /></ProtectedRoute>
      </Route>
      <Route path="/owner/dashboard">
        <ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>
      </Route>
      <Route path="/owner/properties/new">
        <ProtectedRoute role="owner"><OwnerPropertyForm /></ProtectedRoute>
      </Route>
      <Route path="/owner/properties/:id/edit">
        <ProtectedRoute role="owner"><OwnerPropertyForm /></ProtectedRoute>
      </Route>
      <Route path="/owner/properties">
        <ProtectedRoute role="owner"><OwnerProperties /></ProtectedRoute>
      </Route>
      <Route path="/owner/bookings">
        <ProtectedRoute role="owner"><OwnerBookings /></ProtectedRoute>
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
      </Route>
      <Route path="/admin/properties">
        <ProtectedRoute role="admin"><AdminProperties /></ProtectedRoute>
      </Route>
      <Route path="/admin/bookings">
        <ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
