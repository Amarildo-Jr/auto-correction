'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { useClasses } from '@/hooks/useClasses';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateExamPage() {
  const { user, isAuthenticated } = useAppContext();
  const { createExam } = useExams();
  const { classes, isLoading: classesLoading } = useClasses();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    class_id: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar autorização
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'professor')) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação básica
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!formData.class_id) {
      setError('Turma é obrigatória');
      setIsLoading(false);
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      setError('Datas de início e fim são obrigatórias');
      setIsLoading(false);
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError('A data de fim deve ser posterior à data de início');
      setIsLoading(false);
      return;
    }

    try {
      const examData = {
        ...formData,
        class_id: parseInt(formData.class_id)
      };

      const result = await createExam(examData);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Erro ao criar prova');
      }
    } catch (err: any) {
      console.error('Erro ao criar prova:', err);
      setError(err.response?.data?.error || err.message || 'Erro inesperado ao criar prova');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Criar Nova Prova</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Prova</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Prova *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Digite o título da prova"
                />
              </div>

              <div>
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Turma *
                </label>
                {classesLoading ? (
                  <div className="text-gray-500">Carregando turmas...</div>
                ) : (
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((classObj) => (
                      <option key={classObj.id} value={classObj.id}>
                        {classObj.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Digite uma descrição para a prova (opcional)"
                />
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos) *
                </label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Data/Hora de Início *
                  </label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Data/Hora de Fim *
                  </label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Criando...' : 'Criar Prova'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 