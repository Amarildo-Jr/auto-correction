'use client'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useResults } from "@/hooks/useResults"
import { BarChart3, Calendar, Eye, FileText, Search, TrendingUp, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StudentResults() {
  const router = useRouter()
  const { results, isLoading, error } = useResults()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar resultados</h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  // Filtrar resultados baseado na busca e turma selecionada
  const filteredResults = results.filter(result => {
    const matchesSearch = result.exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !selectedClass || result.exam.class_id?.toString() === selectedClass
    return matchesSearch && matchesClass
  })

  // Calcular estatísticas
  const averageGrade = filteredResults.length > 0
    ? filteredResults.reduce((sum, result) => sum + result.percentage, 0) / filteredResults.length
    : 0

  const highestGrade = filteredResults.length > 0
    ? Math.max(...filteredResults.map(result => result.percentage))
    : 0

  const goodPerformanceExams = filteredResults.filter(result => result.percentage >= 70).length

  // Obter lista única de turmas dos resultados
  const uniqueClasses = Array.from(
    new Map(
      results
        .filter(result => result.exam.class_id && result.exam.class_name)
        .map(result => [result.exam.class_id, { id: result.exam.class_id, name: result.exam.class_name }])
    ).values()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50'
    if (percentage >= 70) return 'text-blue-600 bg-blue-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getGradeStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excelente', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { label: 'Muito Bom', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 70) return { label: 'Bom', color: 'bg-cyan-100 text-cyan-800' }
    if (percentage >= 60) return { label: 'Satisfatório', color: 'bg-yellow-100 text-yellow-800' }
    if (percentage >= 40) return { label: 'Regular', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Insuficiente', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Resultados</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho acadêmico e evolução
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{averageGrade.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maior Nota</p>
                <p className="text-2xl font-bold">{highestGrade.toFixed(1)}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bom Desempenho</p>
                <p className="text-2xl font-bold">{goodPerformanceExams}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Provas</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Buscar provas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 min-w-[200px]"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Todas as turmas</option>
          {uniqueClasses.map((classItem) => (
            <option key={classItem.id} value={classItem.id?.toString()}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedClass ? 'Nenhum resultado encontrado' : 'Nenhum resultado disponível'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedClass
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não possui resultados de provas'
                }
              </p>
              {!searchTerm && !selectedClass && (
                <Button onClick={() => router.push('/student/exams')}>
                  Ver Provas Disponíveis
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prova</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const gradeStatus = getGradeStatus(result.percentage)
                  return (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <h3 className="font-medium">{result.exam.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Duração: {result.exam.duration_minutes} min
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {result.exam.class_name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {result.finished_at ? formatDate(result.finished_at) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(result.percentage)}`}>
                          {result.total_points.toFixed(1)}/{result.max_points.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.percentage.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={gradeStatus.color}>
                          {gradeStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/student/results/${result.exam_id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de evolução (placeholder) */}
      {filteredResults.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Gráfico de evolução será implementado em breve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 