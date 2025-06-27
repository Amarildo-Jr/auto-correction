'use client';

export const dynamic = 'force-dynamic'

import ClientOnly from '@/components/ClientOnly';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useClasses } from '@/hooks/useClasses';
import { useExams } from '@/hooks/useExams';
import { useResults } from '@/hooks/useResults';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function TeacherDashboard() {
  return (
    <ClientOnly fallback={<LoadingSpinner />}>
      <TeacherDashboardContent />
    </ClientOnly>
  );
}

function TeacherDashboardContent() {
  const { user, isAuthenticated } = useAppContext();
  const router = useRouter();
  const { classes, isLoading: classesLoading } = useClasses();
  const { exams, isLoading: examsLoading } = useExams();
  const { results, isLoading: resultsLoading } = useResults();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const activeClasses = classes?.filter((c: any) => c.is_active) || [];
    const totalStudents = activeClasses.reduce((sum: number, cls: any) => sum + (cls.students_count || 0), 0);

    const now = new Date();
    const upcomingExams = exams?.filter((exam: any) => {
      const startTime = new Date(exam.start_time);
      return startTime > now && exam.status === 'published';
    }) || [];

    const completedResults = results?.filter((r: any) => r.status === 'completed') || [];
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / completedResults.length
      : 0;

    return [
      {
        title: 'Turmas Ativas',
        value: activeClasses.length.toString(),
        icon: BookOpen,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        change: '+2 este mês'
      },
      {
        title: 'Próximas Provas',
        value: upcomingExams.length.toString(),
        icon: Calendar,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        change: 'Esta semana'
      },
      {
        title: 'Total de Alunos',
        value: totalStudents.toString(),
        icon: Users,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        change: `Em ${activeClasses.length} turmas`
      },
      {
        title: 'Média Geral',
        value: `${averageScore.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        change: averageScore >= 70 ? 'Boa performance' : 'Precisa atenção'
      }
    ];
  }, [classes, exams, results]);

  // Próximas provas
  const upcomingExams = useMemo(() => {
    const now = new Date();
    return exams?.filter((exam: any) => {
      const startTime = new Date(exam.start_time);
      return startTime > now && exam.status === 'published';
    }).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).slice(0, 5) || [];
  }, [exams]);

  // Atividades recentes
  const recentActivity = useMemo(() => {
    const activities: any[] = [];

    // Adicionar resultados recentes
    const recentResults = results?.filter((r: any) => r.finished_at)
      .sort((a: any, b: any) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime())
      .slice(0, 3) || [];

    recentResults.forEach((result: any) => {
      activities.push({
        type: 'result',
        title: `${result.student_name} finalizou a prova`,
        subtitle: result.exam_title,
        time: new Date(result.finished_at!),
        status: result.percentage >= 70 ? 'success' : 'warning'
      });
    });

    // Adicionar provas criadas recentemente
    const recentExams = exams?.filter((exam: any) => exam.created_at)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2) || [];

    recentExams.forEach((exam: any) => {
      activities.push({
        type: 'exam',
        title: 'Nova prova criada',
        subtitle: exam.title,
        time: new Date(exam.created_at),
        status: 'info'
      });
    });

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [results, exams]);

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'professor' && user?.role !== 'admin')) {
    router.push('/login');
    return null;
  }

  if (classesLoading || examsLoading || resultsLoading) {
    return <LoadingSpinner />;
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'info':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta, {user?.name}!</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/teacher/exams/create')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Prova
          </Button>
          <Button variant="outline" onClick={() => router.push('/teacher/classes')}>
            <Users className="w-4 h-4 mr-2" />
            Gerenciar Turmas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Provas */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Próximas Provas</CardTitle>
              <CardDescription>Provas agendadas para os próximos dias</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/teacher/exams')}>
              Ver todas
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam: any) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{exam.title}</h4>
                    <p className="text-sm text-gray-600">{exam.class_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDateTime(new Date(exam.start_time))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {exam.duration_minutes}min
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/teacher/exams/${exam.id}`)}
                    >
                      Ver
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma prova agendada</p>
                <Button
                  variant="link"
                  onClick={() => router.push('/teacher/exams/create')}
                  className="mt-2"
                >
                  Criar primeira prova
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Monitoramento */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-500" />
                Alertas de Monitoramento
              </CardTitle>
              <CardDescription>Comportamentos suspeitos detectados</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/teacher/monitoring')}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum alerta recente</p>
              <p className="text-sm mt-2">Suas provas estão sendo monitoradas normalmente</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/teacher/monitoring')}
                className="mt-4"
              >
                Ver Relatório Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Atividades Recentes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações em suas turmas</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/teacher/results')}>
            Ver todas
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(activity.time)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades mais usadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/teacher/questions/new-question')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Nova Questão</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/teacher/classes')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Turmas</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/teacher/questions')}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Banco de Questões</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/teacher/results')}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 