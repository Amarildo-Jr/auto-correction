'use client'

export const dynamic = 'force-dynamic'

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAppContext } from "@/contexts/AppContext"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import { useTeacherResults } from "@/hooks/useTeacherResults"
import {
  BarChart3,
  Calculator,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  TrendingUp
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function TeacherResultsPage() {
  const { user, isAuthenticated } = useAppContext()
  const { exams, isLoading: examsLoading } = useExams()
  const { classes, isLoading: classesLoading } = useClasses()
  const { results, isLoading: resultsLoading, fetchResults, recalculateResults } = useTeacherResults()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExam, setSelectedExam] = useState(searchParams.get('exam') || '')
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalculateMessage, setRecalculateMessage] = useState('')


  // Verificar autorização
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
      router.push('/login')
    }
  }, [isAuthenticated, user?.role, router])

  useEffect(() => {
    let filtered = results

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedExam) {
      filtered = filtered.filter(result => result.exam_id.toString() === selectedExam)
    }

    setFilteredResults(filtered)
  }, [searchTerm, selectedExam, results])

  if (examsLoading || classesLoading || resultsLoading) {
    return <LoadingSpinner />
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50'      // Excelente
    if (percentage >= 80) return 'text-blue-600 bg-blue-50'       // Muito Bom
    if (percentage >= 70) return 'text-cyan-600 bg-cyan-50'       // Bom
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50'   // Satisfatório
    if (percentage >= 40) return 'text-orange-600 bg-orange-50'   // Regular
    return 'text-red-600 bg-red-50'                               // Insuficiente
  }

  const getStatusBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800'    // Excelente
    if (percentage >= 80) return 'bg-blue-100 text-blue-800'     // Muito Bom
    if (percentage >= 70) return 'bg-cyan-100 text-cyan-800'     // Bom
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800' // Satisfatório
    if (percentage >= 40) return 'bg-orange-100 text-orange-800' // Regular
    return 'bg-red-100 text-red-800'                             // Insuficiente
  }

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return 'Excelente'
    if (percentage >= 80) return 'Muito Bom'
    if (percentage >= 70) return 'Bom'
    if (percentage >= 60) return 'Satisfatório'
    if (percentage >= 40) return 'Regular'
    return 'Insuficiente'
  }

  const calculateStats = () => {
    if (filteredResults.length === 0) return { average: 0, highest: 0, lowest: 0, satisfactoryRate: 0 }

    const scores = filteredResults.map(r => r.percentage)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const satisfactoryRate = (filteredResults.filter(r => r.percentage >= 60).length / filteredResults.length) * 100

    return { average, highest, lowest, satisfactoryRate }
  }

  const handleRecalculateExam = async (examId: number) => {
    const confirmed = confirm('Tem certeza que deseja recalcular as notas desta prova? Esta ação irá:\n\n• Manter correções manuais existentes\n• Recalcular totais e percentuais\n• Atualizar estatísticas')

    if (!confirmed) return

    try {
      setIsRecalculating(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/results/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          exam_id: examId,
          recorrect_essays: false // Não recorrigir dissertativas, só recalcular
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao recalcular')
      }

      const data = await response.json()

      // Recarregar resultados
      await fetchResults()

      alert(`Recálculo concluído! ${data.updated_count} resultados atualizados.`)
    } catch (error: any) {
      console.error('Erro ao recalcular:', error)
      alert(error.message || 'Erro ao recalcular resultados')
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleRecalculateStudent = async (studentId: number) => {
    setIsRecalculating(true)
    setRecalculateMessage('')

    const result = await recalculateResults(undefined, studentId)

    if (result.success) {
      setRecalculateMessage(`✅ ${result.message}`)
    } else {
      setRecalculateMessage(`❌ ${result.message}`)
    }

    setIsRecalculating(false)

    // Limpar mensagem após 5 segundos
    setTimeout(() => setRecalculateMessage(''), 5000)
  }



  const stats = calculateStats()

  return (
    <div className="py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resultados das Provas</h1>
        <p className="text-muted-foreground">
          Visualize e analise o desempenho dos alunos nas provas
        </p>
        {recalculateMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{recalculateMessage}</p>
          </div>
        )}
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{stats.average.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maior Nota</p>
                <p className="text-2xl font-bold text-green-600">{stats.highest.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menor Nota</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowest.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desempenho Satisfatório</p>
                <p className="text-2xl font-bold text-blue-600">{stats.satisfactoryRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
                placeholder="Buscar por aluno, prova ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Todas as provas</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id.toString()}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resultados Detalhados</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchResults()}
              disabled={isRecalculating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {selectedExam && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecalculateExam(parseInt(selectedExam))}
                  disabled={isRecalculating}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Calculator className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
                  Recalcular Prova
                </Button>

              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum resultado encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Aluno</th>
                    <th className="text-left p-4 font-medium">Prova</th>
                    <th className="text-left p-4 font-medium">Turma</th>
                    <th className="text-center p-4 font-medium">Nota</th>
                    <th className="text-center p-4 font-medium">Percentual</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Tempo</th>
                    <th className="text-center p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{result.student_name}</div>
                          <div className="text-sm text-muted-foreground">{result.student_email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{result.exam_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.finished_at ? new Date(result.finished_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{result.class_name}</td>
                      <td className="p-4 text-center font-medium">
                        {result.total_points.toFixed(1)}/{result.max_points.toFixed(1)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(result.percentage)}`}>
                          {result.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(result.percentage)}`}>
                          {getStatusText(result.percentage)}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm">
                        {result.time_taken ? `${result.time_taken} min` : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/teacher/results/${result.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecalculateStudent(result.student_id)}
                            disabled={isRecalculating}
                            title="Recalcular notas do aluno"
                          >
                            <Calculator className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
} 