'use client';

import { examService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Exam {
  id: number;
  title: string;
  description?: string;
  duration: number;
  total_points: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  professor_id: number;
  class_id: number | undefined;
  created_at: string;
  updated_at: string;
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await examService.getAll();
      setExams(data);
    } catch (err: any) {
      console.error('Erro ao buscar provas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar provas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return {
    exams,
    isLoading,
    error,
    refetch: fetchExams,
  };
};

export const useStudentExams = () => {
  return useExams(); // Por enquanto usa o mesmo endpoint
}; 