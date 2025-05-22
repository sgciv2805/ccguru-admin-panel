import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import DashboardLayout from "@/src/components/layout/DashboardLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CC Guru Admin Panel",
  description: "Admin panel for managing credit card data",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  )
} 