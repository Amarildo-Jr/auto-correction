'use client';

import ClientOnly from '@/components/ClientOnly';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/contexts/AppContext';
import { AlertTriangle, ArrowLeft, BarChart3, Clock, Eye, Shield, TrendingUp, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MonitoringAlert {
  id: number;
  exam_id: number;
  exam_title: string;
  student_id: number;
  student_name: string;
  activity_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_data: any;
  created_at: string;
}

interface MonitoringStats {
  total_exams_monitored: number;
  total_alerts: number;
  critical_cases: number;
  compliance_rate: number;
  alerts_by_type: Record<string, number>;
  recent_activity: any[];
}

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export default function TeacherMonitoringPage() {
  return (
    <ClientOnly fallback={<LoadingSpinner />}>
      <TeacherMonitoringContent />
    </ClientOnly>
  );
}

function TeacherMonitoringContent() {
  const { user, isAuthenticated } = useAppContext();
  const router = useRouter();
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');

  useEffect(() => {
    loadMonitoringData();
  }, []);

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'professor' && user?.role !== 'admin')) {
    router.push('/login');
    return null;
  }

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar alertas do dashboard
      const alertsResponse = await apiRequest('/api/monitoring/dashboard-alerts');
      setAlerts(alertsResponse.alerts || []);

      // Calcular estatísticas baseadas nos dados reais
      const totalAlerts = alertsResponse.alerts?.length || 0;
      const criticalCases = alertsResponse.alerts?.filter((alert: any) => alert.severity === 'critical').length || 0;
      const alertsByType = alertsResponse.alerts?.reduce((acc: any, alert: any) => {
        acc[alert.activity_type] = (acc[alert.activity_type] || 0) + 1;
        return acc;
      }, {}) || {};

      setStats({
        total_exams_monitored: alertsResponse.total_exams || 0,
        total_alerts: totalAlerts,
        critical_cases: criticalCases,
        compliance_rate: totalAlerts > 0 ? Math.max(0, 100 - (criticalCases / totalAlerts * 100)) : 100,
        alerts_by_type: alertsByType,
        recent_activity: alertsResponse.recent_activity || []
      });

    } catch (err: any) {
      console.error('Erro ao carregar dados de monitoramento:', err);
      setError(err.message || 'Erro ao carregar dados de monitoramento');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'excessive_tab_switching': 'Múltiplas trocas de aba',
      'copy_paste_attempt': 'Tentativa de copiar/colar',
      'extended_focus_loss': 'Perda de foco prolongada',
      'dev_tools_attempt': 'Tentativa de abrir dev tools',
      'right_click_attempt': 'Múltiplos cliques direitos',
      'page_refresh_attempt': 'Tentativa de atualizar página',
      'text_selection': 'Seleção de texto suspeita',
      'mouse_inactive': 'Mouse inativo por muito tempo'
    };
    return labels[type] || type;
  };

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const examMatch = selectedExam === 'all' || alert.exam_id.toString() === selectedExam;
    return severityMatch && examMatch;
  });

  const uniqueExams = Array.from(new Set(alerts.map(alert => ({ id: alert.exam_id, title: alert.exam_title }))))
    .filter((exam, index, self) => self.findIndex(e => e.id === exam.id) === index);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro: {error}</p>
              <Button onClick={loadMonitoringData}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            onClick={() => router.push('/teacher/dashboard')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Monitoramento Geral</h1>
          <p className="text-gray-600 mt-1">Visão completa das atividades de monitoramento</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Provas Monitoradas</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_exams_monitored || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_alerts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Casos Críticos</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.critical_cases || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conformidade</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.compliance_rate.toFixed(1) || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as severidades</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por prova" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as provas</SelectItem>
                  {uniqueExams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Alertas de Monitoramento</CardTitle>
          <CardDescription>
            Lista completa de comportamentos suspeitos detectados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Prova</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {alert.student_name}
                      </div>
                    </TableCell>
                    <TableCell>{alert.exam_title}</TableCell>
                    <TableCell>{getActivityTypeLabel(alert.activity_type)}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity)}>
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(alert.severity)}
                          {alert.severity.toUpperCase()}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/teacher/exams/${alert.exam_id}/monitoring`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum alerta encontrado</p>
              <p className="text-sm mt-2">
                {selectedSeverity !== 'all' || selectedExam !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Suas provas estão sendo monitoradas normalmente'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 