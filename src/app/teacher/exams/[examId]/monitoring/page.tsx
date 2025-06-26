'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { monitoringService } from '@/services/api';
import { AlertTriangle, ArrowLeft, BarChart3, Eye, Shield, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MonitoringStats {
  exam_id: number;
  exam_title: string;
  total_students: number;
  total_suspicious_events: number;
  high_risk_students: number;
  medium_risk_students: number;
  overall_risk_level: 'low' | 'medium' | 'high';
  student_stats: Record<string, any>;
}

export default function ExamMonitoringPage({ params }: { params: { examId: string } }) {
  const { user, isAuthenticated } = useAppContext();
  const router = useRouter();
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'professor' && user?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    loadMonitoringStats();
  }, [isAuthenticated, user?.role, params.examId]);

  const loadMonitoringStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await monitoringService.getExamMonitoringStats(parseInt(params.examId));
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas de monitoramento');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low':
        return <Shield className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadMonitoringStats} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhuma estatística disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentStatsList = Object.values(stats.student_stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoramento da Prova</h1>
            <p className="text-gray-600 mt-1">{stats.exam_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getRiskIcon(stats.overall_risk_level)}
          <Badge className={getRiskColor(stats.overall_risk_level)}>
            Risco {stats.overall_risk_level === 'low' ? 'Baixo' : stats.overall_risk_level === 'medium' ? 'Médio' : 'Alto'}
          </Badge>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Suspeitos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.total_suspicious_events}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">{stats.high_risk_students}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Médio Risco</p>
                <p className="text-2xl font-bold text-orange-600">{stats.medium_risk_students}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento por Aluno</CardTitle>
          <CardDescription>
            Estatísticas detalhadas de comportamento para cada estudante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentStatsList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum aluno realizou esta prova ainda.</p>
              </div>
            ) : (
              studentStatsList.map((student: any) => (
                <div
                  key={student.enrollment_id}
                  className={`p-4 rounded-lg border-2 ${getRiskColor(student.risk_level)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRiskIcon(student.risk_level)}
                      <div>
                        <h3 className="font-medium text-gray-900">{student.student_name}</h3>
                        <p className="text-sm text-gray-600">
                          {student.total_events} eventos suspeitos • Score de risco: {student.risk_score}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(student.risk_level)}>
                        {student.risk_level === 'low' ? 'Baixo' : student.risk_level === 'medium' ? 'Médio' : 'Alto'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/teacher/results/${student.enrollment_id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>

                  {/* Padrões Detectados */}
                  {student.patterns && student.patterns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Padrões Detectados:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.patterns.map((pattern: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contadores de Atividades */}
                  {student.activity_counts && Object.keys(student.activity_counts).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Atividades:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(student.activity_counts).map(([activity, count]: [string, any]) => (
                          <div key={activity} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {activity.replace(/_/g, ' ')}:
                            </span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
          <CardDescription>
            Baseado na análise de comportamento dos alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.high_risk_students > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  ⚠️ {stats.high_risk_students} aluno(s) com alto risco detectado
                </p>
                <p className="text-sm text-red-600">
                  Recomenda-se revisão manual das provas e contato com os alunos para esclarecimentos.
                </p>
              </div>
            )}

            {stats.medium_risk_students > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  📋 {stats.medium_risk_students} aluno(s) com risco médio
                </p>
                <p className="text-sm text-orange-600">
                  Monitore estes alunos mais de perto e verifique as respostas com atenção extra.
                </p>
              </div>
            )}

            {stats.overall_risk_level === 'low' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✅ Baixo risco geral detectado
                </p>
                <p className="text-sm text-green-600">
                  A prova foi realizada dentro dos padrões normais de comportamento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 