'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppContext } from '@/contexts/AppContext'
import api from '@/services/api'
import { ArrowLeft, CheckCircle, Edit, Save, Trash2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Alternative {
  id?: number
  alternative_text: string
  is_correct: boolean
  order_number: number
}

interface Question {
  id: number
  question_text: string
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay'
  points: number
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  is_public?: boolean
  created_by?: number
  created_at?: string
  alternatives: Alternative[]
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [editForm, setEditForm] = useState({
    question_text: '',
    question_type: 'single_choice' as Question['question_type'],
    points: 1,
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    is_public: true,
    alternatives: [] as Alternative[]
  })

  useEffect(() => {
    loadQuestion()
  }, [params.id])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  const loadQuestion = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/api/questions/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setQuestion(response.data)
      setEditForm({
        question_text: response.data.question_text,
        question_type: response.data.question_type,
        points: response.data.points,
        category: response.data.category || '',
        difficulty: response.data.difficulty || 'medium',
        is_public: response.data.is_public ?? true,
        alternatives: response.data.alternatives || []
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar questão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')

      await api.put(`/api/questions/${params.id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setIsEditing(false)
      loadQuestion()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar questão')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await api.delete(`/api/questions/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      router.push('/teacher/questions')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir questão')
    }
  }

  const addAlternative = () => {
    setEditForm(prev => ({
      ...prev,
      alternatives: [
        ...prev.alternatives,
        {
          alternative_text: '',
          is_correct: false,
          order_number: prev.alternatives.length + 1
        }
      ]
    }))
  }

  const removeAlternative = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index)
    }))
  }

  const updateAlternative = (index: number, field: keyof Alternative, value: any) => {
    setEditForm(prev => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) =>
        i === index ? { ...alt, [field]: value } : alt
      )
    }))
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

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'hard': 'bg-red-100 text-red-800'
    }

    const labels = {
      'easy': 'Fácil',
      'medium': 'Médio',
      'hard': 'Difícil'
    }

    return (
      <Badge className={variants[difficulty as keyof typeof variants]}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Questão não encontrada</p>
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
          onClick={() => router.push('/teacher/questions')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Questões
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Questão' : 'Visualizar Questão'}
            </h1>
            <p className="text-muted-foreground">
              {getQuestionTypeLabel(question.question_type)} • {question.points} pontos
            </p>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      question_text: question.question_text,
                      question_type: question.question_type,
                      points: question.points,
                      category: question.category || '',
                      difficulty: question.difficulty || 'medium',
                      is_public: question.is_public ?? true,
                      alternatives: question.alternatives || []
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Informações da Questão */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Questão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Enunciado</Label>
                  <p className="mt-1 text-gray-900">{question.question_text}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                    <p className="mt-1">{getQuestionTypeLabel(question.question_type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Pontos</Label>
                    <p className="mt-1">{question.points}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                    <p className="mt-1">{question.category || 'Não definida'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dificuldade</Label>
                    <div className="mt-1">{getDifficultyBadge(question.difficulty || 'medium')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Visibilidade</Label>
                    <div className="mt-1">
                      <Badge className={question.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {question.is_public ? 'Pública' : 'Privada'}
                      </Badge>
                    </div>
                  </div>
                  {question.created_at && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Criada em</Label>
                      <p className="mt-1 text-sm">
                        {new Date(question.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="question_text">Enunciado da Questão</Label>
                  <Textarea
                    id="question_text"
                    value={editForm.question_text}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question_text: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="question_type">Tipo</Label>
                    <select
                      id="question_type"
                      value={editForm.question_type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, question_type: e.target.value as Question['question_type'] }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="single_choice">Escolha Única</option>
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="true_false">Verdadeiro/Falso</option>
                      <option value="essay">Dissertativa</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="points">Pontos</Label>
                    <Input
                      id="points"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={editForm.points}
                      onChange={(e) => setEditForm(prev => ({ ...prev, points: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: Algoritmos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <select
                      id="difficulty"
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={editForm.is_public}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))}
                  />
                  <Label htmlFor="is_public">Questão pública (visível para outros professores)</Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alternativas */}
        {question.question_type !== 'essay' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Alternativas
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAlternative}
                  >
                    Adicionar Alternativa
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-3">
                  {question.alternatives.map((alternative, index) => (
                    <div
                      key={alternative.id || index}
                      className={`p-3 rounded-lg border ${alternative.is_correct
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {alternative.is_correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{alternative.alternative_text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {editForm.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <span className="font-medium min-w-[20px]">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        value={alternative.alternative_text}
                        onChange={(e) => updateAlternative(index, 'alternative_text', e.target.value)}
                        placeholder="Texto da alternativa"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type={editForm.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                          name={editForm.question_type === 'multiple_choice' ? undefined : 'correct_answer'}
                          checked={alternative.is_correct}
                          onChange={(e) => {
                            if (editForm.question_type === 'multiple_choice') {
                              updateAlternative(index, 'is_correct', e.target.checked)
                            } else {
                              // Para single_choice e true_false, apenas uma pode estar correta
                              setEditForm(prev => ({
                                ...prev,
                                alternatives: prev.alternatives.map((alt, i) => ({
                                  ...alt,
                                  is_correct: i === index
                                }))
                              }))
                            }
                          }}
                        />
                        <Label className="text-sm">Correta</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlternative(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 