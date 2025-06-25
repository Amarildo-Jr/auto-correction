'use client';

import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirecionamento baseado no papel do usuário
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'professor':
        case 'teacher':
          router.push('/teacher/dashboard'); // Mantendo a rota existente
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        default:
          // Fallback para dashboard genérico se o papel não for reconhecido
          router.push('/login');
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Provas Online
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Plataforma para realização de provas online com monitoramento avançado
          </p>

          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full h-12 text-lg">
                Acessar Sistema
              </Button>
            </Link>

            <div className="text-sm text-gray-500">
              <p>Recursos da plataforma:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Criação e gerenciamento de provas</li>
                <li>• Banco de questões inteligente</li>
                <li>• Sistema de solicitação de turmas</li>
                <li>• Monitoramento em tempo real</li>
                <li>• Correção automática</li>
                <li>• Relatórios detalhados</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">Credenciais para teste:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Admin:</strong> admin@admin.com / admin123</p>
                <p><strong>Professor:</strong> prof1@ufpi.edu.br / 123456</p>
                <p><strong>Estudante:</strong> aluno1@ufpi.edu.br / 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}