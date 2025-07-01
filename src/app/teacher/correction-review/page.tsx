'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Save,
  User,
  Users,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface PendingCorrection {
  answer_id: number
  student_name: string
  student_email: string
  exam_title: string
  exam_id: number
  question_text: string
  question_id: number
  question_points: number
  answer_text: string
  auto_correction_enabled: boolean
  expected_answer?: string
  submitted_at: string
  enrollment_id: number
}

interface PendingExam {
  exam_id: number
  exam_title: string
  pending_count: number
  total_students: number
  class_name?: string
}

export default function CorrectionReviewPage() {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [pendingExams, setPendingExams] = useState<PendingExam[]>([])
  const [pendingCorrections, setPendingCorrections] = useState<PendingCorrection[]>([])
  const [selectedExam, setSelectedExam] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [corrections, setCorrections] = useState<Record<number, { points: number; feedback: string }>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'professor' || user?.role === 'admin')) {
      loadPendingExams()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (selectedExam && isAuthenticated && (user?.role === 'professor' || user?.role === 'admin')) {
      loadPendingCorrections(selectedExam)
    }
  }, [selectedExam, isAuthenticated, user])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'professor' && user?.role !== 'admin')) {
    router.push('/login')
    return null
  }

  const loadPendingExams = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/pending-corrections-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar correções pendentes')
      }

      const data = await response.json()
      setPendingExams(data)
    } catch (error: any) {
      console.error('Erro ao carregar correções pendentes:', error)
      setError(error.message || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingCorrections = async (examId: number) => {
    try {
      setIsLoading(true)

      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/pending-corrections/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar correções da prova')
      }

      const data = await response.json()
      setPendingCorrections(data)

      // Inicializar correções com valores padrão
      const initialCorrections: Record<number, { points: number; feedback: string }> = {}
      data.forEach((correction: PendingCorrection) => {
        initialCorrections[correction.answer_id] = {
          points: 0,
          feedback: ''
        }
      })
      setCorrections(initialCorrections)
    } catch (error: any) {
      console.error('Erro ao carregar correções da prova:', error)
      setError(error.message || 'Erro ao carregar correções')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSingleCorrection = async (answerId: number) => {
    const correction = corrections[answerId]
    if (!correction || correction.points < 0) {
      alert('Insira uma pontuação válida')
      return
    }

    try {
      setIsCorrecting(true)

      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/manual-correction/${answerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          points_earned: correction.points,
          feedback: correction.feedback
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar correção')
      }

      // Remover da lista de pendentes
      setPendingCorrections(prev => prev.filter(p => p.answer_id !== answerId))

      // Atualizar contadores
      if (selectedExam) {
        setPendingExams(prev => prev.map(exam =>
          exam.exam_id === selectedExam
            ? { ...exam, pending_count: Math.max(0, exam.pending_count - 1) }
            : exam
        ))
      }

      alert('Correção salva com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar correção:', error)
      alert(error.message || 'Erro ao salvar correção')
    } finally {
      setIsCorrecting(false)
    }
  }

  const handleAutoCorrection = async (answerId: number) => {
    try {
      setIsCorrecting(true)

      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/auto-correct-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answer_id: answerId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na correção automática')
      }

      const data = await response.json()

      // Remover da lista de pendentes
      setPendingCorrections(prev => prev.filter(p => p.answer_id !== answerId))

      // Atualizar contadores
      if (selectedExam) {
        setPendingExams(prev => prev.map(exam =>
          exam.exam_id === selectedExam
            ? { ...exam, pending_count: Math.max(0, exam.pending_count - 1) }
            : exam
        ))
      }

      alert(`Correção automática concluída! Pontuação: ${data.points_earned.toFixed(1).replace('.', ',')}/${data.max_points.toFixed(1).replace('.', ',')}`)
    } catch (error: any) {
      console.error('Erro na correção automática:', error)
      alert(error.message || 'Erro na correção automática')
    } finally {
      setIsCorrecting(false)
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

  if (isLoading && !selectedExam) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Correções Pendentes</h1>
        <p className="text-muted-foreground">
          Gerencie questões dissertativas que precisam de correção manual
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Erro</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button onClick={loadPendingExams} className="mt-3" size="sm">
                  Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Provas com Correções Pendentes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Provas com Correções Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExams.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Todas as correções em dia!</h3>
              <p className="text-muted-foreground">
                Não há questões dissertativas pendentes de correção no momento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prova</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Pendentes</TableHead>
                  <TableHead>Total Alunos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExams.map((exam) => (
                  <TableRow
                    key={exam.exam_id}
                    className={selectedExam === exam.exam_id ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <div>
                        <h3 className="font-medium">{exam.exam_title}</h3>
                        <p className="text-sm text-muted-foreground">ID: {exam.exam_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{exam.class_name || 'Sem turma'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800">
                        {exam.pending_count} pendentes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{exam.total_students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedExam(exam.exam_id)}
                          variant={selectedExam === exam.exam_id ? 'default' : 'outline'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {selectedExam === exam.exam_id ? 'Selecionada' : 'Corrigir'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teacher/exams/${exam.exam_id}`)}
                        >
                          Ver Prova
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Correções Individuais */}
      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Correções Individuais
              <Badge className="ml-2">
                {pendingCorrections.length} questões
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : pendingCorrections.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Todas correções concluídas!</h3>
                <p className="text-muted-foreground">
                  Não há mais questões pendentes nesta prova.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingCorrections.map((correction, index) => (
                  <Card key={correction.answer_id} className="border border-gray-200">
                    <CardContent className="p-6">
                      {/* Cabeçalho */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {correction.student_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {correction.student_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(correction.submitted_at)}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            Questão {index + 1} - {correction.question_points.toFixed(1).replace('.', ',')} pontos
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Questão */}
                      <div className="mb-4">
                        <Label className="text-base font-medium">Questão:</Label>
                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                          <p className="text-sm">{correction.question_text}</p>
                        </div>
                      </div>

                      {/* Resposta do Aluno */}
                      <div className="mb-4">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Resposta do Aluno:
                        </Label>
                        <div className="bg-blue-50 p-3 rounded-lg mt-2 border border-blue-200">
                          <p className="text-sm text-blue-800">{correction.answer_text}</p>
                        </div>
                      </div>

                      {/* Resposta Esperada (se disponível) */}
                      {correction.expected_answer && (
                        <div className="mb-4">
                          <Label className="text-base font-medium text-green-700">
                            Resposta Esperada (Gabarito):
                          </Label>
                          <div className="bg-green-50 p-3 rounded-lg mt-2 border border-green-200">
                            <p className="text-sm text-green-800">{correction.expected_answer}</p>
                          </div>
                        </div>
                      )}

                      <Separator className="my-4" />

                      {/* Correção */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`points-${correction.answer_id}`} className="text-sm font-medium">
                            Pontuação (máx: {correction.question_points.toFixed(1).replace('.', ',')})
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id={`points-${correction.answer_id}`}
                              type="text"
                              value={corrections[correction.answer_id]?.points.toString().replace('.', ',') || '0'}
                              onChange={(e) => {
                                const value = e.target.value.replace(',', '.')
                                const numValue = Math.max(0, Math.min(correction.question_points, parseFloat(value) || 0))
                                setCorrections(prev => ({
                                  ...prev,
                                  [correction.answer_id]: {
                                    ...prev[correction.answer_id],
                                    points: numValue
                                  }
                                }))
                              }}
                              placeholder="0,0"
                              className="w-24"
                            />
                            <Button
                              onClick={() => handleSingleCorrection(correction.answer_id)}
                              size="sm"
                              disabled={isCorrecting}
                            >
                              {isCorrecting ? (
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

                            {/* Botão de correção automática */}
                            {correction.auto_correction_enabled && correction.expected_answer && (
                              <Button
                                onClick={() => handleAutoCorrection(correction.answer_id)}
                                size="sm"
                                variant="outline"
                                disabled={isCorrecting}
                              >
                                {isCorrecting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                    Corrigindo...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 mr-1" />
                                    Auto
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`feedback-${correction.answer_id}`} className="text-sm font-medium">
                            Feedback (opcional)
                          </Label>
                          <Textarea
                            id={`feedback-${correction.answer_id}`}
                            value={corrections[correction.answer_id]?.feedback || ''}
                            onChange={(e) => setCorrections(prev => ({
                              ...prev,
                              [correction.answer_id]: {
                                ...prev[correction.answer_id],
                                feedback: e.target.value
                              }
                            }))}
                            placeholder="Comentários sobre a resposta..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 