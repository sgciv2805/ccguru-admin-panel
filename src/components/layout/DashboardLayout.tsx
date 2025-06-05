'use client';

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Gift,
  Tag,
  Calculator,
  Award,
  DollarSign,
  Building2,
  User as UserIcon,
  Settings as SettingsIcon,
  Home,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
  { label: 'Benefits', href: '/benefits', icon: Gift },
  { label: 'Spend Categories', href: '/spend-categories', icon: Tag },
  { label: 'Calculation Rules', href: '/calculation-rules', icon: Calculator },
  { label: 'Milestones', href: '/milestones', icon: Award },
  { label: 'Transactions', href: '/transactions', icon: DollarSign },
  { label: 'Banks', href: '/banks', icon: Building2 },
  { label: 'Users', href: '/users', icon: UserIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border/40 fixed inset-y-0 z-20">
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">CC Guru Admin</span>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Button
                asChild
                key={href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-between px-3 py-2.5 text-base font-medium transition-all duration-200 group",
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20' 
                    : 'hover:bg-muted/50'
                )}
              >
                <Link href={href}>
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{label}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    isActive ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                </Link>
              </Button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-full bg-primary/10">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@ccguru.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-72">
        <div className="container max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 