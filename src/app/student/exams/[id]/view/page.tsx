'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { useExam } from "@/hooks/useExams"
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText, Play, Timer, Users, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ExamResult {
  id: number
  student_id: number
  total_points: number
  max_points: number
  percentage: number
  status: 'completed' | 'in_progress' | 'not_started'
  started_at?: string
  finished_at?: string
  answers_count: number
  questions_count: number
}

export default function ViewExamPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const { exam, isLoading: examLoading } = useExam(parseInt(params.id))
  const router = useRouter()

  const [result, setResult] = useState<ExamResult | null>(null)
  const [isLoadingResult, setIsLoadingResult] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (exam) {
      loadExamResult()
    }
  }, [exam])

  // Verificar autorização
  if (!isAuthenticated || user?.role !== 'student') {
    router.push('/login')
    return null
  }

  const loadExamResult = async () => {
    try {
      setIsLoadingResult(true)
      const response = await fetch(`/api/exams/${params.id}/result`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (err: any) {
      console.error('Erro ao carregar resultado:', err)
    } finally {
      setIsLoadingResult(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-blue-100 text-blue-800',
      'finished': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'not_started': 'bg-gray-100 text-gray-800'
    }

    const labels = {
      'draft': 'Rascunho',
      'published': 'Disponível',
      'finished': 'Finalizada',
      'completed': 'Concluída',
      'in_progress': 'Em Andamento',
      'not_started': 'Não Iniciada'
    }

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const canTakeExam = () => {
    if (!exam) return false

    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    return (
      exam.status === 'published' &&
      now >= startTime &&
      now <= endTime &&
      (!result || result.status === 'not_started')
    )
  }

  const isExamActive = () => {
    if (!exam) return false

    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    return now >= startTime && now <= endTime
  }

  if (examLoading || isLoadingResult) {
    return <LoadingSpinner />
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Prova não encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/student/exams')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Provas
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>

          {canTakeExam() && (
            <Button
              onClick={() => router.push(`/student/exams/${exam.id}`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Prova
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Prova */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações da Prova
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(exam.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duração</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Timer className="w-4 h-4 text-gray-500" />
                    <span>{formatDuration(exam.duration_minutes)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data/Hora de Início</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(exam.start_time)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Data/Hora de Fim</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(exam.end_time)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Questões</p>
                <div className="flex items-center gap-1 mt-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{exam.questions?.length || 0} questões</span>
                </div>
              </div>

              {/* Status da Prova */}
              <div className="pt-4 border-t">
                {!isExamActive() && new Date() < new Date(exam.start_time) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Prova ainda não iniciada</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      A prova estará disponível a partir de {formatDate(exam.start_time)}
                    </p>
                  </div>
                )}

                {!isExamActive() && new Date() > new Date(exam.end_time) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-800">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Prova encerrada</span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">
                      O prazo para realizar esta prova expirou em {formatDate(exam.end_time)}
                    </p>
                  </div>
                )}

                {canTakeExam() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Prova disponível</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Você pode iniciar esta prova agora. Tempo disponível: {formatDuration(exam.duration_minutes)}
                    </p>
                  </div>
                )}

                {result && result.status === 'completed' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Prova já realizada</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      Você já completou esta prova. Veja seu resultado ao lado.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questões (Preview) - Só mostra após prova concluída */}
          {exam.questions && exam.questions.length > 0 && result && result.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Questões da Prova</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exam.questions.map((question: any, index: number) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          Questão {index + 1}
                        </h4>
                        <Badge variant="outline">
                          {question.points} {question.points === 1 ? 'ponto' : 'pontos'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {question.question_text.length > 100
                          ? `${question.question_text.substring(0, 100)}...`
                          : question.question_text
                        }
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Tipo: {question.question_type === 'single_choice' ? 'Escolha Única' :
                          question.question_type === 'multiple_choice' ? 'Múltipla Escolha' :
                            question.question_type === 'true_false' ? 'Verdadeiro/Falso' : 'Dissertativa'}</span>
                        {question.alternatives && (
                          <span>• {question.alternatives.length} alternativas</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resultado/Status */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Seu Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(result.status)}</div>
                  </div>

                  {result.status === 'completed' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pontuação</p>
                        <div className="mt-1">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.total_points}/{result.max_points}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600">Questões Respondidas</p>
                        <p className="mt-1">{result.answers_count}/{result.questions_count}</p>
                      </div>

                      {result.started_at && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Iniciada em</p>
                          <p className="mt-1 text-sm">{formatDate(result.started_at)}</p>
                        </div>
                      )}

                      {result.finished_at && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Finalizada em</p>
                          <p className="mt-1 text-sm">{formatDate(result.finished_at)}</p>
                        </div>
                      )}
                    </>
                  )}

                  {result.status === 'in_progress' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        Você tem uma prova em andamento.
                        <Button
                          variant="link"
                          className="p-0 h-auto text-yellow-800 underline"
                          onClick={() => router.push(`/student/exams/${exam.id}`)}
                        >
                          Continuar prova
                        </Button>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    {exam.status === 'published' ? 'Prova não iniciada' : 'Prova não disponível'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canTakeExam() && (
                <Button
                  onClick={() => router.push(`/student/exams/${exam.id}`)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Prova
                </Button>
              )}

              {result && result.status === 'in_progress' && (
                <Button
                  onClick={() => router.push(`/student/exams/${exam.id}`)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Prova
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/student/exams')}
                className="w-full"
              >
                Voltar para Provas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 