'use client';

import { PageLoading } from '@/components/LoadingSpinner';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminProtectionProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'professor' | 'student')[];
}

export const AdminProtection: React.FC<AdminProtectionProps> = ({
  children,
  allowedRoles = ['admin', 'professor']
}) => {
  const { user, isAuthenticated, isLoading } = useAppContext();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading || hasRedirected) return;

    if (!isAuthenticated || !user) {
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(user.role as any)) {
      setHasRedirected(true);
      // Redirecionar baseado no papel do usuário
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'professor') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles, hasRedirected]);

  if (isLoading) {
    return <PageLoading message="Verificando permissões..." />;
  }

  if (!isAuthenticated || !user) {
    return <PageLoading message="Redirecionando..." />;
  }

  if (!allowedRoles.includes(user.role as any)) {
    return <PageLoading message="Redirecionando..." />;
  }

  return <>{children}</>;
}; 