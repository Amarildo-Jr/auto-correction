import tokenService from '@/services/tokenService';
import { useCallback, useEffect, useRef } from 'react';

export const useTokenRefresh = () => {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const startRefreshTimer = useCallback(() => {
    // Limpar timer anterior se existir
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Configurar timer para verificar a cada 5 minutos
    refreshIntervalRef.current = setInterval(async () => {
      if (isRefreshingRef.current) {
        return;
      }

      // Verificar se há token válido antes de tentar renovar
      if (!tokenService.getAccessToken()) {
        return;
      }

      try {
        isRefreshingRef.current = true;
        
        // Verificar se precisa renovar o token
        if (tokenService.shouldRefreshSoon()) {
          console.log('🔄 Renovando token proativamente...');
          await tokenService.refreshAccessToken();
          console.log('✅ Token renovado com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro na renovação proativa do token:', error);
        // Se falhar, limpar tokens e redirecionar
        tokenService.clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } finally {
        isRefreshingRef.current = false;
      }
    }, 5 * 60 * 1000); // 5 minutos
  }, []);

  const stopRefreshTimer = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    isRefreshingRef.current = false;
  }, []);

  // Iniciar timer quando o hook é montado
  useEffect(() => {
    // Só iniciar se há token
    if (tokenService.getAccessToken()) {
      startRefreshTimer();
    }

    // Cleanup ao desmontar
    return () => {
      stopRefreshTimer();
    };
  }, [startRefreshTimer, stopRefreshTimer]);

  // Método para forçar renovação manual
  const forceRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return false;
    }

    try {
      isRefreshingRef.current = true;
      console.log('🔄 Forçando renovação manual do token...');
      
      await tokenService.refreshAccessToken();
      console.log('✅ Token renovado manualmente com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na renovação manual do token:', error);
      tokenService.clearTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Verificar se o token é válido
  const isTokenValid = useCallback(() => {
    return tokenService.hasValidToken();
  }, []);

  // Obter tempo restante até expiração (em segundos)
  const getTimeUntilExpiry = useCallback(() => {
    const token = tokenService.getAccessToken();
    if (!token) return 0;

    try {
      // Decodificar token JWT para obter exp
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // exp está em segundos
      const timeRemaining = Math.max(0, expiryTime - Date.now());
      return Math.floor(timeRemaining / 1000); // retornar em segundos
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return 0;
    }
  }, []);

  return {
    forceRefresh,
    isTokenValid,
    getTimeUntilExpiry,
    isRefreshing: isRefreshingRef.current
  };
}; 