'use client';

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * ThemeProvider component that wraps the next-themes provider
 * for consistent theme handling across the application
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add useEffect if needed for any initialization
  useEffect(() => {
    // Any theme-related initialization can go here
  }, []);

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}