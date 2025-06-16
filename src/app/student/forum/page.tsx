"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Plus, Search, ThumbsUp, User } from 'lucide-react'
import { useState } from 'react'

export default function StudentForum() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)

  const forumPosts = [
    {
      id: 1,
      title: 'Dúvida sobre a Prova de Matemática',
      content: 'Alguém pode me ajudar com questões de derivadas?',
      author: 'João Silva',
      class: 'Matemática Básica',
      replies: 5,
      likes: 12,
      date: '2024-03-20',
      isAnswered: true
    },
    {
      id: 2,
      title: 'Material de Estudo - Física I',
      content: 'Compartilhando alguns materiais que me ajudaram muito...',
      author: 'Maria Santos',
      class: 'Física I',
      replies: 8,
      likes: 20,
      date: '2024-03-19',
      isAnswered: false
    },
    {
      id: 3,
      title: 'Grupo de Estudos - Química',
      content: 'Estou organizando um grupo de estudos para a próxima prova.',
      author: 'Pedro Oliveira',
      class: 'Química Geral',
      replies: 15,
      likes: 25,
      date: '2024-03-18',
      isAnswered: false
    }
  ]

  const filteredPosts = forumPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.class.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fórum de Discussões</h1>
        <p className="text-muted-foreground">
          Tire dúvidas, compartilhe conhecimento e conecte-se com outros estudantes
        </p>
      </div>

      {/* Barra de busca e novo post */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Buscar discussões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowNewPost(!showNewPost)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Discussão
        </Button>
      </div>

      {/* Formulário para nova discussão */}
      {showNewPost && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nova Discussão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Título da discussão" />
            <select className="w-full rounded-md border border-input bg-background px-3 py-2">
              <option value="">Selecione uma turma</option>
              <option value="matematica">Matemática Básica</option>
              <option value="fisica">Física I</option>
              <option value="quimica">Química Geral</option>
            </select>
            <Textarea
              placeholder="Descreva sua dúvida ou compartilhe seu conhecimento..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button>Publicar</Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de discussões */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma discussão encontrada' : 'Nenhuma discussão ainda'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      {post.isAnswered && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Respondida
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{post.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <Badge variant="outline">{post.class}</Badge>
                    <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies} respostas</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Discussão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}