'use client';

import { questionService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  text: string; // alias para question_text
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'; // alias para question_type
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
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
      
      // Garantir que data é um array válido
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        console.warn('API retornou dados inválidos para questões:', data);
        setQuestions([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar questões:', err);
      setError(err.response?.data?.message || 'Erro ao carregar questões');
      setQuestions([]); // Garantir que questions seja sempre um array
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const createQuestion = useCallback(async (questionData: any) => {
    try {
      const newQuestion = await questionService.create(questionData);
      if (newQuestion) {
        setQuestions(prev => Array.isArray(prev) ? [...prev, newQuestion] : [newQuestion]);
        return newQuestion;
      }
    } catch (err: any) {
      console.error('Erro ao criar questão:', err);
      setError(err.response?.data?.message || 'Erro ao criar questão');
      throw err;
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, questionData: any) => {
    try {
      const updatedQuestion = await questionService.update(id, questionData);
      if (updatedQuestion) {
        setQuestions(prev => 
          Array.isArray(prev) 
            ? prev.map(question => question.id === parseInt(id) ? updatedQuestion : question)
            : [updatedQuestion]
        );
        return updatedQuestion;
      }
    } catch (err: any) {
      console.error('Erro ao atualizar questão:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar questão');
      throw err;
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      await questionService.delete(id);
      setQuestions(prev => 
        Array.isArray(prev) 
          ? prev.filter(question => question.id !== parseInt(id))
          : []
      );
    } catch (err: any) {
      console.error('Erro ao deletar questão:', err);
      setError(err.response?.data?.message || 'Erro ao deletar questão');
      throw err;
    }
  }, []);

  const addQuestionsToExam = useCallback(async (examId: string, questionIds: number[]) => {
    try {
      // Implementar lógica para adicionar questões a uma prova
      // Por enquanto, apenas retornamos sucesso
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao adicionar questões à prova:', err);
      setError(err.response?.data?.message || 'Erro ao adicionar questões à prova');
      throw err;
    }
  }, []);

  return {
    questions: Array.isArray(questions) ? questions : [], // Garantir que sempre seja um array
    isLoading,
    error,
    refetch: fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    addQuestionsToExam,
  };
};