import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppNav } from '@/components/layout/AppNav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TrazeField — práce podél trasy',
  description: 'Přehled zemních prací a verifikace pro liniové stavby (silnice, chodníky, sítě).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <AppNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
