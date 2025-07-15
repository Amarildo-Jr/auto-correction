'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Monitor,
  Phone,
  RefreshCw,
  Smartphone,
  Star,
  Tablet,
  ThumbsUp,
  TrendingUp,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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
} from 'recharts'

interface EvaluationStats {
  total_evaluations: number
  user_roles: Array<{ role: string, count: number }>
  rating_averages: {
    design: number
    colors: number
    layout: number
    responsiveness: number
    navigation: number
    menus: number
    loading_speed: number
    instructions: number
    registration: number
    login: number
    class_enrollment: number
    exam_taking: number
    results: number
  }
  recommendation_distribution: Array<{ recommendation: string, count: number }>
  general_impression_distribution: Array<{ impression: string, count: number }>
  problems_reported: {
    technical_errors: number
    functionality_issues: number
    confusion_moments: number
    missing_features: number
  }
  device_distribution: Array<{ device: string, count: number }>
  browser_distribution: Array<{ browser: string, count: number }>
}

interface Evaluation {
  id: number
  user_name: string
  user_role: string
  general_impression: string
  recommendation: string
  created_at: string

  // Campos textuais
  additional_comments?: string
  registration_problems?: string
  login_comments?: string
  class_finding_comments?: string
  class_process_comments?: string
  exam_instructions_comments?: string
  timer_comments?: string
  question_navigation_comments?: string
  answer_area_comments?: string
  exam_finish_comments?: string
  results_comments?: string
  essay_feedback_comments?: string
  technical_errors_description?: string
  functionality_issues_description?: string
  confusion_description?: string
  missing_features_description?: string
  platform_changes?: string
  desired_features?: string
  ux_suggestions?: string

  // Campos booleanos para problemas
  technical_errors: boolean
  functionality_issues: boolean
  confusion_moments: boolean
  missing_features: boolean

  // Informações técnicas
  device_type: string
  browser: string
  operating_system: string

  // Campos específicos de experiência
  registration_ease: string
  login_intuitive: boolean
  class_finding_easy: boolean
  class_process_clear: boolean
  exam_instructions_clear: boolean
  timer_visible: boolean
  question_navigation_easy: boolean
  answer_area_adequate: boolean
  exam_finish_difficulty: boolean
  results_clear: boolean
  essay_feedback_useful?: boolean
}

