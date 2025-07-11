"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalytics } from "@/hooks/useAnalytics"
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

// Cores para os gráficos
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function DashboardPage() {
  const router = useRouter()
  const { analytics, isLoading, error } = useAnalytics()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return <div className="p-6">Nenhum dado disponível</div>
  }

  const stats = [
    {
      title: "Total de Provas",
      value: analytics.general_stats.total_exams,
      description: "Provas criadas no sistema",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Estudantes Ativos",
      value: analytics.general_stats.total_students,
      description: "Usuários cadastrados",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Precisão IA",
      value: `${analytics.general_stats.avg_auto_precision}%`,
      description: "Correção automática",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Tempo Médio",
      value: `${analytics.general_stats.avg_exam_duration}min`,
      description: "Duração das provas",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Taxa de Conclusão",
      value: `${analytics.performance_metrics.completion_rate}%`,
      description: "Provas completadas",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Correção Automática",
      value: `${analytics.performance_metrics.auto_correction_rate}%`,
      description: "Questões corrigidas por IA",
      icon: ClipboardCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ]

  // Dados para o gráfico de distribuição de notas
  const gradeData = Object.entries(analytics.grade_distribution).map(([grade, count]) => ({
    grade,
    count
  }))

  // Dados para o gráfico de tipos de questão
  const questionTypeData = analytics.question_types.map(qt => ({
    type: qt.type === 'multiple_choice' ? 'Múltipla Escolha' :
      qt.type === 'essay' ? 'Dissertativa' :
        qt.type === 'true_false' ? 'Verdadeiro/Falso' :
          qt.type === 'short_answer' ? 'Resposta Curta' : qt.type,
    count: qt.count
  }))

  // Dados para o gráfico de correção
  const correctionData = [
    { name: 'Automática', value: analytics.correction_stats.auto_corrected },
    { name: 'Manual', value: analytics.correction_stats.manual_corrected },
    { name: 'Pendente', value: analytics.correction_stats.pending_correction }
  ]

  // Dados para o gráfico de uso diário
  const dailyUsageData = analytics.daily_usage.slice(-14).map(du => ({
    date: new Date(du.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    inscricoes: du.enrollments
  }))

  // Dados para o gráfico de eventos de monitoramento
  const monitoringData = analytics.monitoring_events.map(me => ({
    type: me.type === 'tab_change' ? 'Mudança de Aba' :
      me.type === 'copy_paste' ? 'Copiar/Colar' :
        me.type === 'suspicious_activity' ? 'Atividade Suspeita' :
          me.type === 'page_blur' ? 'Perda de Foco' : me.type,
    count: me.count
  }))

  // Dados para o gráfico radar de satisfação (removendo responsividade)
  const satisfactionData = [
    {
      category: 'Design',
      value: analytics.platform_evaluations.design_rating || 0
    },
    {
      category: 'Cores',
      value: analytics.platform_evaluations.colors_rating || 0
    },
    {
      category: 'Layout',
      value: analytics.platform_evaluations.layout_rating || 0
    },
    {
      category: 'Navegação',
      value: analytics.platform_evaluations.navigation_rating || 0
    },
    {
      category: 'Menus',
      value: analytics.platform_evaluations.menus_rating || 0
    },
    {
      category: 'Velocidade',
      value: analytics.platform_evaluations.loading_speed_rating || 0
    },
    {
      category: 'Instruções',
      value: analytics.platform_evaluations.instructions_rating || 0
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Analítico</h1>
          <p className="text-muted-foreground">Análise profunda do sistema de avaliação</p>
        </div>
        <Button
          onClick={() => router.push("/admin/exams/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Prova
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribuição de Notas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribuição de Notas
            </CardTitle>
            <CardDescription>Análise do desempenho acadêmico</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tipos de Questão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tipos de Questão
            </CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={questionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {questionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Correção Automática vs Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Correção Automática vs Manual
            </CardTitle>
            <CardDescription>Eficiência da IA na correção</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={correctionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {correctionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uso Diário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uso Diário (Últimas 2 Semanas)
            </CardTitle>
            <CardDescription>Inscrições em provas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="inscricoes" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eventos de Monitoramento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Eventos de Monitoramento
            </CardTitle>
            <CardDescription>Atividades detectadas durante provas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monitoringData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfação da Plataforma (sem responsividade) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Satisfação da Plataforma
            </CardTitle>
            <CardDescription>Avaliação dos usuários (escala 1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={satisfactionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Satisfação"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas de Performance do Sistema
          </CardTitle>
          <CardDescription>Indicadores chave de desempenho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.performance_metrics.completion_rate}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
              <div className="text-xs text-muted-foreground mt-1">
                Percentual de provas concluídas pelos estudantes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.performance_metrics.auto_correction_rate}%
              </div>
              <div className="text-sm text-muted-foreground">Correção Automática</div>
              <div className="text-xs text-muted-foreground mt-1">
                Percentual de questões corrigidas automaticamente
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analytics.performance_metrics.platform_satisfaction}/5
              </div>
              <div className="text-sm text-muted-foreground">Satisfação Geral</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avaliação média da plataforma pelos usuários
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
