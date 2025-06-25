import { authService, User } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  isAuthenticated: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { user } = await authService.login({ email, password });
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true, user };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const checkAuth = useCallback(async () => {
    // Só executar no cliente (browser)
    if (typeof window === 'undefined') {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      try {
        // Verificar se o token ainda é válido
        const currentUser = await authService.getMe();
        setState({
          user: currentUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // Token inválido, fazer logout
        authService.logout();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}; 