'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import api from "@/services/api"
import { Bot, CheckCircle, Clock, FileText, HandIcon, Target, User } from "lucide-react"
import { useEffect, useState } from "react"

interface PendingCorrection {
  answer_id: number
  question_id: number
  question_text: string
  expected_answer?: string
  student_answer: string
  student_name: string
  student_email: string
  exam_title: string
  exam_id: number
  max_points: number
  similarity_score?: number
  correction_method?: string
  auto_correction_enabled: boolean
  created_at: string
}

export default function CorrectionReviewPage() {
  const { user } = useAuth()
  const [corrections, setCorrections] = useState<PendingCorrection[]>([])
  const [loading, setLoading] = useState(true)
  const [correcting, setCorrecting] = useState<number | null>(null)
  const [scores, setScores] = useState<{ [key: number]: number }>({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadPendingCorrections()
  }, [])

  const loadPendingCorrections = async () => {
    try {
      const response = await api.get('/api/teacher/results/pending-corrections')
      setCorrections(response.data.pending_corrections)

      // Inicializar scores
      const initialScores: { [key: number]: number } = {}
      response.data.pending_corrections.forEach((item: PendingCorrection) => {
        initialScores[item.answer_id] = item.similarity_score || 0
      })
      setScores(initialScores)
    } catch (err: any) {
      setError('Erro ao carregar correções pendentes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCorrection = async (answerId: number, points: number) => {
    setCorrecting(answerId)
    setError('')

    try {
      await api.post(`/api/teacher/manual-correction/${answerId}`, {
        points_earned: points,
        feedback: '' // Feedback opcional
      })

      // Remover da lista após correção
      setCorrections(prev => prev.filter(item => item.answer_id !== answerId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar correção')
    } finally {
      setCorrecting(null)
    }
  }

  const updateScore = (answerId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [answerId]: score
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Correção de Questões Dissertativas</h1>
        <p className="text-muted-foreground">
          Respostas pendentes de correção manual
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {corrections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Todas as correções estão em dia!</h3>
            <p className="text-muted-foreground">
              Não há respostas dissertativas pendentes de correção.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                {corrections.length} resposta{corrections.length !== 1 ? 's' : ''} pendente{corrections.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {corrections.map((correction) => (
            <Card key={correction.answer_id} className="border-l-4 border-l-amber-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {correction.exam_title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {correction.student_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {correction.max_points} pontos
                      </div>
                      {correction.auto_correction_enabled && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          Correção Auto Habilitada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Questão */}
                <div>
                  <Label className="text-base font-medium flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Questão
                  </Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{correction.question_text}</p>
                  </div>
                </div>

                {/* Resposta Esperada */}
                {correction.expected_answer && (
                  <div>
                    <Label className="text-base font-medium flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      Resposta Esperada (Gabarito)
                    </Label>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">{correction.expected_answer}</p>
                    </div>
                  </div>
                )}

                {/* Resposta do Estudante */}
                <div>
                  <Label className="text-base font-medium flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Resposta do Estudante
                  </Label>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{correction.student_answer}</p>
                  </div>
                </div>

                {/* Score de Similaridade (se disponível) */}
                {correction.similarity_score !== null && correction.similarity_score !== undefined && (
                  <div>
                    <Label className="text-base font-medium flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      Score de Similaridade Automática
                    </Label>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-purple-700">
                          {correction.similarity_score.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-600">
                          <p>Similaridade semântica calculada automaticamente</p>
                          <p className="text-xs mt-1">
                            Sugestão: {((correction.similarity_score / 100) * correction.max_points).toFixed(1)} pontos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Correção Manual */}
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <HandIcon className="w-4 h-4 text-amber-600" />
                    Correção Manual
                  </Label>

                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`score-${correction.answer_id}`} className="text-sm">
                        Pontuação Atribuída
                      </Label>
                      <Input
                        id={`score-${correction.answer_id}`}
                        type="number"
                        min="0"
                        max={correction.max_points}
                        step="0.1"
                        value={scores[correction.answer_id] || 0}
                        onChange={(e) => updateScore(correction.answer_id, parseFloat(e.target.value) || 0)}
                        className="mt-1"
                        placeholder="0.0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo: {correction.max_points} pontos
                      </p>
                    </div>

                    <Button
                      onClick={() => handleManualCorrection(correction.answer_id, scores[correction.answer_id] || 0)}
                      disabled={correcting === correction.answer_id}
                      className="min-w-[120px]"
                    >
                      {correcting === correction.answer_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 