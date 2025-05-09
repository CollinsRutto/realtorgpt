'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Remove empty useEffect hook
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

//export const metadata = {
  //title: 'RealtorGPT - Your AI Real Estate Assistant',
  //description: 'Get instant answers to all your Kenyan real estate questions',
//};