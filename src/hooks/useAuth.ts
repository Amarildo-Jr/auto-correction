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

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Verificando autenticação - token:', !!token, 'user:', !!userStr);
    
    if (token && userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        console.log('Token e usuário encontrados, verificando token válido...');
        
        // Verificar se o token ainda é válido fazendo uma requisição
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const currentUser = await response.json();
          console.log('Token válido, usuário atual:', currentUser);
          setState({
            user: currentUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          console.error('Token inválido, removendo dados');
          // Token inválido, limpar dados
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        // Erro ao verificar, limpar dados
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      console.log('Nenhum token ou usuário armazenado');
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