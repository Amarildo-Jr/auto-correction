'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { BarChart3, CheckCircle, Clock, FileText, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FinishExamPage() {
  const { user, isAuthenticated } = useAppContext()
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  // Verificar autorização
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/login')
    }
  }, [isAuthenticated, user?.role, router])

  // Countdown para redirecionamento automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/student/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-800 mb-2">
              Prova Finalizada com Sucesso!
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Sua prova foi enviada e será corrigida em breve.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-3">O que acontece agora?</h3>
              <div className="space-y-3 text-sm text-green-700">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Sua prova foi salva automaticamente e enviada para correção</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>O resultado estará disponível em até 48 horas</p>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Você receberá uma notificação quando a nota estiver pronta</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Clock className="w-5 h-5" />
                <p className="font-medium">
                  Redirecionando automaticamente em {countdown} segundos...
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push('/student/results')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Ver Meus Resultados
              </Button>

              <Button
                onClick={() => router.push('/student/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir para Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>
                Se você encontrou algum problema durante a prova, entre em contato com o suporte através da página de ajuda.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
