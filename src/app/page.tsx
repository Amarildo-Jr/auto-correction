'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { BookOpen, Brain, FileText, Monitor, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirecionamento baseado no papel do usuário
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'professor':
        case 'teacher':
          router.push('/teacher/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        default:
          router.push('/login');
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AutoCorrection</h1>
            </div>
            <Link href="/login">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema Inteligente de
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
              Avaliação Online
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Plataforma completa para criação, aplicação e correção automática de avaliações acadêmicas,
            desenvolvida como Trabalho de Conclusão de Curso para revolucionar o processo avaliativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg">
                Acessar Plataforma
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-gray-300">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Recursos Avançados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnologia de ponta para uma experiência de avaliação completa e segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Correção Inteligente</CardTitle>
                <CardDescription>
                  Sistema de correção automática com IA para questões objetivas e subjetivas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Banco de Questões</CardTitle>
                <CardDescription>
                  Repositório inteligente para organização e reutilização de questões
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Monitoramento</CardTitle>
                <CardDescription>
                  Supervisão em tempo real com detecção de comportamentos suspeitos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Gestão de Turmas</CardTitle>
                <CardDescription>
                  Sistema completo para gerenciamento de alunos e professores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Segurança Avançada</CardTitle>
                <CardDescription>
                  Proteção contra fraudes com múltiplas camadas de segurança
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Analytics completos sobre desempenho e estatísticas de uso
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* TCC Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Trabalho de Conclusão de Curso</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Este sistema foi desenvolvido como parte do Trabalho de Conclusão de Curso em Ciência da Computação,
            com foco na modernização e automatização do processo avaliativo acadêmico através de tecnologias inovadoras.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="opacity-90">Correção Automática</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">∞</div>
              <div className="opacity-90">Escalabilidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">AutoCorrection</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema Inteligente de Avaliação Online - TCC 2024
            </p>
            <p className="text-sm text-gray-500">
              Desenvolvido para revolucionar o processo educacional através da tecnologia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}