'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/AppContext';
import { authService } from '@/services/api';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAppContext();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'student' as 'student' | 'teacher'
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirecionar baseado no papel do usuário
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
          router.push('/');
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success && result.user) {
        // Redirecionamento direto baseado no role do usuário
        let redirectUrl = '/';
        switch (result.user.role) {
          case 'admin':
            redirectUrl = '/admin/dashboard';
            break;
          case 'professor':
          case 'teacher':
            redirectUrl = '/teacher/dashboard';
            break;
          case 'student':
            redirectUrl = '/student/dashboard';
            break;
          default:
            redirectUrl = '/';
            break;
        }

        console.log('Redirecionando para:', redirectUrl);
        router.push(redirectUrl);
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Erro no handleLogin:', err);
      setError('Erro de conexão. Tente novamente.');
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUserTypeChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, user_type: value as 'student' | 'teacher' }));
  };

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};

    if (!registerData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!registerData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateRegisterForm()) {
      return;
    }

    setIsRegistering(true);

    try {
      const { user } = await authService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        user_type: registerData.user_type
      });

      // Redirecionar baseado no tipo de usuário
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'professor') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao registrar usuário';
      setError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">ProvEx</h1>
          </div>
          <p className="text-gray-600">Sistema Inteligente de Provas</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Acesse sua conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Entrar
                  </Button>
                </form>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-600">
                    Esqueceu sua senha?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Seleção de tipo de usuário */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Tipo de usuário
                    </Label>
                    <RadioGroup
                      value={registerData.user_type}
                      onValueChange={handleUserTypeChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          Aluno
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher" className="flex items-center gap-2 cursor-pointer">
                          <Users className="h-4 w-4 text-green-600" />
                          Professor
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Input
                      name="name"
                      placeholder="Nome completo"
                      value={registerData.name}
                      onChange={handleRegisterInputChange}
                      required
                      className={`h-11 ${registerErrors.name ? 'border-red-500' : ''}`}
                    />
                    {registerErrors.name && (
                      <p className="text-sm text-red-600">{registerErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={registerData.email}
                      onChange={handleRegisterInputChange}
                      required
                      className={`h-11 ${registerErrors.email ? 'border-red-500' : ''}`}
                    />
                    {registerErrors.email && (
                      <p className="text-sm text-red-600">{registerErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      name="password"
                      type="password"
                      placeholder="Senha (mínimo 6 caracteres)"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      required
                      className={`h-11 ${registerErrors.password ? 'border-red-500' : ''}`}
                    />
                    {registerErrors.password && (
                      <p className="text-sm text-red-600">{registerErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirmar senha"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterInputChange}
                      required
                      className={`h-11 ${registerErrors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    {registerErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{registerErrors.confirmPassword}</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>

                <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-md">
                  Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => router.push('/')} className="text-gray-600">
            ← Voltar à página inicial
          </Button>
        </div>
      </div>
    </div>
  );
} 