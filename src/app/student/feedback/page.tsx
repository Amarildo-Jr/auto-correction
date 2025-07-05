'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import api from '@/services/api'
import { CheckCircle, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function StudentFeedbackPage() {
  const [loading, setLoading] = useState(false)
  const [hasEvaluation, setHasEvaluation] = useState(false)
  const [evaluationDate, setEvaluationDate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    design_rating: 3,
    colors_rating: 3,
    layout_rating: 3,
    responsiveness_rating: 3,
    navigation_rating: 3,
    menus_rating: 3,
    loading_speed_rating: 3,
    instructions_rating: 3,
    registration_rating: 3,
    login_rating: 3,
    class_enrollment_rating: 3,
    exam_taking_rating: 3,
    results_rating: 3,
    registration_ease: 'regular',
    registration_problems: '',
    login_intuitive: true,
    login_comments: '',
    class_finding_easy: true,
    class_finding_comments: '',
    class_process_clear: true,
    class_process_comments: '',
    exam_instructions_clear: true,
    exam_instructions_comments: '',
    timer_visible: true,
    timer_comments: '',
    question_navigation_easy: true,
    question_navigation_comments: '',
    answer_area_adequate: true,
    answer_area_comments: '',
    exam_finish_difficulty: false,
    exam_finish_comments: '',
    results_clear: true,
    results_comments: '',
    essay_feedback_useful: true,
    essay_feedback_comments: '',
    technical_errors: false,
    technical_errors_description: '',
    functionality_issues: false,
    functionality_issues_description: '',
    confusion_moments: false,
    confusion_description: '',
    missing_features: false,
    missing_features_description: '',
    platform_changes: '',
    desired_features: '',
    ux_suggestions: '',
    recommendation: 'probably_yes',
    general_impression: 'good',
    additional_comments: '',
    device_type: 'desktop',
    browser: 'chrome',
    operating_system: 'windows'
  })

  // Detectar informações do sistema
  useEffect(() => {
    const detectSystemInfo = () => {
      const userAgent = navigator.userAgent

      // Detectar sistema operacional
      let os = 'windows'
      if (userAgent.indexOf('Mac') !== -1) os = 'macos'
      else if (userAgent.indexOf('Linux') !== -1) os = 'linux'
      else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'ios'
      else if (userAgent.indexOf('Android') !== -1) os = 'android'

      // Detectar navegador
      let browser = 'chrome'
      if (userAgent.indexOf('Firefox') !== -1) browser = 'firefox'
      else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'safari'
      else if (userAgent.indexOf('Edge') !== -1) browser = 'edge'

      // Detectar tipo de dispositivo
      let device = 'desktop'
      if (window.innerWidth <= 768) device = 'smartphone'
      else if (window.innerWidth <= 1024) device = 'tablet'

      setFormData(prev => ({
        ...prev,
        operating_system: os,
        browser: browser,
        device_type: device
      }))
    }

    detectSystemInfo()
  }, [])

  // Verificar se usuário já fez avaliação
  useEffect(() => {
    const checkEvaluation = async () => {
      try {
        const response = await api.get('/api/platform-evaluation/check')
        if (response.data.has_evaluation) {
          setHasEvaluation(true)
          setEvaluationDate(response.data.created_at)
        }
      } catch (error) {
        console.error('Erro ao verificar avaliação:', error)
      }
    }

    checkEvaluation()
  }, [])

  const handleRatingChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/api/platform-evaluation', formData)
      alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.')
      setHasEvaluation(true)
      setEvaluationDate(new Date().toISOString())
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error)
      alert(error.response?.data?.error || 'Erro ao enviar avaliação')
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
      <div className="text-sm text-gray-500">
        {value === 1 && 'Muito Ruim'}
        {value === 2 && 'Ruim'}
        {value === 3 && 'Regular'}
        {value === 4 && 'Bom'}
        {value === 5 && 'Excelente'}
      </div>
    </div>
  )

  if (hasEvaluation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Avaliação já realizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Você já realizou a avaliação da plataforma em {evaluationDate ? new Date(evaluationDate).toLocaleDateString('pt-BR') : 'data não disponível'}.
            </p>
            <p className="text-sm text-gray-500">
              Obrigado pelo seu feedback! Ele é muito importante para melhorarmos a plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Avalie a Plataforma
            </CardTitle>
            <p className="text-gray-600">
              Sua opinião é muito importante para melhorarmos a experiência de todos os usuários.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Avaliações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interface e Design</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StarRating
                    value={formData.design_rating}
                    onChange={(value) => handleRatingChange('design_rating', value)}
                    label="Design geral da plataforma"
                  />
                  <StarRating
                    value={formData.colors_rating}
                    onChange={(value) => handleRatingChange('colors_rating', value)}
                    label="Cores e tipografia"
                  />
                  <StarRating
                    value={formData.layout_rating}
                    onChange={(value) => handleRatingChange('layout_rating', value)}
                    label="Layout e organização"
                  />
                  <StarRating
                    value={formData.responsiveness_rating}
                    onChange={(value) => handleRatingChange('responsiveness_rating', value)}
                    label="Responsividade (mobile/desktop)"
                  />
                </CardContent>
              </Card>

              {/* Navegação e Usabilidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navegação e Usabilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StarRating
                    value={formData.navigation_rating}
                    onChange={(value) => handleRatingChange('navigation_rating', value)}
                    label="Facilidade de navegação"
                  />
                  <StarRating
                    value={formData.menus_rating}
                    onChange={(value) => handleRatingChange('menus_rating', value)}
                    label="Intuitividade dos menus"
                  />
                  <StarRating
                    value={formData.loading_speed_rating}
                    onChange={(value) => handleRatingChange('loading_speed_rating', value)}
                    label="Velocidade de carregamento"
                  />
                  <StarRating
                    value={formData.instructions_rating}
                    onChange={(value) => handleRatingChange('instructions_rating', value)}
                    label="Clareza das instruções"
                  />
                </CardContent>
              </Card>

              {/* Funcionalidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Funcionalidades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StarRating
                    value={formData.registration_rating}
                    onChange={(value) => handleRatingChange('registration_rating', value)}
                    label="Processo de cadastro"
                  />
                  <StarRating
                    value={formData.login_rating}
                    onChange={(value) => handleRatingChange('login_rating', value)}
                    label="Processo de login"
                  />
                  <StarRating
                    value={formData.class_enrollment_rating}
                    onChange={(value) => handleRatingChange('class_enrollment_rating', value)}
                    label="Inscrição em turmas"
                  />
                  <StarRating
                    value={formData.exam_taking_rating}
                    onChange={(value) => handleRatingChange('exam_taking_rating', value)}
                    label="Realização de provas"
                  />
                  <StarRating
                    value={formData.results_rating}
                    onChange={(value) => handleRatingChange('results_rating', value)}
                    label="Visualização de resultados"
                  />
                </CardContent>
              </Card>

              {/* Experiência Específica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experiência Específica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Cadastro */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Cadastro e Login</h4>

                    <div>
                      <Label>O processo de cadastro foi:</Label>
                      <Select value={formData.registration_ease} onValueChange={(value) => handleInputChange('registration_ease', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_easy">Muito fácil</SelectItem>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="difficult">Difícil</SelectItem>
                          <SelectItem value="very_difficult">Muito difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Algum problema durante o cadastro?</Label>
                      <Textarea
                        value={formData.registration_problems}
                        onChange={(e) => handleInputChange('registration_problems', e.target.value)}
                        placeholder="Descreva qualquer problema encontrado..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="login_intuitive"
                        checked={formData.login_intuitive}
                        onCheckedChange={(checked) => handleInputChange('login_intuitive', checked)}
                      />
                      <Label htmlFor="login_intuitive">O login foi intuitivo</Label>
                    </div>

                    <div>
                      <Label>Comentários sobre o login:</Label>
                      <Textarea
                        value={formData.login_comments}
                        onChange={(e) => handleInputChange('login_comments', e.target.value)}
                        placeholder="Comentários adicionais sobre o processo de login..."
                      />
                    </div>
                  </div>

                  {/* Navegação na turma */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Navegação na Turma</h4>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="class_finding_easy"
                        checked={formData.class_finding_easy}
                        onCheckedChange={(checked) => handleInputChange('class_finding_easy', checked)}
                      />
                      <Label htmlFor="class_finding_easy">Foi fácil encontrar como ingressar em uma turma</Label>
                    </div>

                    <div>
                      <Label>Comentários sobre encontrar turmas:</Label>
                      <Textarea
                        value={formData.class_finding_comments}
                        onChange={(e) => handleInputChange('class_finding_comments', e.target.value)}
                        placeholder="Comentários sobre a facilidade de encontrar e ingressar em turmas..."
                      />
                    </div>
                  </div>

                  {/* Realização da prova */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Realização da Prova</h4>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exam_instructions_clear"
                        checked={formData.exam_instructions_clear}
                        onCheckedChange={(checked) => handleInputChange('exam_instructions_clear', checked)}
                      />
                      <Label htmlFor="exam_instructions_clear">As instruções da prova foram claras</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timer_visible"
                        checked={formData.timer_visible}
                        onCheckedChange={(checked) => handleInputChange('timer_visible', checked)}
                      />
                      <Label htmlFor="timer_visible">O timer estava visível e útil</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="question_navigation_easy"
                        checked={formData.question_navigation_easy}
                        onCheckedChange={(checked) => handleInputChange('question_navigation_easy', checked)}
                      />
                      <Label htmlFor="question_navigation_easy">Foi fácil navegar entre as questões</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="answer_area_adequate"
                        checked={formData.answer_area_adequate}
                        onCheckedChange={(checked) => handleInputChange('answer_area_adequate', checked)}
                      />
                      <Label htmlFor="answer_area_adequate">A área de resposta foi adequada</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problemas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Problemas Encontrados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="technical_errors"
                      checked={formData.technical_errors}
                      onCheckedChange={(checked) => handleInputChange('technical_errors', checked)}
                    />
                    <Label htmlFor="technical_errors">Encontrei erros técnicos</Label>
                  </div>

                  {formData.technical_errors && (
                    <div>
                      <Label>Descreva os erros técnicos:</Label>
                      <Textarea
                        value={formData.technical_errors_description}
                        onChange={(e) => handleInputChange('technical_errors_description', e.target.value)}
                        placeholder="Descreva os erros técnicos encontrados..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Avaliação Final */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avaliação Final</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Você recomendaria esta plataforma para outros estudantes?</Label>
                    <RadioGroup
                      value={formData.recommendation}
                      onValueChange={(value) => handleInputChange('recommendation', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="definitely_yes" id="rec_def_yes" />
                        <Label htmlFor="rec_def_yes">Definitivamente sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="probably_yes" id="rec_prob_yes" />
                        <Label htmlFor="rec_prob_yes">Provavelmente sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="rec_maybe" />
                        <Label htmlFor="rec_maybe">Talvez</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="probably_no" id="rec_prob_no" />
                        <Label htmlFor="rec_prob_no">Provavelmente não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="definitely_no" id="rec_def_no" />
                        <Label htmlFor="rec_def_no">Definitivamente não</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Qual sua impressão geral da plataforma?</Label>
                    <RadioGroup
                      value={formData.general_impression}
                      onValueChange={(value) => handleInputChange('general_impression', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="excellent" id="imp_excellent" />
                        <Label htmlFor="imp_excellent">Excelente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="good" id="imp_good" />
                        <Label htmlFor="imp_good">Boa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="imp_regular" />
                        <Label htmlFor="imp_regular">Regular</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bad" id="imp_bad" />
                        <Label htmlFor="imp_bad">Ruim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very_bad" id="imp_very_bad" />
                        <Label htmlFor="imp_very_bad">Muito ruim</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Comentários adicionais:</Label>
                    <Textarea
                      value={formData.additional_comments}
                      onChange={(e) => handleInputChange('additional_comments', e.target.value)}
                      placeholder="Qualquer comentário adicional que gostaria de compartilhar..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Envio */}
              <div className="flex justify-center">
                <Button type="submit" disabled={loading} className="w-full max-w-md">
                  {loading ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 