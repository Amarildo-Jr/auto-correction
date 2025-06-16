'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone
} from 'lucide-react'
import { useState } from 'react'

export default function StudentSupport() {
  const [activeTab, setActiveTab] = useState('contact')

  const supportTickets = [
    {
      id: 1,
      title: 'Problema com acesso à prova',
      description: 'Não consigo acessar a prova de matemática',
      status: 'Em andamento',
      priority: 'Alta',
      date: '2024-03-20',
      response: 'Nossa equipe está analisando o problema.'
    },
    {
      id: 2,
      title: 'Dúvida sobre resultado',
      description: 'Gostaria de entender melhor minha nota',
      status: 'Resolvido',
      priority: 'Média',
      date: '2024-03-18',
      response: 'Sua nota foi calculada corretamente. Detalhes enviados por email.'
    }
  ]

  const faqItems = [
    {
      question: 'Como faço para acessar uma prova?',
      answer: 'Para acessar uma prova, vá até a seção "Provas" no menu lateral e clique em "Iniciar" na prova desejada quando ela estiver disponível.'
    },
    {
      question: 'Posso refazer uma prova?',
      answer: 'Não é possível refazer uma prova após a submissão. Certifique-se de revisar suas respostas antes de finalizar.'
    },
    {
      question: 'Como visualizo meus resultados?',
      answer: 'Seus resultados ficam disponíveis na seção "Resultados" após a correção da prova pelo professor.'
    },
    {
      question: 'O que fazer se tiver problemas técnicos durante a prova?',
      answer: 'Entre em contato imediatamente com o suporte através do chat ou telefone. Documente o problema com prints se possível.'
    },
    {
      question: 'Como me inscrevo em uma nova turma?',
      answer: 'A inscrição em turmas é feita através da coordenação acadêmica. Entre em contato para mais informações.'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolvido':
        return 'bg-green-100 text-green-800'
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800'
      case 'Pendente':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800'
      case 'Média':
        return 'bg-yellow-100 text-yellow-800'
      case 'Baixa':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar! Entre em contato conosco ou consulte nossas perguntas frequentes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'contact'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Contato
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tickets'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Meus Tickets
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'faq'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          FAQ
        </button>
      </div>

      {/* Contato */}
      {activeTab === 'contact' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de contato */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Assunto</label>
                <Input placeholder="Descreva brevemente o problema" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridade</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Mensagem</label>
                <Textarea
                  placeholder="Descreva detalhadamente seu problema ou dúvida..."
                  rows={6}
                />
              </div>
              <Button className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>

          {/* Canais de contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Atendimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Chat Online</h3>
                    <p className="text-sm text-muted-foreground">
                      Disponível 24/7 para suporte imediato
                    </p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Iniciar Chat
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium">Telefone</h3>
                    <p className="text-sm text-muted-foreground">
                      (85) 3366-7890
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Seg-Sex: 8h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      suporte@ufpi.edu.br
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Resposta em até 24h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span className="font-medium">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span className="font-medium">8h às 12h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span className="text-muted-foreground">Fechado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Meus Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Meus Tickets de Suporte</h2>
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-muted-foreground mt-1">{ticket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(ticket.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span>#{ticket.id.toString().padStart(4, '0')}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>

                  {ticket.response && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Resposta do Suporte:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Perguntas Frequentes</h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">{item.question}</h3>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Não encontrou sua resposta?</h3>
                  <p className="text-muted-foreground mb-4">
                    Nossa equipe de suporte está sempre pronta para ajudar. Entre em contato conosco!
                  </p>
                  <Button onClick={() => setActiveTab('contact')}>
                    Entrar em Contato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 