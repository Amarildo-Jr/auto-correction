"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import { Exam } from "@/services/api"
import { Check, Eye, FilePen, Filter, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ExamsPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    class: "all",
    status: "all",
  })

  const router = useRouter()
  const { exams, isLoading: examsLoading, error } = useExams()
  const { classes, isLoading: classesLoading } = useClasses()

  const filteredExams = exams.filter((exam: Exam) => {
    const nameMatch = exam.title.toLowerCase().includes(search.toLowerCase())
    const classMatch = filters.class === "all" || exam.class_id?.toString() === filters.class
    const statusMatch = filters.status === "all" || exam.status === filters.status
    return nameMatch && classMatch && statusMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Publicada</Badge>
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Rascunho</Badge>
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Arquivada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const getClassName = (classId: number | undefined) => {
    if (!classId) return 'N/A'
    const classObj = classes.find(c => c.id === classId)
    return classObj ? classObj.name : 'N/A'
  }

  if (examsLoading || classesLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar provas: {error}</p>
          <Button onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Provas</h1>
        <Button
          onClick={() => router.push('/exams/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Prova
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar provas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 pr-4 py-2 text-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filtrar por Turma</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filters.class}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, class: value }))}
            >
              <DropdownMenuRadioItem value="all">Todas as turmas</DropdownMenuRadioItem>
              {classes.map((classItem) => (
                <DropdownMenuRadioItem key={classItem.id} value={classItem.id.toString()}>
                  {classItem.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <DropdownMenuRadioItem value="all">Todos os status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="draft">Rascunho</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="published">Publicada</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="archived">Arquivada</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredExams.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Nenhuma prova encontrada</p>
            <Button
              onClick={() => router.push('/exams/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar primeira prova
            </Button>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end pr-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.map((exam: Exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{exam.title}</p>
                    {exam.description && (
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {exam.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getClassName(exam.class_id)}</TableCell>
                <TableCell>{exam.duration_minutes} min</TableCell>
                <TableCell>{formatDate(exam.start_time)}</TableCell>
                <TableCell>{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/exams/${exam.id}/edit`)}
                    >
                      <FilePen className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/exams/${exam.id}/results`)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Resultados</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}