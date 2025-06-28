"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/contexts/AppContext"
import api from "@/services/api"
import { BookOpen, CheckCircle, Clock, Search, User, UserCheck, UserPlus, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Class {
  id: number
  name: string
  description: string
  instructor_name: string
  schedule: string
  is_active: boolean
  created_at: string
  enrollment_status?: 'approved' | 'pending' | 'rejected' | null
  enrolled_at?: string
}

export default function StudentClassesPage() {
  const { user, isAuthenticated } = useAppContext()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("enrolled")
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([])
  const [availableClasses, setAvailableClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (activeTab === "enrolled") {
      loadEnrolledClasses()
    } else {
      loadAvailableClasses()
    }
  }, [activeTab])

  const loadEnrolledClasses = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await api.get('/api/student/classes')
      setEnrolledClasses(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar turmas matriculadas:', err)
      setError(err.response?.data?.error || 'Erro ao carregar turmas')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableClasses = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await api.get('/api/student/available-classes')
      setAvailableClasses(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar turmas disponíveis:', err)
      setError(err.response?.data?.error || 'Erro ao carregar turmas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestEnrollment = async (classId: number, className: string) => {
    try {
      await api.post(`/api/classes/${classId}/request-enrollment`)

      alert(`Solicitação de participação enviada para a turma "${className}"`)
      loadAvailableClasses() // Atualizar lista
    } catch (error: any) {
      alert(`Erro: ${error.response?.data?.error || error.message}`)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
    }

    const labels = {
      'approved': 'Matriculado',
      'pending': 'Pendente',
      'rejected': 'Rejeitado'
    }

    const icons = {
      'approved': CheckCircle,
      'pending': Clock,
      'rejected': XCircle
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const canRequestEnrollment = (classItem: Class) => {
    return !classItem.enrollment_status || classItem.enrollment_status === 'rejected'
  }

  const currentClasses = activeTab === "enrolled" ? enrolledClasses : availableClasses

  const filteredClasses = currentClasses.filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase()) ||
    cls.description?.toLowerCase().includes(search.toLowerCase()) ||
    cls.instructor_name?.toLowerCase().includes(search.toLowerCase())
  )

  // Estatísticas
  const approvedClasses = enrolledClasses.filter(cls => cls.enrollment_status === 'approved').length
  const pendingRequests = enrolledClasses.filter(cls => cls.enrollment_status === 'pending').length

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin')) {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Minhas Turmas</h1>
        <p className="text-gray-600">Gerencie suas turmas e solicite participação em novas turmas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turmas Matriculadas</p>
                <p className="text-2xl font-bold text-green-600">{approvedClasses}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Interações</p>
                <p className="text-2xl font-bold">{enrolledClasses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled">
            Minhas Turmas ({enrolledClasses.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Turmas Disponíveis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar nas minhas turmas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={loadEnrolledClasses} variant="outline">
              Atualizar
            </Button>
          </div>

          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">
                    {search ? "Nenhuma turma encontrada com esse filtro" : "Você ainda não tem interações com turmas"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {!search && "Vá para a aba 'Turmas Disponíveis' para solicitar participação"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Turma</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.description || '-'}</TableCell>
                      <TableCell>{cls.instructor_name || '-'}</TableCell>
                      <TableCell>{cls.schedule || '-'}</TableCell>
                      <TableCell>
                        {cls.enrollment_status && getStatusBadge(cls.enrollment_status)}
                      </TableCell>
                      <TableCell>
                        {cls.enrolled_at
                          ? new Date(cls.enrolled_at).toLocaleDateString('pt-BR')
                          : new Date(cls.created_at).toLocaleDateString('pt-BR')
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar turmas disponíveis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={loadAvailableClasses} variant="outline">
              Atualizar
            </Button>
          </div>

          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Nenhuma turma disponível encontrada</p>
                  <p className="text-sm text-gray-400">
                    {search ? "Tente ajustar sua pesquisa" : "Não há turmas disponíveis no momento"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <CardDescription>{cls.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Professor: {cls.instructor_name}</span>
                      </div>
                      {cls.schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{cls.schedule}</span>
                        </div>
                      )}
                      {cls.enrollment_status && (
                        <div className="mt-2">
                          {getStatusBadge(cls.enrollment_status)}
                        </div>
                      )}
                    </div>

                    {canRequestEnrollment(cls) ? (
                      <Button
                        onClick={() => handleRequestEnrollment(cls.id, cls.name)}
                        className="w-full"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {cls.enrollment_status === 'rejected' ? 'Solicitar Novamente' : 'Solicitar Participação'}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full"
                        size="sm"
                        variant="outline"
                      >
                        {cls.enrollment_status === 'approved' ? 'Já Matriculado' :
                          cls.enrollment_status === 'pending' ? 'Solicitação Enviada' : 'Indisponível'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

