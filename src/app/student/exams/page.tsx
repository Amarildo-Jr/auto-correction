"use client"

export const dynamic = 'force-dynamic'

import ClientOnly from "@/components/ClientOnly";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext";
import api from "@/services/api";
import { Calendar, CheckCircle, Eye, Play, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'published' | 'finished';
  class_id: number;
  class_name: string;
  instructor_name: string;
  questions_count: number;
  result?: {
    id: number;
    total_points: number;
    max_points: number;
    percentage: number;
    status: 'completed' | 'in_progress' | 'not_started';
    started_at?: string;
    finished_at?: string;
  };
}

export default function StudentExamsPage() {
  return (
    <ClientOnly fallback={<LoadingSpinner />}>
      <StudentExamsContent />
    </ClientOnly>
  )
}

function StudentExamsContent() {
  const { user, isAuthenticated } = useAppContext();
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExams();
  }, []);

  // Verificar autorização
  if (!isAuthenticated || user?.role !== 'student') {
    router.push('/login');
    return null;
  }

  const loadExams = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get('/api/student/exams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setExams(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar provas:', err);
      setError(err.response?.data?.error || 'Erro ao carregar provas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    // Priorizar status do resultado sobre tempo
    if (exam.result?.status === 'completed') {
      return { status: 'completed', label: 'Concluída', color: 'bg-green-100 text-green-800' };
    } else if (exam.result?.status === 'in_progress') {
      return { status: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 border-blue-300 border-2' };
    } else if (now < startTime) {
      return { status: 'upcoming', label: 'Agendada', color: 'bg-gray-100 text-gray-800' };
    } else if (now >= startTime && now < endTime) {
      return { status: 'active', label: 'Disponível', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'expired', label: 'Expirada', color: 'bg-red-100 text-red-800' };
    }
  };

  const canTakeExam = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    // Se a prova está em andamento, sempre permitir continuar (mesmo se passou do tempo)
    if (exam.result?.status === 'in_progress') {
      return true;
    }

    // Para provas não iniciadas, verificar se está no período correto
    return (
      exam.status === 'published' &&
      now >= startTime &&
      now <= endTime &&
      (!exam.result || exam.result.status === 'not_started')
    );
  };

  // Filtrar provas por categoria - incluindo provas em andamento nas disponíveis
  const availableExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    return status.status === 'active' || status.status === 'in_progress';
  });

  const upcomingExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    return status.status === 'upcoming';
  });

  const completedExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    return status.status === 'completed';
  });

  const expiredExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    return status.status === 'expired';
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Provas</h1>
        <p className="text-muted-foreground">Acompanhe suas provas agendadas e resultados</p>
      </div>

      {/* Alerta para provas em andamento */}
      {availableExams.filter(e => e.result?.status === 'in_progress').length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Timer className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">
                  Você tem {availableExams.filter(e => e.result?.status === 'in_progress').length} prova(s) em andamento!
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  Continue de onde parou clicando em &quot;Continuar Prova&quot; na seção abaixo.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const inProgressExam = availableExams.find(e => e.result?.status === 'in_progress');
                  if (inProgressExam) {
                    router.push(`/student/exams/${inProgressExam.id}`);
                  }
                }}
              >
                Ir para Prova
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button onClick={loadExams} className="mt-2" size="sm">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-yellow-600">{availableExams.length}</p>
                {availableExams.filter(e => e.result?.status === 'in_progress').length > 0 && (
                  <p className="text-xs text-blue-600 font-medium">
                    {availableExams.filter(e => e.result?.status === 'in_progress').length} em andamento
                  </p>
                )}
              </div>
              <Play className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingExams.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedExams.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perdidas</p>
                <p className="text-2xl font-bold text-red-600">{expiredExams.length}</p>
              </div>
              <Timer className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <Timer className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Provas Disponíveis */}
        {availableExams.length > 0 && (
          <Card className="shadow-lg border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Play className="h-5 w-5" />
                Provas Disponíveis ({availableExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableExams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    const canTake = canTakeExam(exam);
                    console.log(`Prova ${exam.id} - Status: ${exam.result?.status}, CanTake: ${canTake}, ExamStatus: ${examStatus.status}`);
                    return (
                      <TableRow key={exam.id} className="hover:bg-yellow-50">
                        <TableCell>
                          <div>
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{exam.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.class_name}</p>
                            <p className="text-sm text-muted-foreground">{exam.instructor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDateTime(exam.start_time)}</p>
                            <p className="text-muted-foreground">até {formatDateTime(exam.end_time)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4 text-gray-500" />
                            <span>{exam.duration_minutes} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={examStatus.color}>
                            {examStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canTakeExam(exam) && (
                              <Button
                                size="sm"
                                className={exam.result?.status === 'in_progress'
                                  ? "bg-blue-600 hover:bg-blue-700 animate-pulse"
                                  : "bg-green-600 hover:bg-green-700"}
                                onClick={() => router.push(`/student/exams/${exam.id}`)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                {exam.result?.status === 'in_progress' ? 'Continuar Prova' : 'Iniciar Prova'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/student/exams/${exam.id}/view`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Próximas Provas */}
        {upcomingExams.length > 0 && (
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-5 w-5" />
                Próximas Provas ({upcomingExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingExams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    return (
                      <TableRow key={exam.id} className="hover:bg-blue-50">
                        <TableCell>
                          <div>
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{exam.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.class_name}</p>
                            <p className="text-sm text-muted-foreground">{exam.instructor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDateTime(exam.start_time)}</p>
                            <p className="text-muted-foreground">até {formatDateTime(exam.end_time)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4 text-gray-500" />
                            <span>{exam.duration_minutes} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={examStatus.color}>
                            {examStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/student/exams/${exam.id}/view`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {completedExams.length > 0 && (
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Resultados ({completedExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Data Realizada</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedExams.map((exam) => (
                    <TableRow key={exam.id} className="hover:bg-green-50">
                      <TableCell>
                        <div>
                          <h3 className="font-medium">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground">{exam.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.class_name}</p>
                          <p className="text-sm text-muted-foreground">{exam.instructor_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {exam.result?.finished_at && (
                          <div className="text-sm">
                            <p>{formatDateTime(exam.result.finished_at)}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {exam.result && (
                          <div className="font-medium">
                            {exam.result.total_points}/{exam.result.max_points}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {exam.result && (
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {exam.result.percentage.toFixed(1)}%
                            </div>
                            <Badge
                              className={
                                exam.result.percentage >= 70
                                  ? 'bg-green-100 text-green-800'
                                  : exam.result.percentage >= 50
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {exam.result.percentage >= 90 ? 'Excelente' :
                                exam.result.percentage >= 80 ? 'Muito Bom' :
                                  exam.result.percentage >= 70 ? 'Bom' :
                                    exam.result.percentage >= 60 ? 'Satisfatório' :
                                      exam.result.percentage >= 40 ? 'Regular' : 'Insuficiente'}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/student/results/${exam.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Resultado
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Provas Expiradas/Perdidas */}
        {expiredExams.length > 0 && (
          <Card className="shadow-lg border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Timer className="h-5 w-5" />
                Provas Perdidas ({expiredExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiredExams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    return (
                      <TableRow key={exam.id} className="hover:bg-red-50">
                        <TableCell>
                          <div>
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{exam.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.class_name}</p>
                            <p className="text-sm text-muted-foreground">{exam.instructor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDateTime(exam.start_time)}</p>
                            <p className="text-muted-foreground">até {formatDateTime(exam.end_time)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={examStatus.color}>
                            {examStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/student/exams/${exam.id}/view`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {exams.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma prova encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem provas disponíveis. Entre em contato com seus professores ou verifique se está matriculado em alguma turma.
                </p>
                <Button onClick={() => router.push('/student/classes')}>
                  Ver Minhas Turmas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 