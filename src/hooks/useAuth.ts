import { authService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface AuthState {
  user: any;
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
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await authService.login({ email, password });
      
      setState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Erro no login:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
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

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        
        setState({
          user: storedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Se der erro, limpar dados
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