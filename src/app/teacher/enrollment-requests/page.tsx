"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClasses, useEnrollmentRequests } from "@/hooks/useClasses"
import { CheckCircle, Clock, Users, X, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function EnrollmentRequestsPage() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const { classes, isLoading: classesLoading } = useClasses()
  const {
    requests,
    isLoading: requestsLoading,
    error,
    approveRequest,
    approveAllRequests,
    rejectRequest
  } = useEnrollmentRequests(selectedClassId || 0)

  // Automaticamente selecionar a primeira turma se houver
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id)
    }
  }, [classes, selectedClassId])

  const handleApprove = async (enrollmentId: number, studentName: string) => {
    try {
      await approveRequest(enrollmentId)
      alert(`Solicitação de ${studentName} aprovada com sucesso!`)
    } catch (error: any) {
      alert(`Erro ao aprovar solicitação: ${error.message}`)
    }
  }

  const handleReject = async (enrollmentId: number, studentName: string) => {
    if (confirm(`Tem certeza que deseja rejeitar a solicitação de ${studentName}?`)) {
      try {
        await rejectRequest(enrollmentId)
        alert(`Solicitação de ${studentName} rejeitada.`)
      } catch (error: any) {
        alert(`Erro ao rejeitar solicitação: ${error.message}`)
      }
    }
  }

  const handleApproveAll = async () => {
    if (requests.length === 0) return

    if (confirm(`Tem certeza que deseja aprovar todas as ${requests.length} solicitações pendentes?`)) {
      try {
        const result = await approveAllRequests()
        alert(result.message)
      } catch (error: any) {
        alert(`Erro ao aprovar todas as solicitações: ${error.message}`)
      }
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

  const selectedClass = classes.find(cls => cls.id === selectedClassId)

  if (classesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Solicitações de Participação</h1>
        <p className="text-gray-600">Gerencie as solicitações de participação em suas turmas</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Você não possui turmas cadastradas</p>
              <p className="text-sm text-gray-400">Crie uma turma primeiro para receber solicitações</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Seletor de Turma */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Turma</CardTitle>
              <CardDescription>
                Escolha a turma para visualizar as solicitações de participação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClassId?.toString()}
                onValueChange={(value) => setSelectedClassId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} {cls.description && `- ${cls.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Informações da Turma Selecionada */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedClass.name}
                </CardTitle>
                <CardDescription>{selectedClass.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {selectedClass.schedule || 'Horário não definido'}
                      </span>
                    </div>
                  </div>

                  {requests.length > 0 && (
                    <Button
                      onClick={handleApproveAll}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar Todas ({requests.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Solicitações */}
          {selectedClassId && (
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
                <CardDescription>
                  {requestsLoading ? 'Carregando...' : `${requests.length} solicitação(ões) pendente(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                    <p className="text-red-600 mb-4">Erro ao carregar solicitações: {error}</p>
                    <Button onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                    <p className="text-gray-500 mb-2">Nenhuma solicitação pendente</p>
                    <p className="text-sm text-gray-400">
                      Todas as solicitações foram processadas ou não há novas solicitações
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estudante</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data da Solicitação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.student_name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {request.student_email}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(request.enrolled_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(request.id, request.student_name)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id, request.student_name)}
                                  className="flex items-center gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  Rejeitar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 