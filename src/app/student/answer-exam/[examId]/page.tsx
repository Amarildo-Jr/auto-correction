'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { useExams } from "@/hooks/useExams"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  Flag,
  Save,
  Send
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface AnswerExamPageProps {
  params: {
    examId: string
  }
}

interface Question {
  id: number
  question_text: string
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  order_number: number
  alternatives?: {
    id: number
    alternative_text: string
    order_number: number
  }[]
}

interface Answer {
  question_id: number
  answer_text?: string
  selected_alternative_id?: number
}

export default function AnswerExamPage({ params }: AnswerExamPageProps) {
  const { exams, isLoading: examsLoading } = useExams()
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)

  // Proteção anti-cola para questões dissertativas
  const handlePreventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Mostrar aviso visual
    const element = e.target as HTMLElement
    const originalBorder = element.style.border
    element.style.border = '2px solid #ef4444'
    setTimeout(() => {
      element.style.border = originalBorder
    }, 500)
  }

  const handlePreventKeyboardShortcuts = (e: React.KeyboardEvent) => {
    const isCtrlKey = e.ctrlKey || e.metaKey
    const forbiddenKeys = ['c', 'v', 'x', 'a', 'z', 'y']

    if (isCtrlKey && forbiddenKeys.includes(e.key.toLowerCase())) {
      e.preventDefault()
    }

    // Bloquear F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' ||
      (isCtrlKey && e.shiftKey && e.key === 'I') ||
      (isCtrlKey && e.key === 'u')) {
      e.preventDefault()
    }
  }

  const handlePreventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Carregar dados da prova
  useEffect(() => {
    if (exams.length > 0) {
      const foundExam = exams.find(e => e.id.toString() === params.examId)
      if (foundExam) {
        setExam(foundExam)
        setTimeRemaining(foundExam.duration * 60) // converter para segundos

        // Simular questões (em um caso real, viria da API)
        const mockQuestions: Question[] = [
          {
            id: 1,
            question_text: "Qual é o resultado de 2 + 2?",
            question_type: "multiple_choice",
            points: 2,
            order_number: 1,
            alternatives: [
              { id: 1, alternative_text: "3", order_number: 1 },
              { id: 2, alternative_text: "4", order_number: 2 },
              { id: 3, alternative_text: "5", order_number: 3 },
              { id: 4, alternative_text: "6", order_number: 4 }
            ]
          },
          {
            id: 2,
            question_text: "Explique o conceito de derivada em cálculo.",
            question_type: "essay",
            points: 5,
            order_number: 2
          },
          {
            id: 3,
            question_text: "Qual é a fórmula da área de um círculo?",
            question_type: "multiple_choice",
            points: 3,
            order_number: 3,
            alternatives: [
              { id: 5, alternative_text: "π × r", order_number: 1 },
              { id: 6, alternative_text: "π × r²", order_number: 2 },
              { id: 7, alternative_text: "2 × π × r", order_number: 3 },
              { id: 8, alternative_text: "π × d", order_number: 4 }
            ]
          }
        ]
        setQuestions(mockQuestions)
      }
    }
  }, [exams, params.examId])

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Salvar todas as respostas pendentes
      for (const answer of Object.values(answers)) {
        console.log('Enviando resposta:', answer)
        // await enrollmentService.submitAnswer(enrollmentId, answer)
      }

      // Finalizar prova
      console.log('Finalizando prova:', enrollmentId)
      // await enrollmentService.finish(enrollmentId)

      // Redirecionar para página de finalização
      router.push('/student/finish-exam')
    } catch (error) {
      console.error('Erro ao enviar prova:', error)
      alert('Erro ao enviar prova. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, answers, enrollmentId, router])

  // Timer da prova
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam() // Auto-submit quando o tempo acabar
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [examStarted, timeRemaining, handleSubmitExam])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin')) {
    router.push('/login')
    return null
  }

  if (examsLoading) {
    return <LoadingSpinner />
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Prova não encontrada</h2>
            <p className="text-red-600 mb-4">A prova solicitada não foi encontrada ou não está disponível.</p>
            <Button onClick={() => router.push('/student/exams')} variant="outline">
              Voltar para Provas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartExam = () => {
    setExamStarted(true)
    setEnrollmentId(Date.now()) // Simular ID de matrícula
  }

  const handleAnswerChange = (questionId: number, answer: Partial<Answer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        ...answer
      }
    }))
  }

  const handleSaveAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    const answer = answers[currentQuestion.id]

    if (!answer) return

    try {
      // Aqui seria a chamada real para a API
      console.log('Salvando resposta:', answer)
      // await enrollmentService.submitAnswer(enrollmentId, answer)
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
    }
  }

  // Garantir que questions seja sempre um array válido
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const currentQuestion = safeQuestions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
  const totalQuestions = safeQuestions.length
  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Tela inicial antes de começar a prova
  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">{exam.title}</CardTitle>
            <div className="flex justify-center">
              <FileText className="w-16 h-16 text-blue-600 mb-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informações da Prova</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Duração:</strong> {exam.duration_minutes} minutos</p>
                  <p><strong>Total de Questões:</strong> {safeQuestions.length}</p>
                  <p><strong>Pontuação Total:</strong> {safeQuestions.reduce((sum, q) => sum + q.points, 0)} pontos</p>
                  <p><strong>Início:</strong> {new Date(exam.start_time).toLocaleString('pt-BR')}</p>
                  <p><strong>Fim:</strong> {new Date(exam.end_time).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Instruções Importantes</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p>Você tem {exam.duration_minutes} minutos para completar a prova</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Save className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p>Suas respostas são salvas automaticamente</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p>A prova será enviada automaticamente quando o tempo acabar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Flag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Você pode navegar entre as questões livremente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t">
              <p className="text-gray-600 mb-4">
                Ao clicar em &quot;Iniciar Prova&quot;, o cronômetro começará a contar.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/exams')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleStartExam}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Iniciar Prova
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Interface da prova em andamento
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo com timer e progresso */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Questão {currentQuestionIndex + 1} de {totalQuestions}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Progresso</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {answeredQuestions}/{totalQuestions}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600">Tempo Restante</div>
                <div className={`text-lg font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navegação das questões */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {safeQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium border-2 transition-all
                        ${index === currentQuestionIndex
                          ? 'bg-blue-600 text-white border-blue-600'
                          : answers[question.id]
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Atual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Respondida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                    <span>Não respondida</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questão atual */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Questão {currentQuestion.order_number}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{currentQuestion.points} pontos</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {currentQuestion.question_type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 leading-relaxed">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  {/* Alternativas para múltipla escolha */}
                  {currentQuestion.question_type === 'multiple_choice' && currentQuestion.alternatives && (
                    <div className="space-y-3">
                      {currentQuestion.alternatives.map((alternative) => (
                        <label
                          key={alternative.id}
                          className={`
                            flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                            ${currentAnswer?.selected_alternative_id === alternative.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={alternative.id}
                            checked={currentAnswer?.selected_alternative_id === alternative.id}
                            onChange={() => handleAnswerChange(currentQuestion.id, {
                              selected_alternative_id: alternative.id
                            })}
                            className="mt-1"
                          />
                          <span className="flex-1">{alternative.alternative_text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Campo de texto para dissertativa */}
                  {currentQuestion.question_type === 'essay' && (
                    <div>
                      <div className="relative">
                        <textarea
                          value={currentAnswer?.answer_text || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, {
                            answer_text: e.target.value
                          })}
                          placeholder="Digite sua resposta aqui... (Copy/Paste não permitido)"
                          rows={8}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          onPaste={handlePreventCopyPaste}
                          onCopy={handlePreventCopyPaste}
                          onCut={handlePreventCopyPaste}
                          onKeyDown={handlePreventKeyboardShortcuts}
                          onContextMenu={handlePreventContextMenu}
                          spellCheck={false}
                          autoComplete="off"
                        />
                        <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          🛡️ Protegido
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          Caracteres: {currentAnswer?.answer_text?.length || 0}
                        </p>
                        <p className="text-xs text-amber-600">
                          ⚠️ Copy/Paste bloqueado por segurança
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botões de navegação */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSaveAnswer}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </Button>

                      {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button
                          onClick={handleSubmitExam}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? (
                            <>
                              <LoadingSpinner />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Finalizar Prova
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                        >
                          Próxima
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 