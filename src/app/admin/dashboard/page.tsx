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

  // Dados para o gráfico de dificuldade percebida
  const difficultyData = [
    { name: 'Muito Fácil', value: analytics.user_difficulty_stats.registration_very_easy || 0 },
    { name: 'Fácil', value: analytics.user_difficulty_stats.registration_easy || 0 },
    { name: 'Regular', value: analytics.user_difficulty_stats.registration_regular || 0 },
    { name: 'Difícil', value: analytics.user_difficulty_stats.registration_difficult || 0 },
    { name: 'Muito Difícil', value: analytics.user_difficulty_stats.registration_very_difficult || 0 }
  ]

  // Dados para o gráfico de problemas encontrados
  const problemData = [
    { name: 'Erros Técnicos', value: analytics.problem_stats.technical_errors || 0 },
    { name: 'Problemas Funcionais', value: analytics.problem_stats.functionality_issues || 0 },
    { name: 'Momentos de Confusão', value: analytics.problem_stats.confusion_moments || 0 },
    { name: 'Recursos Ausentes', value: analytics.problem_stats.missing_features || 0 }
  ]

  // Dados para o gráfico de recomendação
  const recommendationData = [
    { name: 'Definitivamente Sim', value: analytics.recommendation_stats.definitely_yes || 0 },
    { name: 'Provavelmente Sim', value: analytics.recommendation_stats.probably_yes || 0 },
    { name: 'Talvez', value: analytics.recommendation_stats.maybe || 0 },
    { name: 'Provavelmente Não', value: analytics.recommendation_stats.probably_no || 0 },
    { name: 'Definitivamente Não', value: analytics.recommendation_stats.definitely_no || 0 }
  ]

  // Dados para o gráfico de dispositivos
  const deviceData = [
    { name: 'Desktop', value: analytics.device_stats.desktop || 0 },
    { name: 'Tablet', value: analytics.device_stats.tablet || 0 },
    { name: 'Smartphone', value: analytics.device_stats.smartphone || 0 }
  ]

  // Dados para gráfico de funcionalidades da plataforma
  const platformFeaturesData = [
    { name: 'Registro', value: analytics.platform_evaluations.registration_rating || 0 },
    { name: 'Login', value: analytics.platform_evaluations.login_rating || 0 },
    { name: 'Inscrição em Turmas', value: analytics.platform_evaluations.class_enrollment_rating || 0 },
    { name: 'Realização de Provas', value: analytics.platform_evaluations.exam_taking_rating || 0 },
    { name: 'Visualização de Resultados', value: analytics.platform_evaluations.results_rating || 0 }
  ]

  // Dados para análise temporal de notas
  const gradeAnalysisData = Object.entries(analytics.grade_distribution).map(([grade, count]) => ({
    grade: grade.replace('(', '').replace(')', ''),
    count,
    percentage: Math.round((count / (analytics.general_stats.total_students || 1)) * 100)
  }))

  // Dados para análise de eficiência do sistema
  const systemEfficiencyData = [
    {
      name: 'Taxa de Conclusão',
      value: analytics.performance_metrics.completion_rate,
      color: '#10B981'
    },
    {
      name: 'Correção Automática',
      value: analytics.performance_metrics.auto_correction_rate,
      color: '#3B82F6'
    },
    {
      name: 'Satisfação da Plataforma',
      value: analytics.performance_metrics.platform_satisfaction * 20, // convertendo para porcentagem
      color: '#8B5CF6'
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

      {/* Gráficos de Análise Principal */}
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

      {/* Análises Aprofundadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Dificuldade Percebida pelos Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dificuldade Percebida no Registro
            </CardTitle>
            <CardDescription>Facilidade relatada pelos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Problemas Encontrados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Problemas Reportados
            </CardTitle>
            <CardDescription>Dificuldades encontradas pelos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={problemData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {problemData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recomendações dos Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recomendações dos Usuários
            </CardTitle>
            <CardDescription>Propensão de recomendação da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recommendationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dispositivos Utilizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dispositivos Utilizados
            </CardTitle>
            <CardDescription>Preferências de acesso à plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funcionalidades da Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Avaliação das Funcionalidades
            </CardTitle>
            <CardDescription>Satisfação com recursos específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={platformFeaturesData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Funcionalidades"
                  dataKey="value"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análise Comparativa de Desempenho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Análise Comparativa de Desempenho
            </CardTitle>
            <CardDescription>Notas vs Taxa de Participação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Quantidade" />
                <Bar dataKey="percentage" fill="#10B981" name="Percentual" />
              </BarChart>
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

      {/* Gráfico de Eficiência do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Eficiência Geral do Sistema
          </CardTitle>
          <CardDescription>Comparativo de métricas principais</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
