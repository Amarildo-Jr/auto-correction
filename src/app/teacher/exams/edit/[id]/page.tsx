'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import { Question, useQuestions } from "@/hooks/useQuestions"
import { AlertCircle, ArrowLeft, FileText, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditExamPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const { updateExam, getExam } = useExams()
  const { classes, isLoading: classesLoading } = useClasses()
  const { questions, isLoading: questionsLoading } = useQuestions()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    class_id: '',
    status: 'draft' as 'draft' | 'published',
  })

  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published'>('draft')
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [questionPoints, setQuestionPoints] = useState<Record<number, string | number>>({})
  const [questionSearch, setQuestionSearch] = useState('')
  const [questionFilters, setQuestionFilters] = useState({
    type: 'all',
    category: 'all',
    difficulty: 'all'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExam, setIsLoadingExam] = useState(true)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Carregar dados da prova
  useEffect(() => {
    const loadExam = async () => {
      try {
        setIsLoadingExam(true)
        const exam = await getExam(params.id)

        if (exam) {
          const formatDateTimeLocal = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          };

          setFormData({
            title: exam.title,
            description: exam.description || '',
            duration_minutes: exam.duration_minutes,
            start_time: exam.start_time ? formatDateTimeLocal(exam.start_time) : '',
            end_time: exam.end_time ? formatDateTimeLocal(exam.end_time) : '',
            class_id: exam.class_id?.toString() || '',
            status: exam.status || 'draft',
          })

          setOriginalStatus(exam.status || 'draft')

          if (exam.questions) {
            const questionIds = exam.questions.map((q: any) => q.id)
            const questionPointsMap: Record<number, string | number> = {}

            exam.questions.forEach((q: any) => {
              questionPointsMap[q.id] = q.points
            })

            setSelectedQuestions(questionIds)
            setQuestionPoints(questionPointsMap)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar prova:', error)
        setError('Erro ao carregar dados da prova')
      } finally {
        setIsLoadingExam(false)
      }
    }

    loadExam()
  }, [params.id, getExam])

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  if (classesLoading || questionsLoading || isLoadingExam) {
    return <LoadingSpinner />
  }

  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = { ...validationErrors }

    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Título é obrigatório'
        } else if (value.length < 3) {
          errors.title = 'Título deve ter pelo menos 3 caracteres'
        } else {
          delete errors.title
        }
        break
      case 'class_id':
        if (!value) {
          errors.class_id = 'Turma é obrigatória'
        } else {
          delete errors.class_id
        }
        break
      case 'duration_minutes':
        if (!value || value < 5) {
          errors.duration_minutes = 'Duração deve ser de pelo menos 5 minutos'
        } else if (value > 480) {
          errors.duration_minutes = 'Duração não pode exceder 8 horas'
        } else {
          delete errors.duration_minutes
        }
        break
      case 'start_time':
        if (!value) {
          errors.start_time = 'Data de início é obrigatória'
        } else {
          delete errors.start_time
          if (formData.end_time && new Date(value) >= new Date(formData.end_time)) {
            errors.end_time = 'Data de fim deve ser posterior ao início'
          }
        }
        break
      case 'end_time':
        if (!value) {
          errors.end_time = 'Data de fim é obrigatória'
        } else if (formData.start_time && new Date(value) <= new Date(formData.start_time)) {
          errors.end_time = 'Data de fim deve ser posterior ao início'
        } else {
          delete errors.end_time
        }
        break
      case 'status':
        if (!value || (value !== 'draft' && value !== 'published')) {
          errors.status = 'Status é obrigatório'
        } else {
          delete errors.status
        }
        break
    }

    setValidationErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.title.trim() || !formData.class_id || !formData.start_time || !formData.end_time) {
      setError('Por favor, preencha todos os campos obrigatórios')
      setIsLoading(false)
      return
    }

    if (Object.keys(validationErrors).length > 0) {
      setError('Por favor, corrija os erros nos campos')
      setIsLoading(false)
      return
    }

    try {
      const examData: any = {
        ...formData,
        class_id: parseInt(formData.class_id),
      }

      if (canEditQuestions) {
        examData.questions = selectedQuestions
        examData.question_points = questionPoints
      }

      await updateExam(params.id, examData)
      router.push('/teacher/exams')
    } catch (err: any) {
      console.error('Erro ao atualizar prova:', err)
      setError(err.response?.data?.error || err.message || 'Erro inesperado ao atualizar prova')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSelectQuestion = (questionId: number) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        const newQuestionPoints = { ...questionPoints }
        delete newQuestionPoints[questionId]
        setQuestionPoints(newQuestionPoints)
        return prev.filter(id => id !== questionId)
      } else {
        const question = questions.find(q => q.id === questionId)
        if (question) {
          setQuestionPoints(prev => ({
            ...prev,
            [questionId]: question.points
          }))
        }
        return [...prev, questionId]
      }
    })
  }

  const handleSelectAllQuestions = () => {
    if (filteredQuestions.length > 0 && filteredQuestions.every(q => selectedQuestions.includes(q.id))) {
      const questionsToRemove = filteredQuestions.map(q => q.id)
      setSelectedQuestions(prev => prev.filter(id => !questionsToRemove.includes(id)))
      const newQuestionPoints = { ...questionPoints }
      questionsToRemove.forEach(id => delete newQuestionPoints[id])
      setQuestionPoints(newQuestionPoints)
    } else {
      const questionsToAdd = filteredQuestions.filter(q => !selectedQuestions.includes(q.id))
      setSelectedQuestions(prev => [...prev, ...questionsToAdd.map(q => q.id)])
      const newQuestionPoints = { ...questionPoints }
      questionsToAdd.forEach(q => {
        newQuestionPoints[q.id] = q.points
      })
      setQuestionPoints(newQuestionPoints)
    }
  }

  const handleQuestionPointsChange = (questionId: number, value: string) => {
    const cleanValue = value.replace(/[^\\d.,]/g, '').replace(',', '.')

    if (cleanValue === '' || cleanValue === '.') {
      setQuestionPoints(prev => ({
        ...prev,
        [questionId]: ''
      }))
      return
    }

    const numericValue = parseFloat(cleanValue)

    if (!isNaN(numericValue) && numericValue >= 0) {
      setQuestionPoints(prev => ({
        ...prev,
        [questionId]: numericValue
      }))
    }
  }

  const getQuestionPoints = (questionId: number, defaultPoints: number): string => {
    const points = questionPoints[questionId]
    if (points === '' || points === undefined || points === null) {
      return ''
    }
    return typeof points === 'number' ? points.toString() : points
  }

  const truncarTexto = (texto: string, tamanhoMaximo: number) => {
    if (!texto) return ''
    if (texto.length <= tamanhoMaximo) return texto
    return texto.substr(0, tamanhoMaximo) + '...'
  }

  const getQuestionStats = () => {
    const stats = {
      single_choice: 0,
      multiple_choice: 0,
      true_false: 0,
      essay: 0
    }

    selectedQuestions.forEach(id => {
      const question = questions.find(q => q.id === id)
      if (question) {
        stats[question.question_type as keyof typeof stats]++
      }
    })

    return stats
  }

  const filteredQuestions = (questions || []).filter((question: Question) => {
    if (!question || typeof question !== 'object') return false;

    const questionText = question.text || question.question_text || '';
    const questionType = question.question_type || question.type || '';
    const questionCategory = question.category || '';
    const questionDifficulty = question.difficulty || '';

    const textMatch = questionText.toLowerCase().includes(questionSearch.toLowerCase());
    const typeMatch = questionFilters.type === 'all' ||
      (questionFilters.type === 'single_choice' && questionType === 'single_choice') ||
      (questionFilters.type === 'multiple_choice' && questionType === 'multiple_choice') ||
      (questionFilters.type === 'true_false' && questionType === 'true_false') ||
      (questionFilters.type === 'essay' && questionType === 'essay');
    const categoryMatch = questionFilters.category === 'all' ||
      questionCategory.toLowerCase().includes(questionFilters.category.toLowerCase());
    const difficultyMatch = questionFilters.difficulty === 'all' ||
      questionDifficulty === questionFilters.difficulty;

    return textMatch && typeMatch && categoryMatch && difficultyMatch;
  });

  const totalPoints = selectedQuestions.reduce((total, id) => {
    const question = questions.find(q => q.id === id)
    const points = questionPoints[id]
    let pointsValue: number

    if (points === '' || points === null || points === undefined) {
      pointsValue = question?.points || 0
    } else {
      pointsValue = typeof points === 'string' ? parseFloat(points) || 0 : points
    }

    return total + pointsValue
  }, 0)

  const questionStats = getQuestionStats()
  const canEditQuestions = originalStatus === 'draft'
  const canEditBasicFields = originalStatus === 'draft'

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Editar Prova</h1>
        <p className="text-muted-foreground">
          Modifique as informações da prova e suas questões
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título da Prova *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={validationErrors.title ? 'border-red-300' : ''}
                placeholder="Ex: Prova 1 - Introdução à Programação"
                disabled={!canEditBasicFields}
                required
              />
              {validationErrors.title && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.title}</p>
              )}
              {!canEditBasicFields && (
                <p className="text-orange-600 text-xs mt-1">
                  ⚠️ Título não pode ser alterado em provas publicadas
                </p>
              )}
            </div>

            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
                Turma *
              </label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => canEditBasicFields && handleSelectChange('class_id', value)}
                disabled={!canEditBasicFields}
              >
                <SelectTrigger className={validationErrors.class_id ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classObj) => (
                    <SelectItem key={classObj.id} value={classObj.id.toString()}>
                      {classObj.name} - {classObj.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.class_id && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.class_id}</p>
              )}
              {!canEditBasicFields && (
                <p className="text-orange-600 text-xs mt-1">
                  ⚠️ Turma não pode ser alterada em provas publicadas
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descrição opcional da prova..."
                disabled={!canEditBasicFields}
              />
              {!canEditBasicFields && (
                <p className="text-orange-600 text-xs mt-1">
                  ⚠️ Descrição não pode ser alterada em provas publicadas
                </p>
              )}
            </div>

            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                Duração (minutos) *
              </label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="5"
                max="480"
                value={formData.duration_minutes}
                onChange={handleChange}
                className={validationErrors.duration_minutes ? 'border-red-300' : ''}
                disabled={!canEditBasicFields}
                required
              />
              {validationErrors.duration_minutes && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.duration_minutes}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.duration_minutes > 0 &&
                  `${Math.floor(formData.duration_minutes / 60)}h ${formData.duration_minutes % 60}min`
                }
              </p>
              {!canEditBasicFields && (
                <p className="text-orange-600 text-xs mt-1">
                  ⚠️ Duração não pode ser alterada em provas publicadas
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status da Prova *
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  if (originalStatus === 'published' && value === 'draft') {
                    setError('Uma prova publicada não pode voltar para rascunho. Isso poderia afetar alunos que já iniciaram a prova.')
                    return
                  }
                  handleSelectChange('status', value)
                  setError('')
                }}
              >
                <SelectTrigger className={validationErrors.status ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="draft"
                    disabled={originalStatus === 'published'}
                  >
                    Rascunho
                    {originalStatus === 'published' && (
                      <span className="text-red-500 ml-2">(Não disponível)</span>
                    )}
                  </SelectItem>
                  <SelectItem value="published">Publicar</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.status && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.status}</p>
              )}

              <div className="mt-2 space-y-1">
                <p className="text-gray-500 text-xs">
                  Status atual: <span className="font-medium">
                    {originalStatus === 'draft' ? 'Rascunho' : 'Publicada'}
                  </span>
                </p>

                {originalStatus === 'draft' && formData.status === 'published' && (
                  <p className="text-blue-600 text-xs bg-blue-50 p-2 rounded">
                    ⚠️ A prova será publicada e ficará disponível para alunos no período definido.
                  </p>
                )}

                {originalStatus === 'published' && (
                  <p className="text-orange-600 text-xs bg-orange-50 p-2 rounded">
                    ℹ️ Esta prova já está publicada. Você pode editá-la, mas não pode voltar para rascunho.
                  </p>
                )}

                {formData.status === 'draft' ? (
                  <p className="text-gray-500 text-xs">
                    A prova será salva como rascunho (não visível para alunos)
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs">
                    A prova será publicada e disponível para alunos no período definido
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Início *
                </label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={validationErrors.start_time ? 'border-red-300' : ''}
                  disabled={!canEditBasicFields}
                  required
                />
                {validationErrors.start_time && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.start_time}</p>
                )}
                {!canEditBasicFields && (
                  <p className="text-orange-600 text-xs mt-1">
                    ⚠️ Data de início não pode ser alterada em provas publicadas
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Fim *
                  {!canEditBasicFields && (
                    <span className="text-green-600 ml-2">✅ Editável</span>
                  )}
                </label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={handleChange}
                  className={validationErrors.end_time ? 'border-red-300' : ''}
                  required
                />
                {validationErrors.end_time && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.end_time}</p>
                )}
                {!canEditBasicFields && (
                  <p className="text-green-600 text-xs mt-1">
                    ✅ Você pode alterar o horário de fim para reabrir ou estender a prova
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!canEditBasicFields && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1">
                    Restrições de Edição - Prova {originalStatus === 'published' ? 'Publicada' : 'Finalizada'}
                  </h3>
                  <div className="text-orange-700 text-sm space-y-1">
                    <p>• <strong>Não é possível alterar:</strong> título, turma, descrição, duração, data de início e questões</p>
                    <p>• <strong>É possível alterar:</strong> data e hora de fim (para reabrir ou estender a prova)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Atualizando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 