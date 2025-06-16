'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Exam, examService } from '@/services/api';
import { useEffect, useState } from 'react';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAll();
        setExams(data);
      } catch (error) {
        console.error('Erro ao carregar provas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Provas Disponíveis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{exam.title}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{exam.description}</p>
              <p className="mt-2">Duração: {exam.duration} minutos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 