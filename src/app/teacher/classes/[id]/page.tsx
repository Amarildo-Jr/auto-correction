'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAppContext } from '@/contexts/AppContext'
import api from '@/services/api'
import { ArrowLeft, Calendar, Edit, FileText, Plus, Users, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Class {
  id: number
  name: string
  description: string
  instructor_id: number
  instructor_name: string
  schedule: string
  is_active: boolean
  created_at: string
  student_count: number
  pending_requests: number
}

interface Student {
  id: number
  name: string
  email: string
  enrollment_status: 'approved' | 'pending' | 'rejected'
  enrolled_at: string
}

interface Exam {
  id: number
  title: string
  description: string
  duration_minutes: number
  start_time: string
  end_time: string
  status: 'draft' | 'published' | 'finished'
  questions_count: number
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [classData, setClassData] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    schedule: '',
    is_active: true
  })

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    loadClassData()
    loadStudents()
    loadExams()
  }, [params.id])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  const loadClassData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/api/classes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setClassData(response.data)
      setEditForm({
        name: response.data.name,
        description: response.data.description,
        schedule: response.data.schedule,
        is_active: response.data.is_active
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar turma')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await api.get(`/api/classes/${params.id}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setStudents(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar estudantes:', err)
    }
  }

  const loadExams = async () => {
    try {
      const response = await api.get(`/api/classes/${params.id}/exams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setExams(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar provas:', err)
    }
  }

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await api.put(`/api/classes/${params.id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setShowEditDialog(false)
      loadClassData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar turma')
    }
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await api.post('/api/exams', {
        ...newExam,
        class_id: parseInt(params.id),
        start_time: new Date(newExam.start_time).toISOString(),
        end_time: new Date(newExam.end_time).toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setShowCreateExamDialog(false)
      setNewExam({
        title: '',
        description: '',
        duration_minutes: 60,
        start_time: '',
        end_time: ''
      })
      loadExams()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar prova')
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('Tem certeza que deseja remover este estudante da turma?')) return

    try {
      await api.delete(`/api/classes/${params.id}/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      loadStudents()
      loadClassData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao remover estudante')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-blue-100 text-blue-800',
      'finished': 'bg-green-100 text-green-800'
    }

    const labels = {
      'approved': 'Satisfatório',
      'pending': 'Pendente',
      'rejected': 'Rejeitado',
      'draft': 'Rascunho',
      'published': 'Publicada',
      'finished': 'Finalizada'
    }

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Turma não encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/teacher/classes')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Turmas
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">{classData.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {classData.schedule}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {classData.student_count} estudantes
              </div>
              {getStatusBadge(classData.is_active ? 'approved' : 'rejected')}
            </div>
          </div>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Editar Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Turma</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Turma</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horário</label>
                  <Input
                    value={editForm.schedule}
                    onChange={(e) => setEditForm(prev => ({ ...prev, schedule: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <label htmlFor="is_active" className="text-sm">Turma ativa</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estudantes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Estudantes ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum estudante matriculado</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Matriculado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{getStatusBadge(student.enrollment_status)}</TableCell>
                        <TableCell>{formatDate(student.enrolled_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(student.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Provas */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Provas ({exams.length})
                </CardTitle>
                <Dialog open={showCreateExamDialog} onOpenChange={setShowCreateExamDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Prova</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Título</label>
                        <Input
                          value={newExam.title}
                          onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Prova 1 - Algoritmos"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Descrição</label>
                        <Textarea
                          value={newExam.description}
                          onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                        <Input
                          type="number"
                          min="1"
                          value={newExam.duration_minutes}
                          onChange={(e) => setNewExam(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Início</label>
                        <Input
                          type="datetime-local"
                          value={newExam.start_time}
                          onChange={(e) => setNewExam(prev => ({ ...prev, start_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Fim</label>
                        <Input
                          type="datetime-local"
                          value={newExam.end_time}
                          onChange={(e) => setNewExam(prev => ({ ...prev, end_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateExamDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Criar Prova
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma prova criada</p>
              ) : (
                <div className="space-y-3">
                  {exams.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{exam.title}</h4>
                        {getStatusBadge(exam.status)}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{exam.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{exam.duration_minutes}min</span>
                        <span>{exam.questions_count || 0} questões</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teacher/exams/${exam.id}`)}
                          className="text-xs"
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teacher/exams/${exam.id}/edit`)}
                          className="text-xs"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 