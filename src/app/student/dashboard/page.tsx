"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { useStudentClasses } from "@/hooks/useClasses"
import { useStudentExams } from "@/hooks/useExams"
import { AlertCircle, BarChart3, BookOpen, CalendarDays, Clock, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StudentDashboard() {
  const { user } = useAppContext()
  const { exams, isLoading: examsLoading } = useStudentExams()
  const { classes, isLoading: classesLoading } = useStudentClasses()
  const router = useRouter()

  if (examsLoading || classesLoading) {
    return <LoadingSpinner />
  }

  // Filtrar provas disponíveis para o estudante (baseado nas turmas matriculadas)
  const availableExams = exams.filter((exam: any) => exam.status === 'published')
  const upcomingExams = availableExams.filter((exam: any) =>
    new Date(exam.start_time) > new Date()
  ).slice(0, 3)

  // Estatísticas
  const totalClasses = classes.length
  const completedExams = availableExams.filter((exam: any) =>
    new Date(exam.end_time) < new Date()
  ).length

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
          </div>

          {/* Cards de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClasses}</div>
                <p className="text-xs text-muted-foreground">turmas matriculadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Provas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingExams.length}</div>
                <p className="text-xs text-muted-foreground">nas próximas semanas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Provas Concluídas</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedExams}</div>
                <p className="text-xs text-muted-foreground">este semestre</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5</div>
                <p className="text-xs text-muted-foreground">+0.5 desde a última prova</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Suas Turmas */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Suas Turmas</CardTitle>
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
                      <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{classItem.name}</div>
                          <div className="text-sm text-muted-foreground">{classItem.description}</div>
                        </div>
                        <Badge variant="outline">Ativa</Badge>
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
            <Card>
              <CardHeader>
                <CardTitle>Próximas Provas</CardTitle>
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
                      <div key={exam.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                        <div className="font-medium text-sm">{exam.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(exam.start_time).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-blue-600">
                          Duração: {exam.duration_minutes} min
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

            {/* Notificações/Avisos */}
            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Avisos Importantes</CardTitle>
                <CardDescription>Mantenha-se atualizado sobre suas atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="grid gap-1 text-sm">
                      <div className="font-medium">Sistema de Provas Online</div>
                      <div className="text-muted-foreground">
                        Bem-vindo ao sistema de provas online! Aqui você pode visualizar suas provas,
                        acompanhar resultados e gerenciar suas turmas.
                      </div>
                    </div>
                  </div>

                  {upcomingExams.length > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium">Próximas Provas</div>
                        <div className="text-muted-foreground">
                          Você tem {upcomingExams.length} prova(s) agendada(s). Não se esqueça de se preparar!
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