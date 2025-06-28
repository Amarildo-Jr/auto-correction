'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import { Question, useQuestions } from "@/hooks/useQuestions"
import { AlertCircle, ArrowLeft, BookOpen, FileText, Plus, Save, Search } from "lucide-react"
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
  })

  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [questionPoints, setQuestionPoints] = useState<Record<number, number>>({})
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
          setFormData({
            title: exam.title,
            description: exam.description || '',
            duration_minutes: exam.duration_minutes,
            start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : '',
            end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : '',
            class_id: exam.class_id?.toString() || '',
          })

          // Carregar questões da prova e suas pontuações
          if (exam.questions) {
            const questionIds = exam.questions.map((q: any) => q.id)
            const questionPointsMap: Record<number, number> = {}

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

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  if (classesLoading || questionsLoading || isLoadingExam) {
    return <LoadingSpinner />
  }

  // Validação em tempo real
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
          // Validar também end_time se já estiver preenchido
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
    }

    setValidationErrors(errors)
  }

  // Filtrar questões com verificações de segurança
  const filteredQuestions = (questions || []).filter((question: Question) => {
    // Verificações de segurança
    if (!question || typeof question !== 'object') return false;

    const questionText = question.text || question.question_text || '';
    const questionType = question.type || question.question_type || '';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validação final
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
      const examData = {
        ...formData,
        class_id: parseInt(formData.class_id),
        questions: selectedQuestions,
        question_points: questionPoints
      }

      const result = await updateExam(params.id, examData)
      if (result.success) {
        router.push('/teacher/exams')
      } else {
        setError(result.error || 'Erro ao atualizar prova')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar prova:', err)
      setError(err.response?.data?.error || err.message || 'Erro inesperado ao atualizar prova')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newValue = name === 'duration_minutes' ? parseInt(value) || 0 : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    validateField(name, newValue)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    validateField(name, value)
  }

  const handleSelectQuestion = (questionId: number) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.includes(questionId)
      if (isSelected) {
        // Remover questão e sua pontuação personalizada
        setQuestionPoints(prevPoints => {
          const newPoints = { ...prevPoints }
          delete newPoints[questionId]
          return newPoints
        })
        return prev.filter(id => id !== questionId)
      } else {
        // Adicionar questão e definir pontuação padrão
        const question = questions.find(q => q.id === questionId)
        if (question) {
          setQuestionPoints(prevPoints => ({
            ...prevPoints,
            [questionId]: question.points
          }))
        }
        return [...prev, questionId]
      }
    })
  }

  const handleSelectAllQuestions = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id))
    }
  }

  const handleQuestionPointsChange = (questionId: number, points: number) => {
    setQuestionPoints(prev => ({
      ...prev,
      [questionId]: points
    }))
  }

  const getQuestionPoints = (questionId: number, defaultPoints: number) => {
    return questionPoints[questionId] ?? defaultPoints
  }

  const truncarTexto = (texto: string, tamanhoMaximo: number) => {
    if (texto.length > tamanhoMaximo) {
      return texto.substring(0, tamanhoMaximo) + "..."
    }
    return texto
  }

  const totalPoints = selectedQuestions.reduce((total, id) => {
    const question = questions.find(q => q.id === id)
    const points = getQuestionPoints(id, question?.points || 0)
    return total + points
  }, 0)

  // Estatísticas das questões selecionadas
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
        stats[question.type as keyof typeof stats]++
      }
    })

    return stats
  }

  const questionStats = getQuestionStats()

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
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
        {/* Informações Básicas */}
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
                required
              />
              {validationErrors.title && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
                Turma *
              </label>
              <Select value={formData.class_id} onValueChange={(value) => handleSelectChange('class_id', value)}>
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
              />
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
                  required
                />
                {validationErrors.start_time && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.start_time}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Fim *
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questões Selecionadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Questões Selecionadas ({selectedQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma questão selecionada. Use a seção abaixo para adicionar questões.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Lista de questões selecionadas */}
                <div className="max-h-60 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead>Questão</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Pontos Padrão</TableHead>
                        <TableHead>Pontos na Prova</TableHead>
                        <TableHead className="w-12">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuestions.map((questionId) => {
                        const question = questions.find(q => q.id === questionId)
                        if (!question) return null

                        return (
                          <TableRow key={questionId}>
                            <TableCell>
                              <div className="font-medium text-sm">
                                {truncarTexto(question.text, 80)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.type === 'single_choice' ? 'bg-blue-100 text-blue-800' :
                                question.type === 'multiple_choice' ? 'bg-purple-100 text-purple-800' :
                                  question.type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                {question.type === 'single_choice' ? 'Única' :
                                  question.type === 'multiple_choice' ? 'Múltipla' :
                                    question.type === 'true_false' ? 'V/F' : 'Dissertativa'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-600">{question.points}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={getQuestionPoints(questionId, question.points)}
                                onChange={(e) => handleQuestionPointsChange(questionId, parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectQuestion(questionId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {selectedQuestions.length > 0 && (
              <div className="space-y-4">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedQuestions.length}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{questionStats.single_choice}</div>
                    <div className="text-xs text-green-700">Escolha Única</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{questionStats.multiple_choice}</div>
                    <div className="text-xs text-purple-700">Múltipla Escolha</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{questionStats.true_false}</div>
                    <div className="text-xs text-yellow-700">V/F</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{questionStats.essay}</div>
                    <div className="text-xs text-orange-700">Dissertativa</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">
                    Total de Pontos: {totalPoints.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banco de Questões */}
        <Card>
          <CardHeader>
            <CardTitle>Banco de Questões</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar questões..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={questionFilters.type} onValueChange={(value) =>
                  setQuestionFilters(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="single_choice">Escolha Única</SelectItem>
                    <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="true_false">V/F</SelectItem>
                    <SelectItem value="essay">Dissertativa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={questionFilters.difficulty} onValueChange={(value) =>
                  setQuestionFilters(prev => ({ ...prev, difficulty: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas dificuldades</SelectItem>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de questões */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  {questionSearch ? "Nenhuma questão encontrada com os filtros aplicados" : "Nenhuma questão disponível"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/teacher/questions/new-question')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Questão
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredQuestions.length > 0 && filteredQuestions.every(q => selectedQuestions.includes(q.id))}
                          onCheckedChange={handleSelectAllQuestions}
                        />
                      </TableHead>
                      <TableHead>Questão</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dificuldade</TableHead>
                      <TableHead>Pontos Padrão</TableHead>
                      <TableHead>Pontos na Prova</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question: Question) => (
                      <TableRow
                        key={question.id}
                        className={selectedQuestions.includes(question.id) ? "bg-blue-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleSelectQuestion(question.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {truncarTexto(question.text, 100)}
                          </div>
                          {question.category && (
                            <div className="text-sm text-gray-500">
                              Categoria: {question.category}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.type === 'single_choice' ? 'bg-blue-100 text-blue-800' :
                            question.type === 'multiple_choice' ? 'bg-purple-100 text-purple-800' :
                              question.type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                            }`}>
                            {question.type === 'single_choice' ? 'Única' :
                              question.type === 'multiple_choice' ? 'Múltipla' :
                                question.type === 'true_false' ? 'V/F' : 'Dissertativa'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {question.difficulty === 'easy' ? 'Fácil' :
                              question.difficulty === 'hard' ? 'Difícil' : 'Médio'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{question.points}</span>
                        </TableCell>
                        <TableCell>
                          {selectedQuestions.includes(question.id) ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={getQuestionPoints(question.id, question.points)}
                              onChange={(e) => handleQuestionPointsChange(question.id, parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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