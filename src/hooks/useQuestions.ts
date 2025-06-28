'use client';

import { questionService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  options?: string[];
  correct_answer?: string;
  created_at: string;
  updated_at: string;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getAll();
      setQuestions(data);
    } catch (err: any) {
      console.error('Erro ao buscar questões:', err);
      setError(err.response?.data?.message || 'Erro ao carregar questões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
};