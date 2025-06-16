import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="institution-name">Nome da Instituição</Label>
              <Input
                id="institution-name"
                defaultValue="Universidade Federal do Piauí"
              />
            </div>
            <div>
              <Label htmlFor="institution-email">Email da Instituição</Label>
              <Input
                id="institution-email"
                type="email"
                defaultValue="contato@ufpi.edu.br"
              />
            </div>
            <div>
              <Label htmlFor="institution-phone">Telefone da Instituição</Label>
              <Input
                id="institution-phone"
                defaultValue="(86) 3215-5555"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações do Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                <p className="text-sm text-gray-500">
                  Ative para realizar manutenções no sistema
                </p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registration-enabled">Registro de Novos Usuários</Label>
                <p className="text-sm text-gray-500">
                  Permite que novos usuários se registrem
                </p>
              </div>
              <Switch id="registration-enabled" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-enabled">Notificações por Email</Label>
                <p className="text-sm text-gray-500">
                  Envia notificações por email para os usuários
                </p>
              </div>
              <Switch id="notifications-enabled" defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações de Segurança</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-timeout">Tempo de Sessão (minutos)</Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="30"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor-auth">Autenticação em Dois Fatores</Label>
                <p className="text-sm text-gray-500">
                  Requer autenticação adicional para login
                </p>
              </div>
              <Switch id="two-factor-auth" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="password-expiration">Expiração de Senha</Label>
                <p className="text-sm text-gray-500">
                  Requer alteração periódica de senha
                </p>
              </div>
              <Switch id="password-expiration" defaultChecked />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button>Salvar Alterações</Button>
        </div>
      </div>
    </div>
  )
} 