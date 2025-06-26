import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookOpen, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">ProvEx</h1>
          </div>
          <p className="text-gray-600 mb-6">Sistema Inteligente de Provas</p>
        </div>

        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Recuperar senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="pl-10"
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              Enviar instruções
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  )
} 