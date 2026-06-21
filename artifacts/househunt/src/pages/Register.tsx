import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Mail, Lock, User, AlertCircle, Info } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "renter" as "owner" | "renter" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    registerMutation.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          login(data as any);
          const user = (data as any).user;
          if (user.role === "owner") navigate("/owner/dashboard");
          else navigate("/properties");
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Registration failed. Please try again.");
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

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
              <p className="text-muted-foreground mt-1 text-sm">Join HouseHunt today</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pl-10" required minLength={2} />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10" required />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10" required minLength={6} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">I am a...</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  {(["renter", "owner"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`p-3 border-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        form.role === role
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {role === "renter" ? "Renter / Tenant" : "Property Owner"}
                    </button>
                  ))}
                </div>
              </div>

              {form.role === "owner" && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  Owner accounts require admin approval before you can list properties.
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90 font-semibold h-11 mt-2"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
