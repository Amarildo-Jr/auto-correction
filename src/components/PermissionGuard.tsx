'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoading } from './LoadingSpinner';

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'professor' | 'student')[];
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  allowedRoles,
  redirectTo,
  fallbackComponent
}) => {
  const { user, isAuthenticated, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo || '/login');
      return;
    }

    if (!user || !allowedRoles.includes(user.role as any)) {
      // Redirecionar baseado no role do usuário
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        professor: '/teacher/dashboard',
        student: '/student/dashboard'
      };

      const userDashboard = dashboardRoutes[user.role as keyof typeof dashboardRoutes];
      router.push(userDashboard || '/login');
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles, redirectTo]);

  if (isLoading) {
    return <PageLoading message="Verificando permissões..." />;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role as any)) {
    return fallbackComponent || null;
  }

  return <>{children}</>;
};

// Componentes específicos para cada tipo de acesso
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard allowedRoles={['admin']}>
    {children}
  </PermissionGuard>
);

export const TeacherAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard allowedRoles={['admin', 'professor']}>
    {children}
  </PermissionGuard>
);

export const StudentAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard allowedRoles={['admin', 'student']}>
    {children}
  </PermissionGuard>
);

export const AuthenticatedOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard allowedRoles={['admin', 'professor', 'student']}>
    {children}
  </PermissionGuard>
);

// Hook para verificar permissões
export const usePermissions = () => {
  const { user, isAuthenticated } = useAppContext();

  return {
    isAdmin: isAuthenticated && user?.role === 'admin',
    isTeacher: isAuthenticated && (user?.role === 'professor' || user?.role === 'admin'),
    isStudent: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
    canAccessAdmin: isAuthenticated && user?.role === 'admin',
    canAccessTeacher: isAuthenticated && ['admin', 'professor'].includes(user?.role || ''),
    canAccessStudent: isAuthenticated && ['admin', 'student'].includes(user?.role || ''),
    userRole: user?.role,
    isAuthenticated
  };
}; 