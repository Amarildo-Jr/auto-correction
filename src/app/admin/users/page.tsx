import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Filter,
  MoreVertical,
  Plus,
  Search
} from 'lucide-react'

export default function AdminUsers() {
  const users = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@ufpi.edu.br',
      role: 'Professor',
      status: 'ativo'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@ufpi.edu.br',
      role: 'Aluno',
      status: 'ativo'
    },
    {
      id: 3,
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@ufpi.edu.br',
      role: 'Professor',
      status: 'inativo'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtrar
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nome</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Função</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${user.status === 'ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 