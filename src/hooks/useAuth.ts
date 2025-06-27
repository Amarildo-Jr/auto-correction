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
      console.log('Tentando fazer login...');
      const { user } = await authService.login({ email, password });
      console.log('Login bem-sucedido:', user);
      
      // Aguardar um pequeno intervalo para garantir que os cookies sejam salvos
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true, user };
    } catch (error: any) {
      console.error('Erro no login:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Fazendo logout...');
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
    console.log('Verificando autenticação - usuário armazenado:', storedUser);
    
    if (storedUser) {
      try {
        // Verificar se o token ainda é válido
        console.log('Verificando token válido...');
        const currentUser = await authService.getMe();
        console.log('Token válido, usuário atual:', currentUser);
        setState({
          user: currentUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Token inválido:', error);
        // Token inválido, fazer logout
        authService.logout();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      console.log('Nenhum usuário armazenado');
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