import './globals.css';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata = {
  title: 'CC Guru Admin Panel',
  description: 'Admin panel for managing CC Guru credit card management product',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
