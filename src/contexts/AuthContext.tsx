"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// Create a simplified context without authentication
interface AuthContextType {
  user: null;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
  isLoading: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Simplified provider with no authentication
  const value = {
    user: null,
    signOut: () => {},
    isLoading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};