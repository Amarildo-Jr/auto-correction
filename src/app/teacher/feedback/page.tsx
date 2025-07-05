'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/services/api'
import { CheckCircle, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TeacherFeedbackPage() {
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

      let os = 'windows'
      if (userAgent.indexOf('Mac') !== -1) os = 'macos'
      else if (userAgent.indexOf('Linux') !== -1) os = 'linux'
      else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'ios'
      else if (userAgent.indexOf('Android') !== -1) os = 'android'

      let browser = 'chrome'
      if (userAgent.indexOf('Firefox') !== -1) browser = 'firefox'
      else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'safari'
      else if (userAgent.indexOf('Edge') !== -1) browser = 'edge'

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
        const response = await api.get('/platform-evaluation/check')
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
      await api.post('/platform-evaluation', formData)
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
              Como professor, sua opinião é fundamental para melhorarmos as ferramentas educacionais.
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

              {/* Funcionalidades do Professor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Funcionalidades do Professor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StarRating
                    value={formData.navigation_rating}
                    onChange={(value) => handleRatingChange('navigation_rating', value)}
                    label="Criação e gerenciamento de provas"
                  />
                  <StarRating
                    value={formData.menus_rating}
                    onChange={(value) => handleRatingChange('menus_rating', value)}
                    label="Criação e gerenciamento de questões"
                  />
                  <StarRating
                    value={formData.loading_speed_rating}
                    onChange={(value) => handleRatingChange('loading_speed_rating', value)}
                    label="Sistema de correção automática"
                  />
                  <StarRating
                    value={formData.instructions_rating}
                    onChange={(value) => handleRatingChange('instructions_rating', value)}
                    label="Visualização e análise de resultados"
                  />
                  <StarRating
                    value={formData.registration_rating}
                    onChange={(value) => handleRatingChange('registration_rating', value)}
                    label="Gerenciamento de turmas"
                  />
                  <StarRating
                    value={formData.login_rating}
                    onChange={(value) => handleRatingChange('login_rating', value)}
                    label="Monitoramento de provas"
                  />
                </CardContent>
              </Card>

              {/* Experiência de Ensino */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experiência de Ensino</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="space-y-4">
                    <h4 className="font-medium">Criação de Conteúdo</h4>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exam_creation_easy"
                        checked={formData.class_finding_easy}
                        onCheckedChange={(checked) => handleInputChange('class_finding_easy', checked)}
                      />
                      <Label htmlFor="exam_creation_easy">É fácil criar e configurar provas</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="question_creation_easy"
                        checked={formData.class_process_clear}
                        onCheckedChange={(checked) => handleInputChange('class_process_clear', checked)}
                      />
                      <Label htmlFor="question_creation_easy">É fácil criar diferentes tipos de questões</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto_correction_effective"
                        checked={formData.exam_instructions_clear}
                        onCheckedChange={(checked) => handleInputChange('exam_instructions_clear', checked)}
                      />
                      <Label htmlFor="auto_correction_effective">A correção automática é eficaz</Label>
                    </div>

                    <div>
                      <Label>Comentários sobre as ferramentas de criação:</Label>
                      <Textarea
                        value={formData.class_finding_comments}
                        onChange={(e) => handleInputChange('class_finding_comments', e.target.value)}
                        placeholder="Suas impressões sobre criar provas e questões..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Acompanhamento e Análise</h4>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="results_comprehensive"
                        checked={formData.timer_visible}
                        onCheckedChange={(checked) => handleInputChange('timer_visible', checked)}
                      />
                      <Label htmlFor="results_comprehensive">Os relatórios de resultados são abrangentes</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="monitoring_helpful"
                        checked={formData.question_navigation_easy}
                        onCheckedChange={(checked) => handleInputChange('question_navigation_easy', checked)}
                      />
                      <Label htmlFor="monitoring_helpful">O monitoramento de provas é útil</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="correction_tools_effective"
                        checked={formData.answer_area_adequate}
                        onCheckedChange={(checked) => handleInputChange('answer_area_adequate', checked)}
                      />
                      <Label htmlFor="correction_tools_effective">As ferramentas de correção são eficazes</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problemas e Melhorias */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Problemas e Sugestões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="technical_errors"
                      checked={formData.technical_errors}
                      onCheckedChange={(checked) => handleInputChange('technical_errors', checked)}
                    />
                    <Label htmlFor="technical_errors">Encontrei problemas técnicos</Label>
                  </div>

                  {formData.technical_errors && (
                    <div>
                      <Label>Descreva os problemas técnicos:</Label>
                      <Textarea
                        value={formData.technical_errors_description}
                        onChange={(e) => handleInputChange('technical_errors_description', e.target.value)}
                        placeholder="Descreva os problemas técnicos encontrados..."
                      />
                    </div>
                  )}

                  <div>
                    <Label>Que funcionalidades você gostaria de ver adicionadas?</Label>
                    <Textarea
                      value={formData.desired_features}
                      onChange={(e) => handleInputChange('desired_features', e.target.value)}
                      placeholder="Sugestões de novas funcionalidades para professores..."
                    />
                  </div>

                  <div>
                    <Label>Como podemos melhorar a experiência de ensino?</Label>
                    <Textarea
                      value={formData.ux_suggestions}
                      onChange={(e) => handleInputChange('ux_suggestions', e.target.value)}
                      placeholder="Suas sugestões para melhorar a plataforma para professores..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Avaliação Final */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avaliação Final</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Você recomendaria esta plataforma para outros professores?</Label>
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
                      placeholder="Qualquer comentário adicional sobre a plataforma..."
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