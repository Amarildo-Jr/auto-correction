import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react'

export default function TeacherSupport() {
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
        <h2 className="text-lg font-semibold mb-4">Envie sua Dúvida</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <Input placeholder="Digite o assunto da sua dúvida" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <Textarea
              placeholder="Descreva sua dúvida em detalhes..."
              rows={4}
            />
          </div>
          <Button className="w-full">
            Enviar Mensagem
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">
              Como criar uma nova prova?
            </h3>
            <p className="text-sm text-gray-600">
              Para criar uma nova prova, acesse a seção &quot;Provas&quot; e clique no botão &quot;Nova Prova&quot;.
              Siga o assistente para configurar as questões e parâmetros da prova.
            </p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">
              Como visualizar os resultados dos alunos?
            </h3>
            <p className="text-sm text-gray-600">
              Na seção &quot;Resultados&quot;, você encontrará todas as provas aplicadas e poderá
              visualizar as notas individuais e estatísticas gerais.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              Como gerenciar minhas turmas?
            </h3>
            <p className="text-sm text-gray-600">
              Acesse a seção &quot;Turmas&quot; para visualizar, criar e gerenciar suas turmas.
              Você pode adicionar alunos, definir horários e acompanhar o progresso.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 