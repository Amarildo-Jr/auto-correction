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
import { CheckCircle, Clock, Eye, Plus, Settings, UserCheck, Users, UserX, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Class {
  id: number
  name: string
  description: string
  instructor_id: number
  schedule: string
  is_active: boolean
  created_at: string
  student_count: number
  pending_requests: number
}

interface EnrollmentRequest {
  id: number
  student_id: number
  student_name: string
  student_email: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
}

export default function TeacherClassesPage() {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()

  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRequestsDialog, setShowRequestsDialog] = useState(false)
  const [error, setError] = useState('')

  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    schedule: '',
    is_active: true
  })

  // Carregar turmas
  useEffect(() => {
    loadClasses()
  }, [])

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/login')
    return null
  }

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await api.get('/api/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setClasses(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err)
      setError(err.response?.data?.error || 'Erro ao carregar turmas')
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar solicitações de matrícula
  const loadEnrollmentRequests = async (classId: number) => {
    try {
      setIsLoadingRequests(true)

      const response = await api.get(`/api/classes/${classId}/enrollment-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setEnrollmentRequests(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar solicitações:', err)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  // Criar nova turma
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError('')

      const response = await api.post('/api/classes', newClass, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setClasses(prev => [...prev, response.data])
      setNewClass({ name: '', description: '', schedule: '', is_active: true })
      setShowCreateDialog(false)
    } catch (err: any) {
      console.error('Erro ao criar turma:', err)
      setError(err.response?.data?.error || 'Erro ao criar turma')
    }
  }

  // Aprovar solicitação
  const handleApproveRequest = async (classId: number, enrollmentId: number) => {
    try {
      await api.post(`/api/classes/${classId}/approve-enrollment/${enrollmentId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      // Recarregar solicitações
      loadEnrollmentRequests(classId)
      // Recarregar turmas para atualizar contadores
      loadClasses()
    } catch (err: any) {
      console.error('Erro ao aprovar matrícula:', err)
    }
  }

  // Rejeitar solicitação
  const handleRejectRequest = async (classId: number, enrollmentId: number) => {
    try {
      await api.post(`/api/classes/${classId}/reject-enrollment/${enrollmentId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      // Recarregar solicitações
      loadEnrollmentRequests(classId)
      // Recarregar turmas para atualizar contadores
      loadClasses()
    } catch (err: any) {
      console.error('Erro ao rejeitar matrícula:', err)
    }
  }

  // Aprovar todas as solicitações
  const handleApproveAll = async (classId: number) => {
    try {
      await api.post(`/api/classes/${classId}/approve-all-enrollments`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      // Recarregar solicitações
      loadEnrollmentRequests(classId)
      // Recarregar turmas para atualizar contadores
      loadClasses()
    } catch (err: any) {
      console.error('Erro ao aprovar todas as matrículas:', err)
    }
  }

  const handleViewRequests = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowRequestsDialog(true)
    loadEnrollmentRequests(classItem.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)
  const totalPendingRequests = classes.reduce((sum, cls) => sum + (cls.pending_requests || 0), 0)
  const activeClasses = classes.filter(cls => cls.is_active).length

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Minhas Turmas</h1>
            <p className="text-muted-foreground">Gerencie suas turmas e matrículas</p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Turma</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Turma</label>
                  <Input
                    value={newClass.name}
                    onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Programação I - Turma A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <Textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da disciplina..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Horário</label>
                  <Input
                    value={newClass.schedule}
                    onChange={(e) => setNewClass(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="Ex: Ter/Qui 14:00-16:00"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Turma
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Turmas Ativas</p>
                  <p className="text-2xl font-bold">{activeClasses}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solicitações Pendentes</p>
                  <p className="text-2xl font-bold">{totalPendingRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Turmas</p>
                  <p className="text-2xl font-bold">{classes.length}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Turmas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Turmas</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Você ainda não tem turmas criadas</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Turma</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Solicitações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {classItem.description || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{classItem.schedule || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{classItem.student_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(classItem.pending_requests || 0) > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200"
                          onClick={() => handleViewRequests(classItem)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {classItem.pending_requests}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">Nenhuma</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={classItem.is_active ? "default" : "secondary"}>
                        {classItem.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {formatDate(classItem.created_at)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/teacher/classes/${classItem.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequests(classItem)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Matrículas
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Solicitações de Matrícula */}
      <Dialog open={showRequestsDialog} onOpenChange={setShowRequestsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Solicitações de Matrícula - {selectedClass?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingRequests ? (
              <LoadingSpinner />
            ) : enrollmentRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma solicitação de matrícula</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {enrollmentRequests.filter(req => req.status === 'pending').length} solicitações pendentes
                  </p>
                  {enrollmentRequests.some(req => req.status === 'pending') && (
                    <Button
                      onClick={() => selectedClass && handleApproveAll(selectedClass.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar Todas
                    </Button>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data da Solicitação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-medium">{request.student_name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">{request.student_email}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(request.requested_at)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' :
                                  'secondary'
                            }
                            className={
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''
                            }
                          >
                            {request.status === 'pending' ? 'Pendente' :
                              request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => selectedClass && handleApproveRequest(selectedClass.id, request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => selectedClass && handleRejectRequest(selectedClass.id, request.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 