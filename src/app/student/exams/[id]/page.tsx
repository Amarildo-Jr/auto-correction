'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import { useExam } from "@/hooks/useExams"
import api, { enrollmentService, examService } from "@/services/api"
import { AlertCircle, Clock, FileText, Send, Timer } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Answer {
  question_id: number
  answer_text?: string
  selected_alternatives: number[]
}

interface EnrollmentStatus {
  id?: number
  status: string
  start_time?: string
  existing_answers?: any[]
}

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const { exam, isLoading: examLoading } = useExam(parseInt(params.id))
  const router = useRouter()

  // Cast para incluir questions
  const examWithQuestions = exam as any

  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isFinished, setIsFinished] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Verificar status da inscrição
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!exam?.id) return

      try {
        const response = await api.get(`/api/exams/${exam.id}/enrollment-status`)
        const status = response.data
        setEnrollmentStatus(status)

        // Se já está em andamento, configurar para continuar
        if (status.status === 'in_progress') {
          setIsStarted(true)
          setEnrollmentId(status.id)

          // Calcular tempo restante
          const startTime = new Date(status.start_time)
          const now = new Date()
          const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
          const remainingMinutes = Math.max(0, exam.duration - elapsedMinutes)
          setTimeRemaining(remainingMinutes * 60)

          // Carregar respostas existentes
          if (status.existing_answers) {
            const existingAnswersMap = new Map()
            status.existing_answers.forEach((answer: any) => {
              existingAnswersMap.set(answer.question_id, {
                question_id: answer.question_id,
                answer_text: answer.answer_text || '',
                selected_alternatives: answer.selected_alternatives || []
              })
            })

            // Inicializar todas as respostas
            if (examWithQuestions?.questions && Array.isArray(examWithQuestions.questions)) {
              const allAnswers: Answer[] = examWithQuestions.questions.map((question: any) => {
                return existingAnswersMap.get(question.id) || {
                  question_id: question.id,
                  answer_text: '',
                  selected_alternatives: []
                }
              })
              setAnswers(allAnswers)
            }
          }
        } else if (status.status === 'completed') {
          setIsFinished(true)
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    checkEnrollmentStatus()
  }, [exam, examWithQuestions])

  // Timer
  useEffect(() => {
    if (!isStarted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, timeRemaining])

  // Inicializar respostas para nova tentativa
  useEffect(() => {
    if (examWithQuestions?.questions && Array.isArray(examWithQuestions.questions) && !isStarted && !enrollmentStatus?.existing_answers) {
      const initialAnswers: Answer[] = examWithQuestions.questions.map((question: any) => ({
        question_id: question.id,
        answer_text: '',
        selected_alternatives: []
      }))
      setAnswers(initialAnswers)
    }
  }, [examWithQuestions, isStarted, enrollmentStatus])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin')) {
    router.push('/login')
    return null
  }

  if (examLoading || isLoadingStatus) {
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

  const handleStartExam = async () => {
    try {
      setError('')
      const enrollment = await examService.start(exam.id)
      setEnrollmentId(enrollment.id)
      setIsStarted(true)

      // Se retornou respostas existentes, carregar elas
      if (enrollment.existing_answers) {
        const existingAnswersMap = new Map()
        enrollment.existing_answers.forEach((answer: any) => {
          existingAnswersMap.set(answer.question_id, {
            question_id: answer.question_id,
            answer_text: answer.answer_text || '',
            selected_alternatives: answer.selected_alternatives || []
          })
        })

        // Atualizar respostas
        if (examWithQuestions?.questions && Array.isArray(examWithQuestions.questions)) {
          const allAnswers: Answer[] = examWithQuestions.questions.map((question: any) => {
            return existingAnswersMap.get(question.id) || {
              question_id: question.id,
              answer_text: '',
              selected_alternatives: []
            }
          })
          setAnswers(allAnswers)
        }

        // Calcular tempo restante se já estava em andamento
        if (enrollment.start_time) {
          const startTime = new Date(enrollment.start_time)
          const now = new Date()
          const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
          const remainingMinutes = Math.max(0, exam.duration_minutes - elapsedMinutes)
          setTimeRemaining(remainingMinutes * 60)
        } else {
          setTimeRemaining(exam.duration_minutes * 60)
        }
      } else {
        setTimeRemaining(exam.duration_minutes * 60)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao iniciar prova')
    }
  }

  const handleAnswerChange = (questionId: number, value: string | number[], isText: boolean = false) => {
    setAnswers(prev => prev.map(answer => {
      if (answer.question_id === questionId) {
        if (isText) {
          return { ...answer, answer_text: value as string }
        } else {
          const alternatives = Array.isArray(value) ? value : [value]
          return { ...answer, selected_alternatives: alternatives.filter(v => v !== undefined && v !== null) as number[] }
        }
      }
      return answer
    }))

    // Salvar resposta automaticamente
    if (enrollmentId) {
      const answerData: any = {
        question_id: questionId,
        ...(isText
          ? { answer_text: value as string }
          : { selected_alternatives: Array.isArray(value) ? value.filter(v => v !== undefined && v !== null) : [value].filter(v => v !== undefined && v !== null) }
        )
      }

      enrollmentService.submitAnswer(enrollmentId, answerData)
        .catch(err => console.error('Erro ao salvar resposta:', err))
    }
  }

  const handleFinishExam = async () => {
    if (!enrollmentId) return

    try {
      setIsSubmitting(true)
      const response = await enrollmentService.finish(enrollmentId)
      setResult(response)
      setIsFinished(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao finalizar prova')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentQuestion = () => {
    const questions = Array.isArray(examWithQuestions?.questions) ? examWithQuestions.questions : [];
    return questions[currentQuestionIndex]
  }

  const getCurrentAnswer = () => {
    const currentQuestion = getCurrentQuestion()
    return answers.find(a => a.question_id === currentQuestion?.id)
  }

  const nextQuestion = () => {
    const questionsLength = Array.isArray(examWithQuestions?.questions) ? examWithQuestions.questions.length : 0;
    if (currentQuestionIndex < questionsLength - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Send className="w-5 h-5" />
              Prova Finalizada!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                Sua prova foi enviada com sucesso!
              </p>

              {result && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Resultado Preliminar:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Questões respondidas:</span> {result.answers_count || 0}
                    </div>
                    <div>
                      <span className="text-gray-600">Pontuação obtida:</span> {result.total_points || 0}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Questões dissertativas serão corrigidas manualmente pelo professor
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => router.push('/student/exams')}>
                  Ver Minhas Provas
                </Button>
                <Button variant="outline" onClick={() => router.push('/student')}>
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStarted) {
    const canContinue = enrollmentStatus?.status === 'in_progress'
    const isCompleted = enrollmentStatus?.status === 'completed'

    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {exam.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.description && (
              <p className="text-gray-600">{exam.description}</p>
            )}

            {canContinue && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">Prova em Andamento</p>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    Você já iniciou esta prova. Clique em &quot;Continuar Prova&quot; para retomar de onde parou.
                  </p>
                </CardContent>
              </Card>
            )}

            {isCompleted && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">Prova Finalizada</p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Você já finalizou esta prova.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Duração</span>
                </div>
                <p className="text-blue-600 mt-1">
                  {Math.floor(exam.duration_minutes / 60)}h {exam.duration_minutes % 60}min
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Questões</span>
                </div>
                <p className="text-green-600 mt-1">
                  {examWithQuestions.questions?.length || 0} questões
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-800">
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">Disponível até</span>
                </div>
                <p className="text-purple-600 mt-1 text-sm">
                  {new Date(exam.end_time).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {!isCompleted && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Instruções Importantes:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Sua prova será salva automaticamente conforme você responde</li>
                    <li>• Não feche esta aba durante a realização da prova</li>
                    <li>• O tempo é limitado e será controlado automaticamente</li>
                    <li>• Certifique-se de ter uma conexão estável com a internet</li>
                    <li>• Você pode navegar entre as questões livremente</li>
                    {canContinue && <li>• Suas respostas anteriores serão carregadas automaticamente</li>}
                  </ul>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isCompleted && (
              <div className="flex justify-center">
                <Button
                  onClick={handleStartExam}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  size="lg"
                >
                  {canContinue ? 'Continuar Prova' : 'Iniciar Prova'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const currentAnswer = getCurrentAnswer()

  if (!currentQuestion) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header com Timer */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <p className="text-sm text-gray-600">
              Questão {currentQuestionIndex + 1} de {examWithQuestions.questions?.length || 0}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-medium">
                {formatTime(timeRemaining)}
              </span>
            </div>

            <Button
              onClick={handleFinishExam}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Prova'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegação das Questões */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Navegação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {(Array.isArray(examWithQuestions?.questions) ? examWithQuestions.questions : []).map((question: any, index: number) => {
                  const hasAnswer = answers.find(a => a.question_id === question.id)
                  const isAnswered = hasAnswer && (
                    hasAnswer.answer_text?.trim() ||
                    hasAnswer.selected_alternatives.length > 0
                  )

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded text-sm font-medium border-2 transition-colors ${index === currentQuestionIndex
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isAnswered
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Respondida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Não respondida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questão Atual */}
        <div className="lg:col-span-3">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Questão {currentQuestionIndex + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentQuestion.question_type === 'single_choice' ? 'bg-blue-100 text-blue-800' :
                      currentQuestion.question_type === 'multiple_choice' ? 'bg-purple-100 text-purple-800' :
                        currentQuestion.question_type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                      }`}>
                      {currentQuestion.question_type === 'single_choice' ? 'Escolha Única' :
                        currentQuestion.question_type === 'multiple_choice' ? 'Múltipla Escolha' :
                          currentQuestion.question_type === 'true_false' ? 'Verdadeiro/Falso' : 'Dissertativa'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.points} ponto{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-lg">{currentQuestion.question_text}</p>
                </div>

                {/* Alternativas para questões objetivas */}
                {currentQuestion.question_type === 'single_choice' && (
                  <RadioGroup
                    value={currentAnswer?.selected_alternatives[0]?.toString() || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, [parseInt(value)])}
                  >
                    {currentQuestion.alternatives?.map((alternative: any) => (
                      <div key={alternative.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={alternative.id.toString()} id={`alt-${alternative.id}`} />
                        <label
                          htmlFor={`alt-${alternative.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {alternative.alternative_text}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.question_type === 'multiple_choice' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      Selecione todas as alternativas corretas:
                    </p>
                    {currentQuestion.alternatives?.map((alternative: any) => (
                      <div key={alternative.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`alt-${alternative.id}`}
                          checked={currentAnswer?.selected_alternatives.includes(alternative.id) || false}
                          onCheckedChange={(checked) => {
                            const currentSelected = currentAnswer?.selected_alternatives || []
                            const newSelected = checked
                              ? [...currentSelected, alternative.id]
                              : currentSelected.filter(id => id !== alternative.id)
                            handleAnswerChange(currentQuestion.id, newSelected)
                          }}
                        />
                        <label
                          htmlFor={`alt-${alternative.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {alternative.alternative_text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.question_type === 'true_false' && (
                  <RadioGroup
                    value={currentAnswer?.selected_alternatives[0]?.toString() || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, [parseInt(value)])}
                  >
                    {currentQuestion.alternatives?.map((alternative: any) => (
                      <div key={alternative.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={alternative.id.toString()} id={`alt-${alternative.id}`} />
                        <label
                          htmlFor={`alt-${alternative.id}`}
                          className="flex-1 cursor-pointer font-medium"
                        >
                          {alternative.alternative_text}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Resposta dissertativa */}
                {currentQuestion.question_type === 'essay' && (
                  <div className="space-y-3">
                    <label htmlFor="essay-answer" className="block text-sm font-medium text-gray-700">
                      Sua resposta:
                    </label>
                    <Textarea
                      id="essay-answer"
                      rows={8}
                      value={currentAnswer?.answer_text || ''}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value, true)}
                      placeholder="Digite sua resposta aqui..."
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Resposta salva automaticamente conforme você digita
                    </p>
                  </div>
                )}

                {/* Navegação entre questões */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Questão Anterior
                  </Button>

                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === (Array.isArray(examWithQuestions?.questions) ? examWithQuestions.questions.length : 0) - 1}
                  >
                    Próxima Questão →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Carregando questão...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 