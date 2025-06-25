"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClasses } from "@/hooks/useClasses"
import { useExams } from "@/hooks/useExams"
import { useQuestions } from "@/hooks/useQuestions"
import {
  BookOpen,
  FileText,
  Plus,
  TrendingUp,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { exams, isLoading: examsLoading } = useExams()
  const { classes, isLoading: classesLoading } = useClasses()
  const { questions, isLoading: questionsLoading } = useQuestions()

  if (examsLoading || classesLoading || questionsLoading) {
    return <LoadingSpinner />
  }

  const publishedExams = exams.filter(e => e.status === 'published').length
  const draftExams = exams.filter(e => e.status === 'draft').length
  const totalStudents = classes.reduce((sum, c) => sum + ((c as any).student_count || 0), 0)

  const stats = [
    {
      title: "Total de Provas",
      value: exams.length,
      description: `${publishedExams} publicadas, ${draftExams} rascunhos`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Turmas Ativas",
      value: classes.length,
      description: `${totalStudents} estudantes matriculados`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Questões no Banco",
      value: questions.length,
      description: "Disponíveis para uso",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Taxa de Conclusão",
      value: "87%",
      description: "Média das últimas provas",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  const quickActions = [
    {
      title: "Nova Prova",
      description: "Criar uma nova avaliação",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => router.push("/exams/create")
    },
    {
      title: "Nova Turma",
      description: "Adicionar uma turma",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => router.push("/admin/classes")
    },
    {
      title: "Nova Questão",
      description: "Adicionar ao banco de questões",
      icon: BookOpen,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => router.push("/admin/questions/new-question")
    }
  ]

  const recentExams = exams.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema de provas</p>
        </div>
        <Button
          onClick={() => router.push("/exams/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Prova
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Operações mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-lg mr-4 ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Provas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Provas Recentes</CardTitle>
              <CardDescription>Últimas provas criadas</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/exams")}
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {recentExams.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma prova criada ainda</p>
                <Button onClick={() => router.push("/exams/create")}>
                  Criar primeira prova
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exam.start_time).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={exam.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {exam.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/exams/${exam.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Turmas Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Turmas</CardTitle>
            <CardDescription>Visão geral das turmas ativas</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/classes")}
          >
            Gerenciar turmas
          </Button>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma turma criada ainda</p>
              <Button onClick={() => router.push("/admin/classes")}>
                Criar primeira turma
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.slice(0, 6).map((cls) => (
                <div key={cls.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{cls.name}</h3>
                    <Badge variant="outline">{(cls as any).student_count || 0} alunos</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{cls.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/admin/classes`)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
