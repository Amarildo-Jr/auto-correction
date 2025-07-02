'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import api from "@/services/api"
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Calculator,
  CheckCircle,
  Clock,
  Edit3,
  FileText,
  HandIcon,
  RefreshCw,
  Save,
  Settings,
  Target,
  User,
  XCircle,
  Zap
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface StudentAnswer {
  id: number
  question_id: number
  question_text: string
  question_type: string
  answer_text: string
  selected_alternatives: number[]
  points_earned: number
  max_points: number
  correction_method: string
  feedback?: string
  expected_answer?: string
  similarity_score?: number
  auto_correction_enabled: boolean
  alternatives?: Array<{
    id: number
    text: string
    is_correct: boolean
    selected: boolean
  }>
}

interface StudentExamResult {
  id: number
  enrollment_id: number
  student_name: string
  student_email: string
  exam_title: string
  exam_id: number
  class_name: string
  total_points: number
  max_points: number
  percentage: number
  time_taken: number
  finished_at: string
  status: string
  answers: StudentAnswer[]
}

export default function StudentResultDetailPage() {
  const { user, isAuthenticated } = useAppContext()
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.id as string

  const [result, setResult] = useState<StudentExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null)
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [manualCorrections, setManualCorrections] = useState<Record<number, { points_earned: number; feedback: string }>>({})
  const [correctingAnswers, setCorrectingAnswers] = useState<Set<number>>(new Set())

  // Verificar autorização
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
      router.push('/login')
    }
  }, [isAuthenticated, user?.role, router])

  useEffect(() => {
    loadStudentResult()
  }, [enrollmentId])

  const loadStudentResult = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/teacher/student-exam/${enrollmentId}`)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar resultado do aluno')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAnswer = (answer: StudentAnswer) => {
    setEditingAnswer(answer.id)
    setEditScore(answer.points_earned)
    setEditFeedback(answer.feedback || '')
  }

  const handleSaveCorrection = async () => {
    if (!editingAnswer) return

    setSaving(true)
    try {
      await api.post(`/api/teacher/manual-correction/${editingAnswer}`, {
        points_earned: editScore,
        feedback: editFeedback
      })

      // Recarregar resultado
      await loadStudentResult()

      // Limpar estado de edição
      setEditingAnswer(null)
      setEditScore(0)
      setEditFeedback('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar correção')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingAnswer(null)
    setEditScore(0)
    setEditFeedback('')
  }

  const getCorrectionMethodBadge = (method: string) => {
    switch (method) {
      case 'auto':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          Automática
        </Badge>
      case 'manual':
        return <Badge variant="default" className="flex items-center gap-1">
          <HandIcon className="w-3 h-3" />
          Manual
        </Badge>
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendente
        </Badge>
      default:
        return <Badge variant="outline">Não corrigida</Badge>
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const handleManualCorrection = async (answerId: number) => {
    const correction = manualCorrections[answerId]
    if (!correction || correction.points_earned === undefined) {
      alert('Insira uma pontuação válida')
      return
    }

    setCorrectingAnswers(prev => {
      const newSet = new Set(prev)
      newSet.add(answerId)
      return newSet
    })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/manual-correction/${answerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          points_earned: correction.points_earned,
          feedback: correction.feedback || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar correção')
      }

      const data = await response.json()

      // Recarregar dados
      await loadStudentResult()

      alert('Correção salva com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar correção:', error)
      alert(error.message || 'Erro ao salvar correção')
    } finally {
      setCorrectingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(answerId)
        return newSet
      })
    }
  }

  const handleAutoCorrection = async (answerId: number) => {
    setCorrectingAnswers(prev => {
      const newSet = new Set(prev)
      newSet.add(answerId)
      return newSet
    })

    try {
      await api.post(`/api/teacher/auto-correct-single`, {
        answer_id: answerId
      })

      // Recarregar apenas os dados do resultado, sem recarregar a página
      await loadStudentResult()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao corrigir automaticamente')
    } finally {
      setCorrectingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(answerId)
        return newSet
      })
    }
  }

  const handleRecalculateStudent = async () => {
    if (!result) return

    const confirmed = confirm('Tem certeza que deseja recalcular as notas desta prova? Esta ação irá:\n\n• Manter correções manuais existentes\n• Usar similaridade para calcular pontos de dissertativas sem correção automática\n• Recalcular totais e percentuais')

    if (!confirmed) return

    try {
      setSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/results/recalculate-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enrollment_id: parseInt(enrollmentId)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao recalcular')
      }

      const data = await response.json()

      // Recarregar resultado
      await loadStudentResult()

      alert(`Recálculo concluído!\n\n• Total pontos: ${data.total_points.toFixed(1)}/${data.max_points.toFixed(1)}\n• Percentual: ${data.percentage.toFixed(1)}%`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro na recálculo')
    } finally {
      setSaving(false)
    }
  }

  const handleRecorrectExam = async () => {
    if (!result?.enrollment_id) return

    const confirmed = confirm('Tem certeza que deseja recorrigir ESTA prova? Esta ação irá:\n\n• Recorrigir todas as questões objetivas do zero\n• Recorrigir questões dissertativas com correção automática habilitada\n• ZERAR correções manuais existentes nesta prova\n• Recalcular nota total desta prova\n\nEsta ação não pode ser desfeita.')

    if (!confirmed) return

    try {
      setSaving(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/results/recorrect-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enrollment_id: result.enrollment_id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na recorreção')
      }

      const data = await response.json()

      // Recarregar resultado
      await loadStudentResult()

      alert(`Recorreção concluída!\n\n• Prova recorrigida\n• ${data.essay_corrected || 0} questões dissertativas corrigidas automaticamente\n• ${data.objective_corrected || 0} questões objetivas corrigidas\n• Nota: ${data.total_points.toFixed(1)}/${data.max_points.toFixed(1)} (${data.percentage.toFixed(1)}%)`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro na recorreção')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !result) {
    return (
      <div className="py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar resultado</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Resultados
        </Button>

        <h1 className="text-3xl font-bold mb-2">Resultado Detalhado</h1>
        <p className="text-muted-foreground">
          Visualização completa da prova do aluno
        </p>
      </div>

      {/* Informações do Aluno e Prova */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">{result.exam_title}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {result.class_name}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(result.percentage)}`}>
              {result.percentage.toFixed(1)}%
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Aluno</Label>
              <p className="font-medium">{result.student_name}</p>
              <p className="text-sm text-muted-foreground">{result.student_email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Pontuação</Label>
              <p className="font-medium">{result.total_points.toFixed(1)} / {result.max_points.toFixed(1)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tempo Utilizado</Label>
              <p className="font-medium">{result.time_taken} minutos</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Finalizada em</Label>
              <p className="font-medium">
                {new Date(result.finished_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Gerais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => loadStudentResult()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>

            <Button
              onClick={() => handleRecalculateStudent()}
              variant="outline"
              size="sm"
              disabled={saving || correctingAnswers.size > 0}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Recalcular Notas
            </Button>

            <Button
              onClick={() => handleRecorrectExam()}
              variant="outline"
              size="sm"
              disabled={saving || correctingAnswers.size > 0}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <Zap className="w-4 h-4 mr-2" />
              Recorrigir Esta Prova
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Respostas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Respostas do Aluno</h2>

        {result.answers.map((answer, index) => (
          <Card key={answer.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    Questão {index + 1} ({answer.question_type === 'essay' ? 'Dissertativa' : 'Objetiva'})
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>Pontos: {answer.points_earned.toFixed(1)} / {answer.max_points.toFixed(1)}</span>
                    {getCorrectionMethodBadge(answer.correction_method)}
                    {answer.similarity_score && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Similaridade: {answer.similarity_score.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {answer.question_type === 'essay' && (
                  <div className="flex gap-2">
                    {editingAnswer === answer.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveCorrection}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAnswer(answer)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Corrigir
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Questão */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Questão
                </Label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{answer.question_text}</p>
                </div>
              </div>

              {/* Resposta Esperada (apenas para dissertativas) */}
              {answer.question_type === 'essay' && answer.expected_answer && (
                <div>
                  <Label className="text-base font-medium flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    Resposta Esperada
                  </Label>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">{answer.expected_answer}</p>
                  </div>
                </div>
              )}

              {/* Resposta do Aluno */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Resposta do Aluno
                </Label>

                {answer.question_type === 'essay' ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{answer.answer_text}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {answer.alternatives?.map((alt) => (
                      <div
                        key={alt.id}
                        className={`p-3 rounded-lg border ${alt.selected
                          ? alt.is_correct
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                          : alt.is_correct
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${alt.selected ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                            {alt.selected && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <span className="text-sm">{alt.text}</span>
                          {alt.is_correct && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Correção Manual (apenas para dissertativas) */}
              {answer.question_type === 'essay' && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-base font-medium flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Correção Manual
                  </Label>

                  <div className="space-y-3">
                    {/* Input de pontuação */}
                    <div>
                      <Label htmlFor={`points-${answer.id}`} className="text-sm font-medium">
                        Pontuação Obtida (máx: {answer.max_points.toFixed(1).replace('.', ',')})
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`points-${answer.id}`}
                          type="text"
                          value={manualCorrections[answer.id]?.points_earned?.toString().replace('.', ',') || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(',', '.')
                            const numValue = parseFloat(value) || 0
                            setManualCorrections(prev => ({
                              ...prev,
                              [answer.id]: {
                                ...prev[answer.id],
                                points_earned: numValue
                              }
                            }))
                          }}
                          placeholder="0,0"
                          className="w-24"
                        />
                        <Button
                          onClick={() => handleManualCorrection(answer.id)}
                          size="sm"
                          disabled={correctingAnswers.has(answer.id)}
                        >
                          {correctingAnswers.has(answer.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-1" />
                              Salvar
                            </>
                          )}
                        </Button>

                        {/* Botão para recorrigir automaticamente */}
                        {answer.auto_correction_enabled && answer.expected_answer &&
                          (answer.correction_method === 'auto' || answer.correction_method === 'manual') && (
                            <Button
                              onClick={() => handleAutoCorrection(answer.id)}
                              size="sm"
                              variant="outline"
                              disabled={correctingAnswers.has(answer.id)}
                            >
                              {correctingAnswers.has(answer.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                  Corrigindo...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3 h-3 mr-1" />
                                  Recorrigir Auto
                                </>
                              )}
                            </Button>
                          )}
                      </div>
                    </div>

                    {/* Feedback opcional */}
                    <div>
                      <Label htmlFor={`feedback-${answer.id}`} className="text-sm font-medium">
                        Feedback (opcional)
                      </Label>
                      <Textarea
                        id={`feedback-${answer.id}`}
                        value={manualCorrections[answer.id]?.feedback || ''}
                        onChange={(e) => setManualCorrections(prev => ({
                          ...prev,
                          [answer.id]: {
                            ...prev[answer.id],
                            feedback: e.target.value
                          }
                        }))}
                        placeholder="Comentários sobre a resposta..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status da correção */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Status:</div>
                  <Badge className={
                    answer.question_type === 'essay'
                      ? (answer.points_earned !== null && answer.points_earned !== undefined)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }>
                    {answer.question_type === 'essay'
                      ? (answer.points_earned !== null && answer.points_earned !== undefined)
                        ? 'Corrigida'
                        : 'Pendente'
                      : 'Corrigida'
                    }
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Pontos: {(answer.points_earned || 0).toFixed(1).replace('.', ',')} / {answer.max_points.toFixed(1).replace('.', ',')}
                </div>
              </div>

              {/* Feedback do Professor */}
              {answer.feedback && (
                <div>
                  <Label className="text-base font-medium flex items-center gap-2 mb-2">
                    <HandIcon className="w-4 h-4 text-purple-600" />
                    Feedback do Professor
                  </Label>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">{answer.feedback}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Link para Correção em Lote */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Correção em Lote</h3>
              <p className="text-sm text-muted-foreground">
                Acesse a página de correção para revisar todas as questões dissertativas pendentes
              </p>
            </div>
            <Button
              onClick={() => router.push('/teacher/correction-review')}
              variant="outline"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Ir para Correções
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 