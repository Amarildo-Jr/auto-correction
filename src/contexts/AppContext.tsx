'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import React, { createContext, ReactNode, useContext } from 'react';

interface AppContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => void;
  // Novos métodos para gerenciamento de tokens
  forceTokenRefresh: () => Promise<boolean>;
  isTokenValid: () => boolean;
  getTimeUntilExpiry: () => number;
  isRefreshingToken: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();
  const tokenRefresh = useTokenRefresh();

  const value: AppContextType = {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    checkAuth: auth.checkAuth,
    // Novos métodos para gerenciamento de tokens
    forceTokenRefresh: tokenRefresh.forceRefresh,
    isTokenValid: tokenRefresh.isTokenValid,
    getTimeUntilExpiry: tokenRefresh.getTimeUntilExpiry,
    isRefreshingToken: tokenRefresh.isRefreshing,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 