import { Card } from '@/components/ui/card'
import {
  BarChart,
  BookOpen,
  FileText,
  Users
} from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Turmas Ativas',
      value: '45',
      icon: BookOpen,
      color: 'text-green-500'
    },
    {
      title: 'Provas Aplicadas',
      value: '156',
      icon: FileText,
      color: 'text-yellow-500'
    },
    {
      title: 'Desempenho Satisfatório',
      value: '78%',
      icon: BarChart,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Atividades Recentes</h2>
          {/* Adicionar lista de atividades recentes aqui */}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Alertas do Sistema</h2>
          {/* Adicionar lista de alertas aqui */}
        </Card>
      </div>
    </div>
  )
} 