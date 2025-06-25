'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authService, examService, testService } from '@/services/api';
import { useState } from 'react';

export default function TestApiPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      setResults(prev => ({
        ...prev,
        [name]: { success: true, data: result }
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message, response: error.response?.data }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = async () => {
    setResults({});

    // Teste 1: Health check
    await testEndpoint('health', testService.healthCheck);

    // Teste 2: Login (apenas se credenciais fornecidas)
    if (email && password) {
      await testEndpoint('login', () =>
        authService.login({ email, password })
      );

      // Teste 3: Listar provas (após login)
      await testEndpoint('exams', examService.getAll);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Teste da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email:</label>
                <Input
                  type="email"
                  placeholder="Digite o email para teste"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha:</label>
                <Input
                  type="password"
                  placeholder="Digite a senha para teste"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={runTests}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Executar Testes'}
            </Button>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Nota:</strong> Esta página é apenas para testes de desenvolvimento.
              O teste de health check sempre será executado. Para testar login e outras funcionalidades,
              forneça credenciais válidas nos campos acima.
            </div>

            {Object.keys(results).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resultados:</h3>
                {Object.entries(results).map(([name, result]) => (
                  <Card key={name} className={`border ${result.success ? 'border-green-500' : 'border-red-500'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {name.toUpperCase()} - {result.success ? 'SUCESSO' : 'ERRO'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                        {JSON.stringify(result.success ? result.data : result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 