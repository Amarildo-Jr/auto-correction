"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { Class, useStudentClasses } from "@/hooks/useClasses"
import { useStudentExams } from "@/hooks/useExams"
import { useResults } from "@/hooks/useResults"
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Play,
  Target,
  TrendingUp,
  Trophy,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

export default function StudentDashboard() {
  const { user } = useAppContext()
  const { exams, isLoading: examsLoading } = useStudentExams()
  const { classes, isLoading: classesLoading } = useStudentClasses()
  const { results, isLoading: resultsLoading } = useResults()
  const router = useRouter()

  // Calcular estatísticas com dados reais
  const stats = useMemo(() => {
    const now = new Date()

    // Provas disponíveis para o estudante
    const availableExams = exams.filter((exam: any) => exam.status === 'published')

    // Próximas provas
    const upcomingExams = availableExams.filter((exam: any) =>
      new Date(exam.start_time) > now
    )

    // Provas concluídas
    const completedResults = results?.filter((r: any) => r.status === 'completed') || []

    // Média geral
    const averageScore = completedResults.length > 0
      ? completedResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / completedResults.length
      : 0

    // Provas em andamento
    const ongoingExams = availableExams.filter((exam: any) => {
      const startTime = new Date(exam.start_time)
      const endTime = new Date(exam.end_time)
      return now >= startTime && now <= endTime
    })

    return {
      totalClasses: classes.length,
      upcomingExams: upcomingExams.length,
      completedExams: completedResults.length,
      averageScore,
      ongoingExams: ongoingExams.length
    }
  }, [exams, classes, results])

  // Próximas provas com mais detalhes
  const upcomingExams = useMemo(() => {
    const now = new Date()
    return exams.filter((exam: any) =>
      exam.status === 'published' && new Date(exam.start_time) > now
    ).sort((a: any, b: any) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    ).slice(0, 5)
  }, [exams])

  // Provas em andamento
  const ongoingExams = useMemo(() => {
    const now = new Date()
    return exams.filter((exam: any) => {
      const startTime = new Date(exam.start_time)
      const endTime = new Date(exam.end_time)
      return exam.status === 'published' && now >= startTime && now <= endTime
    })
  }, [exams])

  // Resultados recentes
  const recentResults = useMemo(() => {
    return results?.filter((r: any) => r.status === 'completed')
      .sort((a: any, b: any) => new Date(b.finished_at || b.created_at).getTime() - new Date(a.finished_at || a.created_at).getTime())
      .slice(0, 3) || []
  }, [results])

  if (examsLoading || classesLoading || resultsLoading) {
    return <LoadingSpinner />
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}! 👋</h1>
              <p className="text-muted-foreground">Acompanhe seu progresso acadêmico</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/student/exams')} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Ver Provas
              </Button>
            </div>
          </div>

          {/* Alerta para provas em andamento */}
          {ongoingExams.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900">Prova em Andamento!</h3>
                    <p className="text-sm text-orange-700">
                      Você tem {ongoingExams.length} prova(s) disponível(is) para realizar agora.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/student/exams')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Prova
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClasses}</div>
                <p className="text-xs text-muted-foreground">turmas matriculadas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Provas</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingExams}</div>
                <p className="text-xs text-muted-foreground">nas próximas semanas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Provas Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedExams}</div>
                <p className="text-xs text-muted-foreground">este semestre</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.averageScore >= 70 ? 'Boa performance!' : 'Continue se esforçando!'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Target className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ongoingExams}</div>
                <p className="text-xs text-muted-foreground">provas disponíveis</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Suas Turmas */}
            <Card className="xl:col-span-2 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Suas Turmas
                </CardTitle>
                <CardDescription>
                  Turmas em que você está matriculado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Você não está matriculado em nenhuma turma</p>
                    <Button onClick={() => router.push('/student/classes')}>
                      Explorar Turmas
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {classes.slice(0, 4).map((classItem: Class) => (
                      <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-medium">{classItem.name}</div>
                          <div className="text-sm text-muted-foreground">{classItem.description}</div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ativa
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/classes')}
                  className="w-full"
                >
                  Ver Todas as Turmas
                </Button>
              </CardFooter>
            </Card>

            {/* Próximas Provas */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Próximas Provas
                </CardTitle>
                <CardDescription>Provas agendadas para você</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingExams.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma prova agendada</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingExams.map((exam: any) => (
                      <div key={exam.id} className="flex flex-col gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-sm">{exam.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {exam.class_name}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-blue-600">
                            📅 {formatDateTime(exam.start_time)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exam.duration_minutes}min
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/student/exams')}
                  className="w-full"
                >
                  Ver Todas as Provas
                </Button>
              </CardFooter>
            </Card>

            {/* Resultados Recentes */}
            <Card className="xl:col-span-3 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resultados Recentes
                </CardTitle>
                <CardDescription>Suas últimas performances</CardDescription>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhum resultado disponível ainda</p>
                    <p className="text-sm text-muted-foreground">Complete suas primeiras provas para ver os resultados aqui</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {recentResults.map((result: any) => (
                      <div key={result.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{result.exam_title}</h4>
                            <p className="text-xs text-muted-foreground">{result.class_name}</p>
                          </div>
                          <Badge variant={getScoreBadgeVariant(result.percentage)} className="text-xs">
                            {result.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Concluída em {formatDateTime(result.finished_at || result.created_at)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          onClick={() => router.push(`/student/results/${result.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/results')}
                  className="w-full"
                >
                  Ver Todos os Resultados
                </Button>
              </CardFooter>
            </Card>

            {/* Avisos Importantes */}
            <Card className="xl:col-span-3 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Avisos Importantes
                </CardTitle>
                <CardDescription>Mantenha-se atualizado sobre suas atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="grid gap-1 text-sm">
                      <div className="font-medium">Sistema de Provas Online</div>
                      <div className="text-muted-foreground">
                        Bem-vindo ao sistema de provas online! Aqui você pode visualizar suas provas,
                        acompanhar resultados e gerenciar suas turmas.
                      </div>
                    </div>
                  </div>

                  {stats.upcomingExams > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium">Provas Próximas</div>
                        <div className="text-muted-foreground">
                          Você tem {stats.upcomingExams} prova(s) agendada(s). Não se esqueça de se preparar!
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.averageScore > 0 && stats.averageScore < 60 && (
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <Target className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium">Atenção ao Desempenho</div>
                        <div className="text-muted-foreground">
                          Sua média atual está abaixo de 60%. Considere revisar o conteúdo e buscar ajuda se necessário.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 