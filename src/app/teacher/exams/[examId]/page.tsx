'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { useExams } from "@/hooks/useExams"
import { ArrowLeft, Calendar, Clock, Edit, FileText, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ExamDetailsPageProps {
  params: {
    examId: string
  }
}

export default function ExamDetailsPage({ params }: ExamDetailsPageProps) {
  const { user, isAuthenticated } = useAppContext()
  const { exams, isLoading } = useExams()
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    if (exams.length > 0) {
      const foundExam = exams.find(e => e.id.toString() === params.examId)
      setExam(foundExam || null)
    }
  }, [exams, params.examId])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Prova não encontrada</h2>
            <p className="text-red-600 mb-4">A prova solicitada não foi encontrada ou você não tem permissão para visualizá-la.</p>
            <Button onClick={() => router.push('/teacher/exams')} variant="outline">
              Voltar para Provas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'scheduled': return 'Agendada'
      case 'completed': return 'Finalizada'
      default: return 'Desconhecido'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const isExamActive = exam.status === 'active'
  const isExamScheduled = exam.status === 'scheduled'
  const canEdit = isExamScheduled || isExamActive

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          onClick={() => router.push('/teacher/exams')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Provas
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(exam.status)}`}>
                {getStatusText(exam.status)}
              </span>
              <span className="text-muted-foreground">
                Turma: {exam.class_name}
              </span>
            </div>
          </div>
          {canEdit && (
            <Button onClick={() => router.push(`/teacher/exams/${exam.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Título</h4>
                  <p className="text-gray-900">{exam.title}</p>
                </div>
                {exam.description && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Descrição</h4>
                    <p className="text-gray-900">{exam.description}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Turma</h4>
                  <p className="text-gray-900">{exam.class_name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(exam.status)}`}>
                    {getStatusText(exam.status)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Duração</h4>
                  <p className="text-gray-900">{exam.duration_minutes} minutos</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Criada em</h4>
                  <p className="text-gray-900">{formatDateTime(exam.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cronograma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Data/Hora de Início</h4>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(exam.start_time)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Data/Hora de Fim</h4>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(exam.end_time)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Tempo Restante</h4>
                  <p className="text-gray-900">
                    {exam.status === 'active'
                      ? `${Math.max(0, Math.ceil((new Date(exam.end_time).getTime() - new Date().getTime()) / (1000 * 60)))} minutos`
                      : exam.status === 'scheduled'
                        ? `Inicia em ${Math.max(0, Math.ceil((new Date(exam.start_time).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias`
                        : 'Finalizada'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Duração Total</h4>
                  <p className="text-gray-900">
                    {Math.ceil((new Date(exam.end_time).getTime() - new Date(exam.start_time).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Estatísticas de Participação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{exam.total_students || 0}</div>
                <div className="text-sm text-blue-600">Total de Alunos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{exam.completed_count || 0}</div>
                <div className="text-sm text-green-600">Concluídas</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{exam.in_progress_count || 0}</div>
                <div className="text-sm text-yellow-600">Em Andamento</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{exam.not_started_count || 0}</div>
                <div className="text-sm text-gray-600">Não Iniciadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => router.push(`/teacher/results?exam=${exam.id}`)}
                variant="outline"
              >
                Ver Resultados
              </Button>
              {canEdit && (
                <Button
                  onClick={() => router.push(`/teacher/exams/${exam.id}/edit`)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Prova
                </Button>
              )}
              <Button
                onClick={() => router.push(`/teacher/classes/${exam.class_id}`)}
                variant="outline"
              >
                Ver Turma
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 