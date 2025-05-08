'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * ThemeProvider component that wraps the next-themes provider
 * for consistent theme handling across the application
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
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