'use client';

import { PageLoading } from '@/components/LoadingSpinner';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'professor' | 'student')[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading } = useAppContext();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Se não requer autenticação, permitir acesso
    if (!requireAuth) {
      setIsAuthorized(true);
      return;
    }

    // Se requer autenticação mas não está autenticado
    if (!isAuthenticated || !user) {
      router.push(redirectTo || '/login');
      return;
    }

    // Se não há roles específicos permitidos, qualquer usuário autenticado pode acessar
    if (allowedRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Verificar se o role do usuário está nos permitidos
    if (allowedRoles.includes(user.role as any)) {
      setIsAuthorized(true);
      return;
    }

    // Usuário não autorizado - redirecionar para dashboard apropriado
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      professor: '/teacher/dashboard',
      student: '/student/dashboard'
    };

    const userDashboard = dashboardRoutes[user.role as keyof typeof dashboardRoutes];
    router.push(userDashboard || '/login');

  }, [isAuthenticated, isLoading, user, router, allowedRoles, requireAuth, redirectTo]);

  // Mostrar loading enquanto verifica
  if (isLoading || (requireAuth && (!isAuthenticated || !isAuthorized))) {
    return <PageLoading message="Verificando permissões..." />;
  }

  // Se não requer auth ou está autorizado, mostrar conteúdo
  if (!requireAuth || isAuthorized) {
    return <>{children}</>;
  }

  // Fallback - não deveria chegar aqui
  return null;
};

// Componente específico para páginas de admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteProtection allowedRoles={['admin']}>
    {children}
  </RouteProtection>
);

// Componente específico para páginas de professor
export const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteProtection allowedRoles={['admin', 'professor']}>
    {children}
  </RouteProtection>
);

// Componente específico para páginas de estudante
export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteProtection allowedRoles={['admin', 'student']}>
    {children}
  </RouteProtection>
);

// Componente para rotas que requerem apenas autenticação
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteProtection allowedRoles={[]}>
    {children}
  </RouteProtection>
);

// Componente para rotas públicas (não requer autenticação)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteProtection requireAuth={false}>
    {children}
  </RouteProtection>
); 