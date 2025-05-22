"use client";

import { ReactNode } from "react";
import { Home, CreditCard, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: "/credit-cards",
    label: "Credit Cards",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    href: "/banks",
    label: "Banks",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    href: "/users",
    label: "Users",
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold">CC Guru Admin</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${
                  isActive ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 