'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    console.log('AdminLayout - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('Redirecionando para login - não autenticado');
        router.push('/login');
        return;
      }

      // Verificar se tem permissão (apenas admin)
      if (user.role !== 'admin') {
        console.log('Redirecionando - role não permitido:', user.role);
        if (user.role === 'professor') {
          router.push('/teacher/dashboard');
        } else if (user.role === 'student') {
          router.push('/student/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado ou não tem permissão, mostrar loading
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                ProvEx - Administrador
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 