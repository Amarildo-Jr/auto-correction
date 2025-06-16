import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react'

export default function AdminSupport() {
  const tickets = [
    {
      id: 1,
      title: 'Problema com login',
      user: 'João Silva',
      status: 'aberto',
      priority: 'alta',
      date: '2024-03-20'
    },
    {
      id: 2,
      title: 'Dúvida sobre provas',
      user: 'Maria Santos',
      status: 'em_andamento',
      priority: 'média',
      date: '2024-03-19'
    },
    {
      id: 3,
      title: 'Erro no sistema',
      user: 'Pedro Oliveira',
      status: 'fechado',
      priority: 'baixa',
      date: '2024-03-18'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Suporte</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Chat ao Vivo</h3>
              <p className="text-sm text-gray-500">Disponível 24/7</p>
            </div>
          </div>
          <Button className="w-full mt-4">
            Iniciar Chat
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Telefone</h3>
              <p className="text-sm text-gray-500">(86) 99999-9999</p>
            </div>
          </div>
          <Button className="w-full mt-4">
            Ligar Agora
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-gray-500">suporte@ufpi.edu.br</p>
            </div>
          </div>
          <Button className="w-full mt-4">
            Enviar Email
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Tickets de Suporte</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4">Usuário</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Prioridade</th>
                <th className="text-left p-4">Data</th>
                <th className="text-left p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b">
                  <td className="p-4">{ticket.title}</td>
                  <td className="p-4">{ticket.user}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${ticket.status === 'aberto'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ticket.status === 'em_andamento'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                      {ticket.status === 'aberto'
                        ? 'Aberto'
                        : ticket.status === 'em_andamento'
                          ? 'Em Andamento'
                          : 'Fechado'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${ticket.priority === 'alta'
                        ? 'bg-red-100 text-red-800'
                        : ticket.priority === 'média'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(ticket.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Enviar Mensagem de Suporte</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <Input placeholder="Digite o assunto da sua mensagem" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <Textarea
              placeholder="Descreva sua mensagem em detalhes..."
              rows={4}
            />
          </div>
          <Button className="w-full">
            Enviar Mensagem
          </Button>
        </form>
      </Card>
    </div>
  )
} 