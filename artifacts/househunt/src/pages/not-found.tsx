import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-primary text-white gap-1.5">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