export default function AdminFeedbacksPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/platform-evaluations/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvaluations = async (page: number = 1) => {
    try {
      const response = await api.get(`/api/admin/platform-evaluations?page=${page}&per_page=10`)
      setEvaluations(response.data.evaluations)
      setCurrentPage(response.data.pagination.current_page)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    }
  }

  const loadAllEvaluations = async () => {
    try {
      const response = await api.get('/api/admin/platform-evaluations/export')
      setAllEvaluations(response.data.evaluations)
    } catch (error) {
      console.error('Erro ao carregar todas as avaliações:', error)
    }
  }

  const exportEvaluations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/platform-evaluations/export')

      // Criar e baixar arquivo JSON
      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `platform-evaluations-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar avaliações:', error)
      alert('Erro ao exportar avaliações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadEvaluations()
    loadAllEvaluations()
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationText = (rec: string) => {
    const map: { [key: string]: string } = {
      'definitely_yes': 'Definitivamente sim',
      'probably_yes': 'Provavelmente sim',
      'maybe': 'Talvez',
      'probably_no': 'Provavelmente não',
      'definitely_no': 'Definitivamente não'
    }
    return map[rec] || rec
  }

  const getImpressionText = (imp: string) => {
    const map: { [key: string]: string } = {
      'excellent': 'Excelente',
      'good': 'Boa',
      'regular': 'Regular',
      'bad': 'Ruim',
      'very_bad': 'Muito ruim'
    }
    return map[imp] || imp
  }

  const getRegistrationEaseText = (ease: string) => {
    const map: { [key: string]: string } = {
      'very_easy': 'Muito fácil',
      'easy': 'Fácil',
      'regular': 'Regular',
      'difficult': 'Difícil',
      'very_difficult': 'Muito difícil'
    }
    return map[ease] || ease
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'smartphone': return <Phone className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  // Função para filtrar comentários não vazios
  const getTextualComments = (evaluation: Evaluation) => {
    const comments = []

    if (evaluation.registration_problems) {
      comments.push({ category: 'Problemas no Registro', text: evaluation.registration_problems })
    }
    if (evaluation.login_comments) {
      comments.push({ category: 'Comentários sobre Login', text: evaluation.login_comments })
    }
    if (evaluation.class_finding_comments) {
      comments.push({ category: 'Busca de Turmas', text: evaluation.class_finding_comments })
    }
    if (evaluation.class_process_comments) {
      comments.push({ category: 'Processo de Inscrição', text: evaluation.class_process_comments })
    }
    if (evaluation.exam_instructions_comments) {
      comments.push({ category: 'Instruções da Prova', text: evaluation.exam_instructions_comments })
    }
    if (evaluation.timer_comments) {
      comments.push({ category: 'Timer da Prova', text: evaluation.timer_comments })
    }
    if (evaluation.question_navigation_comments) {
      comments.push({ category: 'Navegação entre Questões', text: evaluation.question_navigation_comments })
    }
    if (evaluation.answer_area_comments) {
      comments.push({ category: 'Área de Resposta', text: evaluation.answer_area_comments })
    }
    if (evaluation.exam_finish_comments) {
      comments.push({ category: 'Finalização da Prova', text: evaluation.exam_finish_comments })
    }
    if (evaluation.results_comments) {
      comments.push({ category: 'Visualização de Resultados', text: evaluation.results_comments })
    }
    if (evaluation.essay_feedback_comments) {
      comments.push({ category: 'Feedback das Redações', text: evaluation.essay_feedback_comments })
    }
    if (evaluation.technical_errors_description) {
      comments.push({ category: 'Erros Técnicos', text: evaluation.technical_errors_description })
    }
    if (evaluation.functionality_issues_description) {
      comments.push({ category: 'Problemas de Funcionalidade', text: evaluation.functionality_issues_description })
    }
    if (evaluation.confusion_description) {
      comments.push({ category: 'Momentos de Confusão', text: evaluation.confusion_description })
    }
    if (evaluation.missing_features_description) {
      comments.push({ category: 'Recursos Ausentes', text: evaluation.missing_features_description })
    }
    if (evaluation.platform_changes) {
      comments.push({ category: 'Mudanças Sugeridas', text: evaluation.platform_changes })
    }
    if (evaluation.desired_features) {
      comments.push({ category: 'Recursos Desejados', text: evaluation.desired_features })
    }
    if (evaluation.ux_suggestions) {
      comments.push({ category: 'Sugestões de UX', text: evaluation.ux_suggestions })
    }
    if (evaluation.additional_comments) {
      comments.push({ category: 'Comentários Adicionais', text: evaluation.additional_comments })
    }

    return comments
  }

  // Função para extrair todos os comentários textuais por categoria
  const getAllCommentsByCategory = () => {
    const commentsByCategory: { [key: string]: Array<{ user: string, role: string, text: string, date: string }> } = {}

    allEvaluations.forEach(evaluation => {
      const comments = getTextualComments(evaluation)
      comments.forEach(comment => {
        if (!commentsByCategory[comment.category]) {
          commentsByCategory[comment.category] = []
        }
        commentsByCategory[comment.category].push({
          user: evaluation.user_name,
          role: evaluation.user_role,
          text: comment.text,
          date: evaluation.created_at
        })
      })
    })

    return commentsByCategory
  }

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando feedbacks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Feedbacks da Plataforma</h1>
          <p className="text-gray-600">Análise completa das avaliações dos usuários com comentários detalhados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadStats} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportEvaluations} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_evaluations}</div>
                <p className="text-xs text-muted-foreground">
                  Feedbacks coletados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((stats.rating_averages.design + stats.rating_averages.navigation + stats.rating_averages.exam_taking) / 3).toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Nota geral da plataforma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comentários Textuais</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allEvaluations.reduce((total, evaluation) => {
                    return total + getTextualComments(evaluation).length
                  }, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comentários detalhados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recomendações Positivas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (stats.recommendation_distribution
                      .filter(r => ['definitely_yes', 'probably_yes'].includes(r.recommendation))
                      .reduce((sum, r) => sum + r.count, 0) / stats.total_evaluations) * 100
                  )}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuários que recomendam
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="ratings">Avaliações</TabsTrigger>
              <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
              <TabsTrigger value="comments">Comentários Detalhados</TabsTrigger>
              <TabsTrigger value="problems">Problemas & Sugestões</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Avançado</TabsTrigger>
              <TabsTrigger value="technical">Informações Técnicas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Distribuição por Tipo de Usuário */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações por Tipo de Usuário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.user_roles}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ role, count }) => `${role}: ${count}`}
                        >
                          {stats.user_roles.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.recommendation_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="recommendation"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => getRecommendationText(value as string)}
                        />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Impressão Geral */}
              <Card>
                <CardHeader>
                  <CardTitle>Impressão Geral da Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.general_impression_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="impression"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => getImpressionText(value as string)}
                      />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6">
              {/* Médias das Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle>Médias das Avaliações por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.rating_averages)
                      .filter(([key]) => key !== 'responsiveness') // Ocultar responsividade
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 border rounded">
                          <span className="text-sm font-medium">
                            {key === 'design' ? 'Design' :
                              key === 'colors' ? 'Cores' :
                                key === 'layout' ? 'Layout' :
                                  key === 'navigation' ? 'Navegação' :
                                    key === 'menus' ? 'Menus' :
                                      key === 'loading_speed' ? 'Velocidade de Carregamento' :
                                        key === 'instructions' ? 'Instruções' :
                                          key === 'registration' ? 'Registro' :
                                            key === 'login' ? 'Login' :
                                              key === 'class_enrollment' ? 'Inscrição em Turmas' :
                                                key === 'exam_taking' ? 'Realização de Provas' :
                                                  key === 'results' ? 'Visualização de Resultados' : key}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getRatingColor(value)}`}>
                              {value.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Barras das Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={Object.entries(stats.rating_averages)
                        .filter(([key]) => key !== 'responsiveness') // Ocultar responsividade
                        .map(([key, value]) => ({
                          category: key === 'design' ? 'Design' :
                            key === 'colors' ? 'Cores' :
                              key === 'layout' ? 'Layout' :
                                key === 'navigation' ? 'Navegação' :
                                  key === 'menus' ? 'Menus' :
                                    key === 'loading_speed' ? 'Velocidade de Carregamento' :
                                      key === 'instructions' ? 'Instruções' :
                                        key === 'registration' ? 'Registro' :
                                          key === 'login' ? 'Login' :
                                            key === 'class_enrollment' ? 'Inscrição em Turmas' :
                                              key === 'exam_taking' ? 'Realização de Provas' :
                                                key === 'results' ? 'Visualização de Resultados' : key,
                          rating: value
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              {/* Problemas Reportados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Problemas Reportados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Erros Técnicos</span>
                        <Badge variant="destructive">{stats.problems_reported.technical_errors}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Problemas de Funcionalidade</span>
                        <Badge variant="destructive">{stats.problems_reported.functionality_issues}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Momentos de Confusão</span>
                        <Badge variant="secondary">{stats.problems_reported.confusion_moments}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Funcionalidades Ausentes</span>
                        <Badge variant="secondary">{stats.problems_reported.missing_features}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Feedbacks Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Feedbacks Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {evaluations.slice(0, 5).map((evaluation) => (
                          <div key={evaluation.id} className="border-b pb-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{evaluation.user_name}</span>
                                <Badge variant="outline">
                                  {evaluation.user_role}
                                </Badge>
                                {getDeviceIcon(evaluation.device_type)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                variant={evaluation.general_impression === 'excellent' || evaluation.general_impression === 'good' ? 'default' : 'secondary'}
                              >
                                {getImpressionText(evaluation.general_impression)}
                              </Badge>
                              <Badge
                                variant={evaluation.recommendation.includes('yes') ? 'default' : 'secondary'}
                              >
                                {getRecommendationText(evaluation.recommendation)}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <strong>Sistema:</strong> {evaluation.operating_system} • <strong>Navegador:</strong> {evaluation.browser}
                              </div>

                              {evaluation.additional_comments && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <MessageCircle className="w-4 h-4 inline mr-1" />
                                  <strong>Comentário:</strong> &quot;{evaluation.additional_comments.substring(0, 150)}{evaluation.additional_comments.length > 150 ? '...' : ''}&quot;
                                </div>
                              )}

                              {/* Mostrar número de comentários adicionais */}
                              {getTextualComments(evaluation).length > 0 && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {getTextualComments(evaluation).length} comentários detalhados
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Paginação simplificada */}
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadEvaluations(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <span className="px-4 py-2 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadEvaluations(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comentários Detalhados por Categoria
                  </CardTitle>
                  <CardDescription>
                    Todos os comentários textuais organizados por categoria de funcionalidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-6">
                      {Object.entries(getAllCommentsByCategory()).map(([category, comments]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {category}
                            <Badge variant="secondary" className="ml-2">
                              {comments.length} comentários
                            </Badge>
                          </h3>

                          <div className="space-y-3">
                            {comments.map((comment, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium text-sm">{comment.user}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {comment.role}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  &quot;{comment.text}&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="problems" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problemas Técnicos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Problemas Técnicos Reportados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {allEvaluations
                          .filter(evaluation => evaluation.technical_errors && evaluation.technical_errors_description)
                          .map((evaluation, index) => (
                            <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-300">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{evaluation.user_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {evaluation.user_role}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">
                                {evaluation.technical_errors_description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                {getDeviceIcon(evaluation.device_type)}
                                {evaluation.browser} • {evaluation.operating_system}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Problemas de Funcionalidade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Problemas de Funcionalidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {allEvaluations
                          .filter(evaluation => evaluation.functionality_issues && evaluation.functionality_issues_description)
                          .map((evaluation, index) => (
                            <div key={index} className="bg-orange-50 p-3 rounded border-l-4 border-orange-300">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{evaluation.user_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {evaluation.user_role}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">
                                &quot;{evaluation.functionality_issues_description}&quot;
                              </p>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Sugestões de Melhorias */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Sugestões de Melhorias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {allEvaluations
                          .filter(evaluation => evaluation.platform_changes || evaluation.ux_suggestions)
                          .map((evaluation, index) => (
                            <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{evaluation.user_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {evaluation.user_role}
                                </Badge>
                              </div>
                              {evaluation.platform_changes && (
                                <div className="mb-2">
                                  <strong className="text-xs text-gray-600">Mudanças sugeridas:</strong>
                                  <p className="text-sm text-gray-700">&quot;{evaluation.platform_changes}&quot;</p>
                                </div>
                              )}
                              {evaluation.ux_suggestions && (
                                <div>
                                  <strong className="text-xs text-gray-600">Sugestões de UX:</strong>
                                  <p className="text-sm text-gray-700">&quot;{evaluation.ux_suggestions}&quot;</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recursos Desejados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                      Recursos Desejados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {allEvaluations
                          .filter(evaluation => evaluation.desired_features || evaluation.missing_features_description)
                          .map((evaluation, index) => (
                            <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-300">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{evaluation.user_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {evaluation.user_role}
                                </Badge>
                              </div>
                              {evaluation.desired_features && (
                                <div className="mb-2">
                                  <strong className="text-xs text-gray-600">Recursos desejados:</strong>
                                  <p className="text-sm text-gray-700">&quot;{evaluation.desired_features}&quot;</p>
                                </div>
                              )}
                              {evaluation.missing_features_description && (
                                <div>
                                  <strong className="text-xs text-gray-600">Recursos ausentes:</strong>
                                  <p className="text-sm text-gray-700">&quot;{evaluation.missing_features_description}&quot;</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Gráficos Analíticos Avançados */}

              {/* Análise Radar de Satisfação */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Análise Radar de Satisfação
                    </CardTitle>
                    <CardDescription>Visualização multidimensional das avaliações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={Object.entries(stats.rating_averages)
                        .filter(([key]) => key !== 'responsiveness') // Removendo responsividade
                        .map(([key, value]) => ({
                          category: key === 'design' ? 'Design' :
                            key === 'colors' ? 'Cores' :
                              key === 'layout' ? 'Layout' :
                                key === 'navigation' ? 'Navegação' :
                                  key === 'menus' ? 'Menus' :
                                    key === 'loading_speed' ? 'Velocidade' :
                                      key === 'instructions' ? 'Instruções' :
                                        key === 'registration' ? 'Registro' :
                                          key === 'login' ? 'Login' :
                                            key === 'class_enrollment' ? 'Inscrição' :
                                              key === 'exam_taking' ? 'Realização de Provas' :
                                                key === 'results' ? 'Resultados' : key,
                          value: value
                        }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                        <Radar
                          name="Satisfação"
                          dataKey="value"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Tendência de Problemas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Análise de Problemas Reportados
                    </CardTitle>
                    <CardDescription>Distribuição dos tipos de problemas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Erros Técnicos', value: stats.problems_reported.technical_errors, color: '#EF4444' },
                            { name: 'Problemas Funcionais', value: stats.problems_reported.functionality_issues, color: '#F97316' },
                            { name: 'Momentos de Confusão', value: stats.problems_reported.confusion_moments, color: '#EAB308' },
                            { name: 'Recursos Ausentes', value: stats.problems_reported.missing_features, color: '#8B5CF6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {[
                            { name: 'Erros Técnicos', value: stats.problems_reported.technical_errors },
                            { name: 'Problemas Funcionais', value: stats.problems_reported.functionality_issues },
                            { name: 'Momentos de Confusão', value: stats.problems_reported.confusion_moments },
                            { name: 'Recursos Ausentes', value: stats.problems_reported.missing_features }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Análise Comparativa de Interface */}
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Análise Comparativa de Interface (Sem Responsividade)
                    </CardTitle>
                    <CardDescription>Comparação das categorias de interface excluindo responsividade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={Object.entries(stats.rating_averages)
                          .filter(([key]) => ['design', 'colors', 'layout', 'navigation', 'menus'].includes(key))
                          .map(([key, value]) => ({
                            category: key === 'design' ? 'Design' :
                              key === 'colors' ? 'Cores' :
                                key === 'layout' ? 'Layout' :
                                  key === 'navigation' ? 'Navegação' :
                                    key === 'menus' ? 'Menus' : key,
                            rating: value,
                            target: 4.0 // Meta de satisfação
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rating" fill="#3B82F6" name="Avaliação Atual" />
                        <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={3} name="Meta (4.0)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Análise de Funcionalidades vs Experiência */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Performance de Funcionalidades
                    </CardTitle>
                    <CardDescription>Avaliação específica das funcionalidades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart
                        data={Object.entries(stats.rating_averages)
                          .filter(([key]) => ['registration', 'login', 'class_enrollment', 'exam_taking', 'results'].includes(key))
                          .map(([key, value]) => ({
                            functionality: key === 'registration' ? 'Registro' :
                              key === 'login' ? 'Login' :
                                key === 'class_enrollment' ? 'Inscrição' :
                                  key === 'exam_taking' ? 'Provas' :
                                    key === 'results' ? 'Resultados' : key,
                            rating: value
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="functionality" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="rating" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Score de Usabilidade
                    </CardTitle>
                    <CardDescription>Métricas consolidadas de experiência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Score Geral */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {(Object.values(stats.rating_averages)
                            .filter((_, index) => Object.keys(stats.rating_averages)[index] !== 'responsiveness')
                            .reduce((a, b) => a + b, 0) /
                            (Object.keys(stats.rating_averages).length - 1)).toFixed(1)}
                        </div>
                        <div className="text-lg text-muted-foreground">Score Geral (sem responsividade)</div>
                      </div>

                      {/* Métricas Individuais */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Interface & Design</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${((stats.rating_averages.design + stats.rating_averages.colors + stats.rating_averages.layout) / 3 / 5) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {((stats.rating_averages.design + stats.rating_averages.colors + stats.rating_averages.layout) / 3).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Navegação & Usabilidade</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${((stats.rating_averages.navigation + stats.rating_averages.menus + stats.rating_averages.instructions) / 3 / 5) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {((stats.rating_averages.navigation + stats.rating_averages.menus + stats.rating_averages.instructions) / 3).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Funcionalidades</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${((stats.rating_averages.registration + stats.rating_averages.login + stats.rating_averages.exam_taking) / 3 / 5) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {((stats.rating_averages.registration + stats.rating_averages.login + stats.rating_averages.exam_taking) / 3).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Análise de Dispositivos e Recomendações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Preferências de Dispositivos
                    </CardTitle>
                    <CardDescription>Análise de uso por tipo de dispositivo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={stats.device_distribution.map(device => ({
                        device: device.device === 'desktop' ? 'Desktop' :
                          device.device === 'tablet' ? 'Tablet' :
                            device.device === 'smartphone' ? 'Smartphone' : device.device,
                        count: device.count,
                        percentage: Math.round((device.count / stats.total_evaluations) * 100)
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="device" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [
                          name === 'count' ? `${value} usuários` : `${value}%`,
                          name === 'count' ? 'Quantidade' : 'Percentual'
                        ]} />
                        <Legend />
                        <Bar dataKey="count" fill="#3B82F6" name="Quantidade" />
                        <Bar dataKey="percentage" fill="#10B981" name="Percentual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Índice de Recomendação NPS
                    </CardTitle>
                    <CardDescription>Net Promoter Score baseado nas recomendações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Cálculo do NPS */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {(() => {
                            const promoters = stats.recommendation_distribution
                              .filter(r => ['definitely_yes', 'probably_yes'].includes(r.recommendation))
                              .reduce((sum, r) => sum + r.count, 0)
                            const detractors = stats.recommendation_distribution
                              .filter(r => ['probably_no', 'definitely_no'].includes(r.recommendation))
                              .reduce((sum, r) => sum + r.count, 0)
                            const total = stats.total_evaluations
                            const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
                            return nps
                          })()}
                        </div>
                        <div className="text-lg text-muted-foreground">NPS Score</div>
                      </div>

                      {/* Distribuição de Recomendações */}
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.recommendation_distribution.map(rec => ({
                          type: rec.recommendation === 'definitely_yes' ? 'Definitivamente Sim' :
                            rec.recommendation === 'probably_yes' ? 'Provavelmente Sim' :
                              rec.recommendation === 'maybe' ? 'Neutro' :
                                rec.recommendation === 'probably_no' ? 'Provavelmente Não' :
                                  rec.recommendation === 'definitely_no' ? 'Definitivamente Não' : rec.recommendation,
                          count: rec.count,
                          category: ['definitely_yes', 'probably_yes'].includes(rec.recommendation) ? 'Promotores' :
                            rec.recommendation === 'maybe' ? 'Neutros' : 'Detratores'
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              {/* Distribuição de Dispositivos e Navegadores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dispositivos Utilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.device_distribution}
                          dataKey="count"
                          nameKey="device"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ device, count }) => `${device}: ${count}`}
                        >
                          {stats.device_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Navegadores Utilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.browser_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="browser" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes Técnicos por Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Detalhes Técnicos dos Usuários
                  </CardTitle>
                  <CardDescription>
                    Informações técnicas detalhadas de cada avaliação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {allEvaluations.map((evaluation, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{evaluation.user_name}</span>
                              <Badge variant="outline">
                                {evaluation.user_role}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(evaluation.device_type)}
                              <span className="font-medium">Dispositivo:</span>
                              <span>{evaluation.device_type}</span>
                            </div>
                            <div>
                              <span className="font-medium">Navegador:</span>
                              <span className="ml-1">{evaluation.browser}</span>
                            </div>
                            <div>
                              <span className="font-medium">Sistema:</span>
                              <span className="ml-1">{evaluation.operating_system}</span>
                            </div>
                          </div>

                          {/* Problemas Técnicos */}
                          {(evaluation.technical_errors || evaluation.functionality_issues) && (
                            <div className="mt-2 p-2 bg-red-50 rounded">
                              <div className="flex items-center gap-1 text-sm font-medium text-red-700">
                                <AlertTriangle className="w-4 h-4" />
                                Problemas Reportados:
                              </div>
                              <div className="text-sm text-red-600 mt-1">
                                {evaluation.technical_errors && <span>• Erros técnicos </span>}
                                {evaluation.functionality_issues && <span>• Problemas funcionais</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
} 