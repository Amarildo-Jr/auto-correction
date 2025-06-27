'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';

interface TokenStatusProps {
  showInProduction?: boolean;
}

export const TokenStatus: React.FC<TokenStatusProps> = ({
  showInProduction = false
}) => {
  const { getTimeUntilExpiry, isTokenValid, isRefreshingToken } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(getTimeUntilExpiry());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilExpiry]);

  // Não mostrar em produção por padrão
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = () => {
    if (!isTokenValid()) return 'text-red-500';
    if (timeLeft < 300) return 'text-yellow-500'; // Menos de 5 minutos
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isTokenValid()) return 'Token inválido';
    if (isRefreshingToken) return 'Renovando...';
    if (timeLeft < 300) return 'Expira em breve';
    return 'Token válido';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRefreshingToken ? 'bg-blue-500 animate-pulse' :
            !isTokenValid() ? 'bg-red-500' :
              timeLeft < 300 ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
        <div>
          <div className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          {isTokenValid() && !isRefreshingToken && (
            <div className="text-gray-500 text-xs">
              Expira em: {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 