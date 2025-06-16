"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { useStudentClasses } from "@/hooks/useClasses"
import { useStudentExams } from "@/hooks/useExams"
import { AlertCircle, Calendar, CheckCircle, Clock, Eye, Play, Timer, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface StudentExam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'published' | 'finished';
  class_id: number;
  class_name: string;
  instructor_name: string;
  questions_count: number;
  result?: {
    id: number;
    total_points: number;
    max_points: number;
    percentage: number;
    status: 'completed' | 'in_progress' | 'not_started';
    started_at?: string;
    finished_at?: string;
  };
}

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAppContext()
  const { exams, isLoading: examsLoading, error: examsError } = useStudentExams()
  const { classes, isLoading: classesLoading } = useStudentClasses()
  const router = useRouter()



  // Verificar autorização
  if (!isAuthenticated || user?.role !== 'student') {
    router.push('/login')
    return null
  }

  if (examsLoading || classesLoading) {
    return <LoadingSpinner />
  }

  // Mostrar erro se houver
  if (examsError) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Erro ao carregar provas</h3>
                <p className="text-red-700 text-sm mt-1">{examsError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-3"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getExamStatus = (exam: StudentExam) => {
    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    if (exam.result?.status === 'completed') {
      return { status: 'completed', label: 'Concluída', color: 'bg-green-100 text-green-800' }
    } else if (exam.result?.status === 'in_progress') {
      return { status: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' }
    } else if (now < startTime) {
      return { status: 'upcoming', label: 'Agendada', color: 'bg-gray-100 text-gray-800' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Disponível', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'expired', label: 'Perdida', color: 'bg-red-100 text-red-800' }
    }
  }

  const canTakeExam = (exam: StudentExam) => {
    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    return (
      exam.status === 'published' &&
      now >= startTime &&
      now <= endTime &&
      (!exam.result || exam.result.status === 'not_started' || exam.result.status === 'in_progress')
    )
  }

  // Categorizar provas
  const availableExams = exams.filter((exam: any) => {
    const status = getExamStatus(exam)
    return status.status === 'active' || status.status === 'in_progress'
  })

  const upcomingExams = exams.filter((exam: any) => {
    const status = getExamStatus(exam)
    return status.status === 'upcoming'
  })

  const completedExams = exams.filter((exam: any) => {
    const status = getExamStatus(exam)
    return status.status === 'completed'
  })

  const expiredExams = exams.filter((exam: any) => {
    const status = getExamStatus(exam)
    return status.status === 'expired'
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const ExamCard = ({ exam }: { exam: any }) => {
    const examStatus = getExamStatus(exam)

    return (
      <Card key={exam.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{exam.title}</CardTitle>
            <Badge className={examStatus.color}>{examStatus.label}</Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {exam.description || 'Sem descrição'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{exam.class_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{exam.duration_minutes} minutos</span>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">Período:</div>
            <div>{formatDateTime(exam.start_time)} até {formatDateTime(exam.end_time)}</div>
          </div>
          {exam.result && (
            <div className="text-sm">
              <div className="text-muted-foreground">Resultado:</div>
              <div className="font-medium">
                {exam.result.total_points || 0} / {exam.result.max_points || 0} pontos
                {exam.result.percentage && ` (${exam.result.percentage.toFixed(1)}%)`}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3">
          {canTakeExam(exam) ? (
            <Button
              onClick={() => router.push(`/student/exams/${exam.id}`)}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Prova
            </Button>
          ) : examStatus.status === 'completed' ? (
            <Button
              variant="outline"
              onClick={() => router.push(`/student/results/${exam.id}`)}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Resultado
            </Button>
          ) : examStatus.status === 'upcoming' ? (
            <Button variant="outline" disabled className="w-full">
              <Timer className="w-4 h-4 mr-2" />
              Aguardando Liberação
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              <XCircle className="w-4 h-4 mr-2" />
              Prazo Expirado
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">Acompanhe suas provas e atividades acadêmicas</p>
      </div>



      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-yellow-600">{availableExams.length}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingExams.length}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedExams.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perdidas</p>
                <p className="text-2xl font-bold text-red-600">{expiredExams.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provas Disponíveis */}
      {availableExams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-yellow-600" />
            Provas Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableExams.map((exam: any) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>
      )}

      {/* Próximas Provas */}
      {upcomingExams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-600" />
            Próximas Provas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.map((exam: any) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>
      )}

      {/* Provas Concluídas */}
      {completedExams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Provas Concluídas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedExams.slice(0, 6).map((exam: any) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
          {completedExams.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push('/student/results')}>
                Ver Todas as Provas Concluídas
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Provas Perdidas */}
      {expiredExams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-600" />
            Provas Perdidas
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Atenção!</h3>
                <p className="text-red-700 text-sm">
                  Você tem {expiredExams.length} prova(s) que perdeu o prazo.
                  Entre em contato com o professor para verificar possibilidades de segunda chamada.
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredExams.map((exam: any) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>
      )}

      {/* Estado vazio */}
      {exams.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma prova disponível</h3>
            <p className="text-muted-foreground mb-6">
              Você não possui provas agendadas no momento. Verifique se está matriculado em alguma turma.
            </p>
            <Button onClick={() => router.push('/student/classes')}>
              Ver Minhas Turmas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 