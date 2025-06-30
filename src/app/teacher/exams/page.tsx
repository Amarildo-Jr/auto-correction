'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAppContext } from "@/contexts/AppContext"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  PlayCircle,
  Plus,
  Search,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function TeacherExamsPage() {
  const { user, isAuthenticated } = useAppContext()
  const { exams, isLoading: examsLoading } = useExams()
  const { classes, isLoading: classesLoading } = useClasses()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [filteredExams, setFilteredExams] = useState<any[]>([])

  // Verificar autorização
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
      router.push('/login')
    }
  }, [isAuthenticated, user?.role, router])

  useEffect(() => {
    let filtered = exams

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedClass) {
      filtered = filtered.filter(exam => exam.class_id?.toString() === selectedClass)
    }

    if (selectedStatus) {
      filtered = filtered.filter(exam => exam.status === selectedStatus)
    }

    setFilteredExams(filtered)
  }, [exams, searchTerm, selectedClass, selectedStatus])

  if (examsLoading || classesLoading) {
    return <LoadingSpinner />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'finished': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicada'
      case 'draft': return 'Rascunho'
      case 'finished': return 'Finalizada'
      default: return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <PlayCircle className="w-4 h-4" />
      case 'draft': return <Clock className="w-4 h-4" />
      case 'finished': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const calculateStats = () => {
    const total = filteredExams.length
    const published = filteredExams.filter(e => e.status === 'published').length
    const draft = filteredExams.filter(e => e.status === 'draft').length
    const finished = filteredExams.filter(e => e.status === 'finished').length
    const totalClasses = new Set(filteredExams.map(e => e.class_id)).size

    return { total, published, draft, finished, totalClasses }
  }

  const stats = calculateStats()

  const handleViewExam = (examId: number) => {
    router.push(`/teacher/exams/${examId}`)
  }

  const handleEditExam = (examId: number) => {
    router.push(`/teacher/exams/${examId}/edit`)
  }

  const handleCreateExam = () => {
    router.push('/teacher/exams/create')
  }

  const handleViewResults = (examId: number) => {
    router.push(`/teacher/results?exam=${examId}`)
  }

  const handleDeleteExam = async (examId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta prova?')) {
      try {
        // TODO: Implementar deleteExam no hook useExams
        console.log('Excluir prova:', examId)
        alert('Funcionalidade de exclusão será implementada em breve.')
      } catch (error) {
        console.error('Erro ao excluir prova:', error)
        alert('Erro ao excluir prova. Tente novamente.')
      }
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas Provas</h1>
            <p className="text-muted-foreground">
              Gerencie suas provas e acompanhe o progresso dos alunos
            </p>
          </div>
          <Button onClick={handleCreateExam} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Prova
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publicadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.finished}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turmas</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalClasses}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por título ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Todas as turmas</option>
              {classes.map((classObj) => (
                <option key={classObj.id} value={classObj.id.toString()}>
                  {classObj.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunhos</option>
              <option value="published">Publicadas</option>
              <option value="finished">Finalizadas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Provas */}
      <div className="space-y-6">
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma prova encontrada</h3>
              <p className="text-gray-500 mb-4">
                {exams.length === 0
                  ? "Você ainda não criou nenhuma prova. Comece criando sua primeira prova!"
                  : "Nenhuma prova corresponde aos filtros aplicados."
                }
              </p>
              {exams.length === 0 && (
                <Button onClick={handleCreateExam}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Prova
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {classes.find(c => c.id === exam.class_id)?.name || 'Turma não definida'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(exam.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(exam.status)}`}>
                      {getStatusIcon(exam.status)}
                      {getStatusText(exam.status)}
                    </span>
                  </div>
                </div>

                {exam.description && (
                  <p className="text-gray-600 mb-4 text-sm">{exam.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">-</div>
                    <div className="text-xs text-blue-600">Total Alunos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">-</div>
                    <div className="text-xs text-green-600">Concluídas</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">-</div>
                    <div className="text-xs text-yellow-600">Em Andamento</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">-</div>
                    <div className="text-xs text-gray-600">Não Iniciadas</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewExam(exam.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </Button>

                  {(exam.status === 'draft' || exam.status === 'published' || exam.status === 'finished') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditExam(exam.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      {exam.status === 'finished' ? 'Reabrir' : 'Editar'}
                    </Button>
                  )}

                  {exam.status === 'finished' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResults(exam.id)}
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Resultados
                    </Button>
                  )}

                  {exam.status === 'draft' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                      className="flex items-center gap-1"
                    >
                      Excluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 