'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/AppContext';
import { userService } from '@/services/api';
import { Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAppContext();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'professor' | 'student'>('student');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'professor':
          router.push('/teacher/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success && result.user) {
        // Redirecionar baseado no tipo de usuário
        switch (result.user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'professor':
            router.push('/teacher/dashboard');
            break;
          case 'student':
            router.push('/student/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (registerPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const result = await userService.create({
        name,
        email: registerEmail,
        password: registerPassword,
        role: userRole
      });

      if (result) {
        // Após criar a conta, fazer login automaticamente
        const loginResult = await login(registerEmail, registerPassword);
        if (loginResult.success && loginResult.user) {
          switch (loginResult.user.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'professor':
              router.push('/teacher/dashboard');
              break;
            case 'student':
              router.push('/student/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        } else {
          setError('Conta criada com sucesso! Faça login para continuar.');
          setActiveTab('login');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sistema de Provas Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Credenciais de teste */}
                <div className="text-xs text-gray-500 bg-gray-100 p-4 rounded space-y-3">
                  <strong>Credenciais de teste:</strong>

                  {/* Admin */}
                  <div className="space-y-1">
                    <p className="font-medium">Administrador:</p>
                    <div className="flex items-center gap-2">
                      <span>admin@admin.com</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('admin@admin.com', 'admin-email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>admin123</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('admin123', 'admin-password')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Professor */}
                  <div className="space-y-1">
                    <p className="font-medium">Professor:</p>
                    <div className="flex items-center gap-2">
                      <span>prof1@exemplo.com</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('prof1@exemplo.com', 'prof-email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>123456</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('123456', 'prof-password')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Aluno */}
                  <div className="space-y-1">
                    <p className="font-medium">Aluno:</p>
                    <div className="flex items-center gap-2">
                      <span>aluno1@exemplo.com</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('aluno1@exemplo.com', 'student-email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>123456</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('123456', 'student-password')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Senha (mín. 6 caracteres)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'admin' | 'professor' | 'student')}
                  >
                    <option value="student">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 