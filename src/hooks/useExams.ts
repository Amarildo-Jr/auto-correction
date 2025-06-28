'use client';

import { examService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Exam {
  id: number;
  title: string;
  description?: string;
  duration: number;
  duration_minutes: number;
  total_points: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  status: 'draft' | 'published' | 'archived';
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

  const createExam = useCallback(async (examData: any) => {
    try {
      const newExam = await examService.create(examData);
      setExams(prev => [...prev, newExam]);
      return newExam;
    } catch (err: any) {
      console.error('Erro ao criar prova:', err);
      setError(err.response?.data?.message || 'Erro ao criar prova');
      throw err;
    }
  }, []);

  const updateExam = useCallback(async (id: string, examData: any) => {
    try {
      const updatedExam = await examService.update(id, examData);
      setExams(prev => prev.map(exam => exam.id === parseInt(id) ? updatedExam : exam));
      return updatedExam;
    } catch (err: any) {
      console.error('Erro ao atualizar prova:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar prova');
      throw err;
    }
  }, []);

  const deleteExam = useCallback(async (id: string) => {
    try {
      await examService.delete(id);
      setExams(prev => prev.filter(exam => exam.id !== parseInt(id)));
    } catch (err: any) {
      console.error('Erro ao deletar prova:', err);
      setError(err.response?.data?.message || 'Erro ao deletar prova');
      throw err;
    }
  }, []);

  const getExam = useCallback(async (id: string) => {
    try {
      const exam = await examService.getById(id);
      return exam;
    } catch (err: any) {
      console.error('Erro ao buscar prova:', err);
      setError(err.response?.data?.message || 'Erro ao buscar prova');
      throw err;
    }
  }, []);

  return {
    exams,
    isLoading,
    error,
    refetch: fetchExams,
    createExam,
    updateExam,
    deleteExam,
    getExam,
  };
};

export const useStudentExams = () => {
  return useExams(); // Por enquanto usa o mesmo endpoint
};

export const useExam = (examId: number) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await examService.getById(id.toString());
      setExam(data);
    } catch (err: any) {
      console.error('Erro ao buscar prova:', err);
      setError(err.response?.data?.message || 'Erro ao carregar prova');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (examId) {
      fetchExam(examId);
    }
  }, [examId, fetchExam]);

  return {
    exam,
    isLoading,
    error,
    refetch: () => fetchExam(examId),
  };
}; 