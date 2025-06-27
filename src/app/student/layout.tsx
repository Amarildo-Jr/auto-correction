'use client';

import { NotificationCenter } from '@/components/NotificationCenter';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Verificar se está autenticado
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Permitir acesso para estudantes e admins
    if (user?.role !== 'student' && user?.role !== 'admin') {
      // Redirecionar baseado no role do usuário
      if (user?.role === 'professor') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar se tem permissão
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                ProvEx - {user?.role === 'admin' ? 'Admin (Área do Estudante)' : 'Estudante'}
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.role === 'admin' ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 