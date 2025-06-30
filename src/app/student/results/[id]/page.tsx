'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { resultService } from "@/services/api"
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText, Timer, Trophy, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ExamResult {
  id: number
  exam_id: number
  exam_title: string
  exam_description: string
  class_name: string
  instructor_name: string
  total_points: number
  max_points: number
  percentage: number
  status: 'completed' | 'in_progress' | 'not_started'
  started_at: string
  finished_at: string
  duration_minutes: number
  answers: Answer[]
}

interface Answer {
  id: number
  question_id: number
  question_text: string
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay'
  question_points: number
  answer_text?: string
  selected_alternatives: number[]
  points_earned: number
  alternatives: Alternative[]
  feedback?: string
}

interface Alternative {
  id: number
  alternative_text: string
  is_correct: boolean
  order_number: number
}

export default function StudentResultPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [result, setResult] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResult()
  }, [params.id])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin')) {
    router.push('/login')
    return null
  }

  const loadResult = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Usar o serviço de API
      const data = await resultService.getResultById(params.id)
      setResult(data)
    } catch (err: any) {
      console.error('Erro ao carregar resultado:', err)
      setError(err.message || 'Erro ao carregar resultado da prova')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      'single_choice': 'Escolha Única',
      'multiple_choice': 'Múltipla Escolha',
      'true_false': 'Verdadeiro/Falso',
      'essay': 'Dissertativa'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) {
      return { label: 'Excelente', color: 'bg-green-100 text-green-800', icon: Trophy }
    } else if (percentage >= 80) {
      return { label: 'Muito Bom', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    } else if (percentage >= 70) {
      return { label: 'Bom', color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle }
    } else if (percentage >= 60) {
      return { label: 'Satisfatório', color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle }
    } else if (percentage >= 40) {
      return { label: 'Regular', color: 'bg-orange-100 text-orange-800', icon: Clock }
    } else {
      return { label: 'Insuficiente', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
  }

  const calculateDuration = () => {
    if (!result?.started_at || !result?.finished_at) return 'N/A'

    const start = new Date(result.started_at)
    const end = new Date(result.finished_at)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const isAnswerCorrect = (answer: Answer) => {
    // Para questões dissertativas, considerar correto se tem pontos
    if (answer.question_type === 'essay') {
      return answer.points_earned > 0
    }

    // Para questões objetivas, verificar se a resposta está completamente correta
    if (!answer.alternatives || answer.alternatives.length === 0) {
      return answer.points_earned > 0
    }

    const correctAlternatives = answer.alternatives.filter(alt => alt.is_correct)
    const selectedAlternatives = answer.selected_alternatives || []

    if (answer.question_type === 'single_choice' || answer.question_type === 'true_false') {
      // Para escolha única e V/F: deve ter selecionado exatamente uma alternativa correta
      if (selectedAlternatives.length !== 1) return false
      return correctAlternatives.some(alt => alt.id === selectedAlternatives[0])
    }

    if (answer.question_type === 'multiple_choice') {
      // Para múltipla escolha: considerar correto se ganhou pontos (pode ser parcial)
      // Mas para status "Correta" completa, deve ter todas corretas e nenhuma incorreta
      const correctIds = new Set(correctAlternatives.map(alt => alt.id))
      const selectedIds = new Set(selectedAlternatives)

      // Verificar se selecionou todas as corretas
      const hasAllCorrect = correctIds.size > 0 &&
        Array.from(correctIds).every(id => selectedIds.has(id))

      // Verificar se não selecionou nenhuma incorreta
      const hasNoIncorrect = selectedAlternatives.every(id => correctIds.has(id))

      return hasAllCorrect && hasNoIncorrect
    }

    // Fallback: usar pontuação
    return answer.points_earned > 0
  }

  const getAnswerStatus = (answer: Answer) => {
    if (answer.question_type === 'essay') {
      if (answer.points_earned === null || answer.points_earned === undefined) {
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
      }
      return answer.points_earned > 0
        ? { label: 'Correta', color: 'bg-green-100 text-green-800' }
        : { label: 'Incorreta', color: 'bg-red-100 text-red-800' }
    }

    if (answer.question_type === 'multiple_choice') {
      if (answer.points_earned === 0) {
        return { label: 'Incorreta', color: 'bg-red-100 text-red-800' }
      } else if (answer.points_earned > 0 && answer.points_earned < answer.question_points) {
        return { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
      } else if (answer.points_earned === answer.question_points) {
        return { label: 'Correta', color: 'bg-green-100 text-green-800' }
      }
    }

    return isAnswerCorrect(answer)
      ? { label: 'Correta', color: 'bg-green-100 text-green-800' }
      : { label: 'Incorreta', color: 'bg-red-100 text-red-800' }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error || 'Resultado não encontrado'}</p>
            <Button onClick={() => router.push('/student/exams')} className="mt-2">
              Voltar para Provas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const performance = getPerformanceBadge(result.percentage)
  const PerformanceIcon = performance.icon

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
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
            <h1 className="text-3xl font-bold">{result.exam_title}</h1>
            <p className="text-muted-foreground">{result.exam_description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{result.class_name}</span>
              <span>•</span>
              <span>Prof. {result.instructor_name}</span>
            </div>
          </div>

          <Badge className={`${performance.color} text-lg px-4 py-2`}>
            <PerformanceIcon className="w-5 h-5 mr-2" />
            {performance.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pontuação */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {result.total_points}/{result.max_points}
              </div>
              <p className="text-sm text-muted-foreground">Pontuação Total</p>
              <div className="text-xl font-semibold mt-1">
                {result.percentage.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {calculateDuration()}
              </div>
              <p className="text-sm text-muted-foreground">Tempo Utilizado</p>
              <div className="text-sm text-gray-500 mt-1">
                de {result.duration_minutes} min disponíveis
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questões */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {result.answers.length}
              </div>
              <p className="text-sm text-muted-foreground">Questões Respondidas</p>
              <div className="text-sm text-gray-500 mt-1">
                {result.answers.filter(a => isAnswerCorrect(a)).length} corretas
                {result.answers.filter(a => getAnswerStatus(a).label === 'Parcial').length > 0 && (
                  <span>, {result.answers.filter(a => getAnswerStatus(a).label === 'Parcial').length} parciais</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da Prova */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detalhes da Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Iniciada em</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDateTime(result.started_at)}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizada em</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDateTime(result.finished_at)}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge className="mt-1 bg-green-100 text-green-800">
                Concluída
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Aproveitamento</p>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${result.percentage >= 70 ? 'bg-green-500' :
                      result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(result.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Respostas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.answers.map((answer, index) => {
            const answerStatus = getAnswerStatus(answer)
            return (
              <div
                key={answer.id}
                className={`border rounded-lg p-4 ${answerStatus.label === 'Correta' ? 'border-green-200 bg-green-50' :
                  answerStatus.label === 'Parcial' ? 'border-blue-200 bg-blue-50' :
                    answerStatus.label === 'Pendente' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">Questão {index + 1}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeLabel(answer.question_type)}
                      </Badge>
                      <Badge className={answerStatus.color}>
                        {answerStatus.label}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{answer.question_text}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {answer.points_earned}/{answer.question_points} pts
                    </div>
                    {answer.question_type === 'multiple_choice' && answer.points_earned > 0 && answer.points_earned < answer.question_points && (
                      <div className="text-xs text-blue-600 mt-1">
                        Pontuação parcial
                      </div>
                    )}
                  </div>
                </div>

                {/* Alternativas (para questões objetivas) */}
                {answer.question_type !== 'essay' && answer.alternatives && (
                  <div className="space-y-2 mb-3">
                    {answer.alternatives.map((alt, altIndex) => {
                      const isSelected = answer.selected_alternatives.includes(alt.id)
                      const isCorrect = alt.is_correct

                      return (
                        <div
                          key={alt.id}
                          className={`p-2 rounded border ${isSelected && isCorrect ? 'border-green-500 bg-green-100' :
                            isSelected && !isCorrect ? 'border-red-500 bg-red-100' :
                              !isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                                'border-gray-200'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium min-w-[20px]">
                              {String.fromCharCode(65 + altIndex)}.
                            </span>
                            <span className="flex-1">{alt.alternative_text}</span>
                            <div className="flex items-center gap-1">
                              {isSelected && (
                                <Badge variant="outline" className="text-xs">
                                  Sua resposta
                                </Badge>
                              )}
                              {isCorrect && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Resposta dissertativa */}
                {answer.question_type === 'essay' && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Sua resposta:</p>
                    <div className="bg-white border rounded p-3">
                      <p className="text-gray-700">
                        {answer.answer_text || 'Nenhuma resposta fornecida'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback do professor */}
                {answer.feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Feedback do Professor:</p>
                    <p className="text-blue-700 text-sm">{answer.feedback}</p>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => router.push('/student/exams')}
        >
          Ver Outras Provas
        </Button>
        <Button
          onClick={() => window.print()}
        >
          Imprimir Resultado
        </Button>
      </div>
    </div>
  )
} 