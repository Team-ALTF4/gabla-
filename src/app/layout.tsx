// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/app/providers/AppProviders';


export const metadata: Metadata = {
  title: 'Secure Interview Platform',
  description: 'Host secure remote interviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Add the suppressHydrationWarning prop here
    <html lang="en" className="dark" suppressHydrationWarning> 
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}