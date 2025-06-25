'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useQuestions } from "@/hooks/useQuestions"
import { ArrowLeft, BookOpen, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewQuestionPage() {
  const router = useRouter()
  const { createQuestion } = useQuestions()

  const [formData, setFormData] = useState({
    text: '',
    type: '',
    category: '',
    difficulty: 'medium',
    points: 1.0,
    is_public: true,
    expected_answer: '',
    auto_correction_enabled: false,
    options: [''],
    correct_answers: [] as number[]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.text.trim()) {
        throw new Error('Texto da questão é obrigatório')
      }

      if (!formData.type) {
        throw new Error('Tipo da questão é obrigatório')
      }

      // Validações específicas por tipo
      if (formData.type === 'true_false') {
        if (formData.correct_answers.length === 0) {
          throw new Error('Selecione a resposta correta para questão Verdadeiro/Falso')
        }
      } else if (formData.type === 'single_choice') {
        if (formData.options.filter(opt => opt.trim()).length < 2) {
          throw new Error('Questões de escolha única precisam de pelo menos 2 alternativas')
        }
        if (formData.correct_answers.length !== 1) {
          throw new Error('Questões de escolha única devem ter exatamente 1 resposta correta')
        }
      } else if (formData.type === 'multiple_choice') {
        if (formData.options.filter(opt => opt.trim()).length < 2) {
          throw new Error('Questões de múltipla escolha precisam de pelo menos 2 alternativas')
        }
        if (formData.correct_answers.length === 0) {
          throw new Error('Questões de múltipla escolha devem ter pelo menos 1 resposta correta')
        }
      }

      const questionData = {
        question_text: formData.text,
        question_type: formData.type as 'single_choice' | 'multiple_choice' | 'true_false' | 'essay',
        category: formData.category || undefined,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        points: formData.points,
        is_public: formData.is_public,
        expected_answer: formData.type === 'essay' ? formData.expected_answer || undefined : undefined,
        auto_correction_enabled: formData.type === 'essay' ? formData.auto_correction_enabled : false,
        alternatives: formData.type !== 'essay'
          ? (formData.type === 'true_false'
            ? [
              { text: 'Verdadeiro', is_correct: formData.correct_answers.includes(0) },
              { text: 'Falso', is_correct: formData.correct_answers.includes(1) }
            ]
            : formData.options.filter(opt => opt.trim()).map((text, index) => ({
              text,
              is_correct: formData.correct_answers.includes(index)
            }))
          )
          : undefined
      }

      await createQuestion(questionData)
      router.push('/teacher/questions')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar questão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      const newCorrectAnswers = formData.correct_answers
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i)

      setFormData(prev => ({
        ...prev,
        options: newOptions,
        correct_answers: newCorrectAnswers
      }))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const handleCorrectAnswerToggle = (index: number) => {
    setFormData(prev => {
      let newCorrectAnswers = [...prev.correct_answers]

      if (prev.type === 'single_choice' || prev.type === 'true_false') {
        // Apenas uma resposta correta
        newCorrectAnswers = [index]
      } else {
        // Múltiplas respostas corretas
        if (newCorrectAnswers.includes(index)) {
          newCorrectAnswers = newCorrectAnswers.filter(i => i !== index)
        } else {
          newCorrectAnswers.push(index)
        }
      }

      return {
        ...prev,
        correct_answers: newCorrectAnswers
      }
    })
  }

  const resetOptionsForType = (type: string) => {
    if (type === 'true_false') {
      setFormData(prev => ({
        ...prev,
        type,
        options: ['Verdadeiro', 'Falso'],
        correct_answers: []
      }))
    } else if (type === 'essay') {
      setFormData(prev => ({
        ...prev,
        type,
        options: [''],
        correct_answers: []
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        type,
        options: ['', ''],
        correct_answers: []
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold mb-2">Nova Questão</h1>
        <p className="text-muted-foreground">
          Crie uma nova questão para o banco de questões
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Informações da Questão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text">Enunciado da Questão *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Digite o enunciado da questão..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo da Questão *</Label>
                <Select value={formData.type} onValueChange={resetOptionsForType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Escolha Única</SelectItem>
                    <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                    <SelectItem value="essay">Dissertativa</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.type === 'single_choice' && 'Apenas uma alternativa correta'}
                  {formData.type === 'multiple_choice' && 'Uma ou mais alternativas corretas'}
                  {formData.type === 'true_false' && 'Questão de verdadeiro ou falso'}
                  {formData.type === 'essay' && 'Resposta dissertativa'}
                </p>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty} onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Matemática, História..."
                />
              </div>

              <div>
                <Label htmlFor="points">Pontuação Padrão</Label>
                <Input
                  id="points"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseFloat(e.target.value) || 1.0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pode ser alterada ao adicionar à prova
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="is_public">Questão pública</Label>
              <p className="text-xs text-muted-foreground">
                {formData.is_public
                  ? 'Outros professores podem ver e usar esta questão'
                  : 'Apenas você pode ver e usar esta questão'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alternativas (para questões objetivas) */}
        {formData.type && formData.type !== 'essay' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {formData.type === 'true_false' ? 'Resposta Correta' : 'Alternativas'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.type === 'true_false' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.correct_answers.includes(0)}
                      onCheckedChange={() => handleCorrectAnswerToggle(0)}
                    />
                    <Label className="text-base">Verdadeiro</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.correct_answers.includes(1)}
                      onCheckedChange={() => handleCorrectAnswerToggle(1)}
                    />
                    <Label className="text-base">Falso</Label>
                  </div>
                </div>
              ) : (
                <>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="font-medium min-w-[30px]">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.correct_answers.includes(index)}
                          onCheckedChange={() => handleCorrectAnswerToggle(index)}
                        />
                        <Label className="text-sm">
                          {formData.type === 'single_choice' ? 'Correta' : 'Correta'}
                        </Label>
                      </div>
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  ))}

                  {formData.options.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddOption}
                      className="w-full"
                    >
                      Adicionar Alternativa
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resposta Esperada (para questões dissertativas) */}
        {formData.type === 'essay' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Correção - Questão Dissertativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expected_answer">Resposta Esperada (Gabarito)</Label>
                <Textarea
                  id="expected_answer"
                  value={formData.expected_answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_answer: e.target.value }))}
                  placeholder="Digite a resposta esperada ou critérios de avaliação..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Esta resposta será usada como referência para correção manual ou automática
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center space-x-2 mb-3">
                  <Switch
                    id="auto_correction"
                    checked={formData.auto_correction_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_correction_enabled: checked }))}
                  />
                  <Label htmlFor="auto_correction" className="font-medium">
                    Habilitar Correção Automática
                  </Label>
                </div>

                {formData.auto_correction_enabled && (
                  <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded border">
                    <p className="font-medium mb-2">💡 Como funciona a Correção Automática:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Usa inteligência artificial para comparar a resposta do aluno com o gabarito</li>
                      <li>Calcula uma pontuação baseada na similaridade semântica</li>
                      <li>A pontuação é proporcional à similaridade encontrada</li>
                      <li>Você ainda pode revisar e ajustar as correções manualmente</li>
                    </ul>
                  </div>
                )}

                {!formData.auto_correction_enabled && (
                  <p className="text-sm text-muted-foreground">
                    A correção será feita apenas manualmente. O gabarito servirá como referência para o professor.
                  </p>
                )}
              </div>

              {formData.auto_correction_enabled && !formData.expected_answer.trim() && (
                <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded border border-amber-200">
                  <p className="font-medium">⚠️ Atenção:</p>
                  <p>Para usar a correção automática, é necessário fornecer uma resposta esperada detalhada.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Questão
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
