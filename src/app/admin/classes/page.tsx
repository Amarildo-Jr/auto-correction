'use client'

import { PageLoading } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/contexts/AppContext";
import { useClasses } from "@/hooks/useClasses";
import { cn } from "@/lib/utils";
import { Book, Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function ClassesPage() {
  const { user } = useAppContext();
  const { classes, isLoading, error, createClass, enrollInClass } = useClasses();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    active: "all",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    description: '',
    schedule: '',
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createClass(newClassData);
    if (result.success) {
      setShowCreateForm(false);
      setNewClassData({ name: '', description: '', schedule: '' });
    }
  };

  const handleEnroll = async (classId: number) => {
    const result = await enrollInClass(classId);
    if (!result.success) {
      alert(result.error);
    }
  };

  const filteredClasses = classes.filter((classObj) => {
    const classStatus = filters.active === "all" ||
      classObj.is_active === (filters.active === "Ativas") ||
      !classObj.is_active === (filters.active === "Inativas");
    return (
      (classObj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classObj.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      classStatus
    );
  });

  if (isLoading) {
    return <PageLoading message="Carregando turmas..." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="space-y-4 md:space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">Gerenciamento de Turmas</h1>
          <p className="text-muted-foreground md:text-lg">
            {user?.role === 'student'
              ? 'Aqui você pode visualizar suas turmas e se matricular em novas.'
              : 'Aqui você pode visualizar e gerenciar suas turmas.'
            }
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-background pl-8 pr-4 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            {(user?.role === 'admin' || user?.role === 'professor') && (
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Turma
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={filters.active}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, active: value }))}
                >
                  <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Ativas">Ativas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Inativas">Inativas</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Formulário de criação de turma */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Nova Turma</h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <Input
                    placeholder="Nome da turma"
                    value={newClassData.name}
                    onChange={(e) => setNewClassData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Descrição"
                    value={newClassData.description}
                    onChange={(e) => setNewClassData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Horário (ex: Segunda, 19h - 21h)"
                    value={newClassData.schedule}
                    onChange={(e) => setNewClassData(prev => ({ ...prev, schedule: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Criar Turma</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classObj) => (
            <Card key={classObj.id} className="flex h-48 transition-transform transform hover:scale-105 hover:opacity-90">
              <CardContent className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground rounded-md p-3">
                  <Book className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-lg font-medium">{classObj.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {classObj.description && <div>{classObj.description}</div>}
                    {classObj.schedule && <div>{classObj.schedule}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "", {
                      "bg-green-400": classObj.is_active,
                      "bg-gray-500": !classObj.is_active
                    })}>
                      {classObj.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                    {user?.role === 'student' && (
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(classObj.id)}
                        className="ml-auto"
                      >
                        Matricular
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {classes.length === 0
                ? 'Nenhuma turma encontrada.'
                : 'Nenhuma turma corresponde aos filtros aplicados.'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
