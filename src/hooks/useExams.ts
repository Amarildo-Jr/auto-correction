import { Exam, examService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examService.getAll();
      setExams(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar provas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExam = useCallback(async (examData: {
    title: string;
    description: string;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    class_id: number;
    questions?: number[];
  }) => {
    try {
      const newExam = await examService.create(examData);
      setExams(prev => [...prev, newExam]);
      return { success: true, exam: newExam };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao criar prova' 
      };
    }
  }, []);

  const updateExam = useCallback(async (examId: number, examData: {
    title?: string;
    description?: string;
    duration_minutes?: number;
    start_time?: string;
    end_time?: string;
    class_id?: number;
    questions?: number[];
  }) => {
    try {
      const updatedExam = await examService.update(examId, examData);
      setExams(prev => prev.map(exam => 
        exam.id === examId ? updatedExam : exam
      ));
      return { success: true, exam: updatedExam };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao atualizar prova' 
      };
    }
  }, []);

  const getExam = useCallback(async (examId: number) => {
    try {
      const exam = await examService.getById(examId);
      return exam;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao buscar prova');
    }
  }, []);

  const startExam = useCallback(async (examId: number) => {
    try {
      const enrollment = await examService.start(examId);
      return { success: true, enrollment };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao iniciar prova' 
      };
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return {
    exams,
    isLoading,
    error,
    loadExams,
    createExam,
    updateExam,
    getExam,
    startExam,
  };
};

export const useExam = (examId: number) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExam = useCallback(async () => {
    if (!examId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await examService.getById(examId);
      setExam(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar prova');
    } finally {
      setIsLoading(false);
    }
  }, [examId]);

  const addQuestion = useCallback(async (questionData: {
    question_text: string;
    question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
    points: number;
    order_number: number;
    alternatives?: {
      text: string;
      is_correct: boolean;
      order_number: number;
    }[];
  }) => {
    try {
      const newQuestion = await examService.addQuestion(examId, questionData);
      await loadExam(); // Recarregar a prova para obter as questões atualizadas
      return { success: true, question: newQuestion };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao adicionar questão' 
      };
    }
  }, [examId, loadExam]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  return {
    exam,
    isLoading,
    error,
    loadExam,
    addQuestion,
  };
};

// Hook específico para provas de estudantes
export const useStudentExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examService.getStudentExams();
      setExams(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar provas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return {
    exams,
    isLoading,
    error,
    loadExams,
  };
}; 