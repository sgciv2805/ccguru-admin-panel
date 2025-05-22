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
} from 'lucide-react'

const navItems = [
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r p-4 gap-2 fixed inset-y-0 z-20">
        <div className="mb-6 px-2">
          <span className="text-xl font-bold tracking-tight">CC Guru Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Button
              asChild
              key={href}
              variant={pathname === href ? 'secondary' : 'ghost'}
              className={`justify-start w-full px-3 py-2 text-base font-medium flex items-center transition-all ${pathname === href ? 'bg-muted text-primary font-semibold' : ''}`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              <Link href={href}>
                <span className="flex items-center">
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </span>
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6 bg-muted min-h-screen">
        {children}
      </main>
    </div>
  )
} 