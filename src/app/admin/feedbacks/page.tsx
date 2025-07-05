'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/services/api'
import {
  AlertTriangle,
  CheckCircle,
  Download,
  MessageSquare,
  RefreshCw,
  Star
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  additional_comments?: string
  technical_errors: boolean
  functionality_issues: boolean
}

export default function AdminFeedbacksPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/platform-evaluations/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvaluations = async (page: number = 1) => {
    try {
      const response = await api.get(`/admin/platform-evaluations?page=${page}&per_page=10`)
      setEvaluations(response.data.evaluations)
      setCurrentPage(response.data.pagination.current_page)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    }
  }

  const exportEvaluations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/platform-evaluations/export')

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
          <p className="text-gray-600">Análise das avaliações dos usuários</p>
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
                <CardTitle className="text-sm font-medium">Problemas Reportados</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.problems_reported.technical_errors + stats.problems_reported.functionality_issues}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
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
                    {Object.entries(stats.rating_averages).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm font-medium capitalize">
                          {key.replace('_', ' ')}
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
                      data={Object.entries(stats.rating_averages).map(([key, value]) => ({
                        category: key.replace('_', ' '),
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
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {evaluations.slice(0, 5).map((evaluation) => (
                        <div key={evaluation.id} className="border-b pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{evaluation.user_name}</span>
                              <Badge variant="outline" className="ml-2">
                                {evaluation.user_role}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                            </span>
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
                          {evaluation.additional_comments && (
                            <p className="text-sm text-gray-600 mt-2">
                              "{evaluation.additional_comments.substring(0, 100)}..."
                            </p>
                          )}
                        </div>
                      ))}
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
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
} 