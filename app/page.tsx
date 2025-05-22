import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-md border bg-card flex flex-col items-center gap-6">
        <Building2 className="w-12 h-12 text-primary mb-2" />
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome to CC Guru Admin Panel</h1>
        <p className="text-muted-foreground text-center mb-4">
          Manage your banks and credit card data with ease.
        </p>
        <Link href="/banks">
          <Button className="w-full" size="lg">
            Go to Banks
          </Button>
        </Link>
      </div>
    </main>
  );
} 