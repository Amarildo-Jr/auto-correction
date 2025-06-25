'use client';

import { PageLoading } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAppContext();
  const { exams, isLoading: examsLoading, error: examsError } = useExams();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateExam = () => {
    router.push('/exams/create');
  };

  const handleTakeExam = (examId: number) => {
    router.push(`/exams/${examId}/take`);
  };

  const handleViewExam = (examId: number) => {
    router.push(`/exams/${examId}`);
  };

  if (isLoading) {
    return <PageLoading message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Provas Online
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.name} ({user?.role})
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Actions */}
          {(user?.role === 'admin' || user?.role === 'professor') && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suas Provas</h2>
              <Button onClick={handleCreateExam}>
                Criar Nova Prova
              </Button>
            </div>
          )}

          {user?.role === 'student' && (
            <div>
              <h2 className="text-xl font-semibold">Provas Disponíveis</h2>
              <p className="text-gray-600 mt-1">
                Clique em uma prova para realizá-la
              </p>
            </div>
          )}

          {/* Exams List */}
          {examsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Carregando provas...</div>
            </div>
          ) : examsError ? (
            <div className="text-center py-8">
              <div className="text-red-500">Erro ao carregar provas: {examsError}</div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {user?.role === 'student'
                  ? 'Nenhuma prova disponível no momento'
                  : 'Você ainda não criou nenhuma prova'
                }
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <div className="text-sm text-gray-600">
                      <div>Duração: {exam.duration_minutes} minutos</div>
                      <div>Status: {exam.status}</div>
                      <div>
                        Início: {new Date(exam.start_time).toLocaleString('pt-BR')}
                      </div>
                      <div>
                        Fim: {new Date(exam.end_time).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">
                      {exam.description}
                    </p>
                    <div className="flex gap-2">
                      {user?.role === 'student' ? (
                        <Button
                          onClick={() => handleTakeExam(exam.id)}
                          className="w-full"
                          disabled={exam.status !== 'published'}
                        >
                          {exam.status === 'published' ? 'Realizar Prova' : 'Não Disponível'}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleViewExam(exam.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            Ver Detalhes
                          </Button>
                          <Button
                            onClick={() => router.push(`/exams/${exam.id}/edit`)}
                            className="flex-1"
                          >
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 