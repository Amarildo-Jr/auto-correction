'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService, examService, testService } from '@/services/api';
import { useState } from 'react';

export default function TestApiPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

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

    // Teste 2: Login
    await testEndpoint('login', () =>
      authService.login({ email: 'admin@admin.com', password: 'admin123' })
    );

    // Teste 3: Listar provas (após login)
    await testEndpoint('exams', examService.getAll);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Teste da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={runTests}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Executar Testes'}
            </Button>

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