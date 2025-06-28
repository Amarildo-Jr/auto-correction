"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question, useQuestions } from "@/hooks/useQuestions";
import { ArrowLeft, BookOpen, Eye, FilePen, Filter, ListOrdered, Plus, Search, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Hook para buscar provas
const useExams = () => {
  return { exams: [], isLoading: false };
};

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    difficulty: "all",
    sortBy: "mais_nova"
  });
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isAddToExamDialogOpen, setIsAddToExamDialogOpen] = useState(false);

  const router = useRouter();
  const { questions, isLoading, error, deleteQuestion, addQuestionsToExam } = useQuestions();
  const { exams } = useExams();

  const filteredQuestions = (questions || []).filter((question: Question) => {
    // Verificações de segurança
    if (!question || typeof question !== 'object') return false;

    const questionText = question.text || question.question_text || '';
    const questionType = question.type || question.question_type || '';
    const questionCategory = question.category || '';
    const questionDifficulty = question.difficulty || '';

    const textMatch = questionText.toLowerCase().includes(search.toLowerCase());
    const typeMatch = filters.type === "all" ||
      (filters.type === "objetiva" && questionType === "multiple_choice") ||
      (filters.type === "subjetiva" && questionType === "essay");
    const categoryMatch = filters.category === "all" || questionCategory.toLowerCase().includes(filters.category.toLowerCase());
    const difficultyMatch = filters.difficulty === "all" || questionDifficulty === filters.difficulty;

    return textMatch && typeMatch && categoryMatch && difficultyMatch;
  });

  // Ordenar questões com verificações de segurança
  const sortedQuestions = [...(filteredQuestions || [])].sort((a, b) => {
    if (!a || !b) return 0;

    switch (filters.sortBy) {
      case "mais_nova":
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      case "mais_antiga":
        const dateA2 = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB2 = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA2 - dateB2;
      case "objetiva":
        const typeA = a.type || a.question_type || '';
        return typeA === "multiple_choice" ? -1 : 1;
      case "subjetiva":
        const typeA2 = a.type || a.question_type || '';
        return typeA2 === "essay" ? -1 : 1;
      default:
        return 0;
    }
  });

  const truncarTexto = (texto: string, tamanhoMaximo: number) => {
    if (!texto || typeof texto !== 'string') return '';
    if (texto.length > tamanhoMaximo) {
      return texto.substring(0, tamanhoMaximo) + "...";
    }
    return texto;
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta questão?")) {
      try {
        await deleteQuestion(id.toString());
      } catch (error: any) {
        alert("Erro ao excluir questão: " + error.message);
      }
    }
  };

  const handleSelectQuestion = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === sortedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(sortedQuestions.map(q => q.id));
    }
  };

  const handleAddToExam = async () => {
    if (!selectedExamId || selectedQuestions.length === 0) {
      alert("Selecione uma prova e pelo menos uma questão");
      return;
    }

    try {
      const result = await addQuestionsToExam(selectedExamId, selectedQuestions);
      alert(result.success ? "Questões adicionadas com sucesso" : "Erro ao adicionar questões");
      setSelectedQuestions([]);
      setSelectedExamId("");
      setIsAddToExamDialogOpen(false);
    } catch (error: any) {
      alert("Erro ao adicionar questões à prova: " + error.message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro ao carregar questões: {error}</p>
              <Button onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Banco de Questões</h1>
            <p className="text-muted-foreground">
              Gerencie suas questões e adicione-as às provas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/teacher/exams/create')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Prova
            </Button>
            <Link href="/teacher/questions/new-question">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Questão
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Questões</p>
                <p className="text-2xl font-bold">{(questions || []).length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objetivas</p>
                <p className="text-2xl font-bold">
                  {(questions || []).filter(q => q && q.type === "multiple_choice").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">MC</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjetivas</p>
                <p className="text-2xl font-bold">
                  {(questions || []).filter(q => q && q.type === "essay").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">ES</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selecionadas</p>
                <p className="text-2xl font-bold">{selectedQuestions.length}</p>
              </div>
              <Checkbox className="h-6 w-6" checked={selectedQuestions.length > 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar questões..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Tipo: {filters.type === "all" ? "Todas" :
                      filters.type === "objetiva" ? "Objetiva" : "Subjetiva"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="objetiva">Objetiva</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="subjetiva">Subjetiva</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListOrdered className="h-4 w-4 mr-2" />
                    Ordenar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <DropdownMenuRadioItem value="mais_nova">Mais nova</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mais_antiga">Mais antiga</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="objetiva">Objetiva</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="subjetiva">Subjetiva</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Ação de adicionar à prova */}
            {selectedQuestions.length > 0 && (
              <Dialog open={isAddToExamDialogOpen} onOpenChange={setIsAddToExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar à Prova ({selectedQuestions.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Questões à Prova</DialogTitle>
                    <DialogDescription>
                      Selecione a prova onde deseja adicionar as {selectedQuestions.length} questões selecionadas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma prova" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.length > 0 ? exams.map((exam: any) => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.title}
                          </SelectItem>
                        )) : (
                          <SelectItem value="none" disabled>
                            Nenhuma prova disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddToExamDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddToExam}>
                      Adicionar Questões
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <Card>
        <CardHeader>
          <CardTitle>
            Questões ({sortedQuestions.length}
            {search && ` de ${(questions || []).length}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedQuestions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  {search ? "Nenhuma questão encontrada com esse filtro" : "Nenhuma questão encontrada"}
                </p>
                <Link href="/teacher/questions/new-question">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira questão
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedQuestions.length === sortedQuestions.length && sortedQuestions.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Questão</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedQuestions.map((question: Question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleSelectQuestion(question.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {truncarTexto(question.text || question.question_text || '', 80)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.type === 'multiple_choice'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {question.type === 'multiple_choice' ? 'Objetiva' : 'Subjetiva'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {question.category || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(question.difficulty || 'medium') === 'easy' ? 'bg-green-100 text-green-800' :
                          (question.difficulty || 'medium') === 'hard' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {(question.difficulty || 'medium') === 'easy' ? 'Fácil' :
                            (question.difficulty || 'medium') === 'hard' ? 'Difícil' : 'Médio'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{question.points || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {question.created_at ? new Date(question.created_at).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/teacher/questions/${question.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/teacher/questions/${question.id}/edit`)}
                            className="h-8 w-8 p-0"
                          >
                            <FilePen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
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
    </div>
  );
}
