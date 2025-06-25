'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Question {
  id: number;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
  points: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_public?: boolean;
  alternatives?: Alternative[];
  created_at: string;
  updated_at: string;
  created_by: number;
  exam_id?: number;
  order_number?: number;
  // Campos de compatibilidade
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correct_answer?: string;
}

export interface Alternative {
  id: number;
  question_id: number;
  alternative_text: string;
  is_correct: boolean;
  order_number: number;
  // Campos de compatibilidade
  text: string;
}

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Função para normalizar dados da questão para compatibilidade
const normalizeQuestion = (question: any): Question => {
  return {
    ...question,
    text: question.question_text || question.text,
    type: question.question_type || question.type,
    options: question.alternatives?.map((alt: Alternative) => alt.alternative_text || alt.text),
    correct_answer: question.alternatives?.find((alt: Alternative) => alt.is_correct)?.alternative_text,
  };
};

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/questions');
      const normalizedQuestions = data.map(normalizeQuestion);
      setQuestions(normalizedQuestions);
    } catch (err: any) {
      console.error('Erro ao carregar questões:', err);
      setError(err.message || 'Erro ao carregar questões');
    } finally {
      setIsLoading(false);
    }
  };

  const createQuestion = async (questionData: {
    question_text: string;
    question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
    points?: number;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    is_public?: boolean;
    alternatives?: Array<{
      text: string;
      is_correct: boolean;
    }>;
  }) => {
    try {
      const data = await apiRequest('/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
      
      const normalizedQuestion = normalizeQuestion(data);
      setQuestions(prev => [...prev, normalizedQuestion]);
      return normalizedQuestion;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar questão');
    }
  };

  const updateQuestion = async (id: number, questionData: {
    question_text?: string;
    question_type?: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
    points?: number;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    is_public?: boolean;
    alternatives?: Array<{
      text: string;
      is_correct: boolean;
    }>;
  }) => {
    try {
      const data = await apiRequest(`/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(questionData),
      });
      
      const normalizedQuestion = normalizeQuestion(data);
      setQuestions(prev => prev.map(q => 
        q.id === id ? normalizedQuestion : q
      ));
      return normalizedQuestion;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar questão');
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      await apiRequest(`/questions/${id}`, {
        method: 'DELETE',
      });
      
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao excluir questão');
    }
  };

  const getQuestion = async (id: number): Promise<Question> => {
    try {
      const data = await apiRequest(`/questions/${id}`);
      return normalizeQuestion(data);
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao buscar questão');
    }
  };

  const addQuestionsToExam = async (examId: number, questionIds: number[]) => {
    try {
      const data = await apiRequest(`/exams/${examId}/add-questions`, {
        method: 'POST',
        body: JSON.stringify({ question_ids: questionIds }),
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao adicionar questões à prova');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion,
    addQuestionsToExam,
    refetch: fetchQuestions,
  };
};