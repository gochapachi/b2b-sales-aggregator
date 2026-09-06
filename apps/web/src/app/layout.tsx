import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hyperlocal B2B Sales Aggregator Platform',
  description: 'Shared Field Sales-as-a-Service & Wholesale E-Commerce Marketplace for Manufacturers, Wholesalers & Retailers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
