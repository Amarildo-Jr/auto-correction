'use client';

import { PageLoading } from '@/components/LoadingSpinner';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!user || !allowedRoles.includes(user.role as any)) {
        // Redirecionar baseado no papel do usuário
        if (user?.role === 'student') {
          router.push('/student/dashboard');
        } else if (user?.role === 'admin' || user?.role === 'professor') {
          router.push('/admin/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles]);

  if (isLoading) {
    return <PageLoading message="Verificando permissões..." />;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role as any)) {
    return null; // Será redirecionado pelo useEffect
  }

  return <>{children}</>;
}; 