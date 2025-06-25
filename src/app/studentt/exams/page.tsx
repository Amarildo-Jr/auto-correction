'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClasses } from "@/hooks/useClasses";
import { useExams } from "@/hooks/useExams";
import { Calendar, CheckCircle, Clock, Eye, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentExamsPage() {
  const router = useRouter();
  const { exams, isLoading: examsLoading, error } = useExams();
  const { classes, isLoading: classesLoading } = useClasses();

  if (examsLoading || classesLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar provas: {error}</p>
          <Button onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Filtrar provas por status
  const publishedExams = exams.filter(exam => exam.status === 'published');
  const upcomingExams = publishedExams.filter(exam => new Date(exam.start_time) > new Date());
  const pastExams = publishedExams.filter(exam => new Date(exam.end_time) < new Date());
  const activeExams = publishedExams.filter(exam => {
    const now = new Date();
    return new Date(exam.start_time) <= now && new Date(exam.end_time) > now;
  });

  const getClassName = (classId: number | undefined) => {
    if (!classId) return 'N/A';
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : 'N/A';
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

  const getExamStatus = (exam: any) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (now < startTime) {
      return { status: 'upcoming', label: 'Agendada', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startTime && now < endTime) {
      return { status: 'active', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'finished', label: 'Finalizada', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Provas</h1>
        <p className="text-muted-foreground">Acompanhe suas provas agendadas e resultados</p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas Provas</p>
                <p className="text-2xl font-bold">{upcomingExams.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provas Ativas</p>
                <p className="text-2xl font-bold">{activeExams.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provas Concluídas</p>
                <p className="text-2xl font-bold">{pastExams.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Provas Ativas e Próximas */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Provas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {[...activeExams, ...upcomingExams].length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma prova disponível no momento</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...activeExams, ...upcomingExams].map((exam) => {
                    const examStatus = getExamStatus(exam);
                    return (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{getClassName(exam.class_id)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDateTime(exam.start_time)}</p>
                            <p className="text-muted-foreground">Duração: {exam.duration_minutes} min</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={examStatus.color}>
                            {examStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {examStatus.status === 'active' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => router.push(`/exams/${exam.id}/take`)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/exams/${exam.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Meus Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastExams.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum resultado disponível ainda</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastExams.slice(0, 5).map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <h3 className="font-medium">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground">{getClassName(exam.class_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDateTime(exam.end_time)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {/* Simulando resultado - na implementação real viria da API */}
                          <p className="font-medium">85/100</p>
                          <Badge className="bg-green-100 text-green-800">
                            Excelente
                          </Badge>
                        </div>
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
            )}
            {pastExams.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/results')}
                >
                  Ver Todos os Resultados
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
