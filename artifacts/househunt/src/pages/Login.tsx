import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          login(data as any);
          const user = (data as any).user;
          if (user.role === "admin") navigate("/admin/dashboard");
          else if (user.role === "owner") navigate("/owner/dashboard");
          else navigate("/properties");
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Invalid email or password");
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary">HouseHunt</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground mt-1 text-sm">Sign in to your HouseHunt account</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90 font-semibold h-11 mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              No account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>

            <div className="mt-6 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
              <p className="font-semibold mb-1.5">Demo accounts:</p>
              <p>admin@househunt.com / admin123</p>
              <p>owner@househunt.com / owner123</p>
              <p>renter@househunt.com / renter123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
