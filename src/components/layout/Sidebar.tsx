'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Credit Cards', href: '/credit-cards' },
  { name: 'Benefits', href: '/benefits' },
  { name: 'Milestones', href: '/milestones' },
  { name: 'Transactions', href: '/transactions' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">CC Guru Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              'flex items-center rounded-md px-3 py-2 text-sm font-medium ' +
              (pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
} 