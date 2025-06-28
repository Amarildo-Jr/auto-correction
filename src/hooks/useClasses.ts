'use client';

import { classService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Class {
  id: number;
  name: string;
  description?: string;
  professor_id: number;
  is_active: boolean;
  schedule?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRequest {
  id: number;
  class_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolled_at: string;
}

// Usar localStorage diretamente - mais simples e confiável
const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await classService.getAll();
      setClasses(data);
    } catch (err: any) {
      console.error('Erro ao buscar turmas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await makeApiRequest('/classes/available');
      setClasses(data);
    } catch (err: any) {
      console.error('Erro ao carregar turmas disponíveis:', err);
      setError(err.message || 'Erro ao carregar turmas disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  const createClass = async (classData: {
    name: string;
    description?: string;
    schedule?: string;
    is_active?: boolean;
  }) => {
    try {
      const data = await makeApiRequest('/classes', {
        method: 'POST',
        body: JSON.stringify(classData),
      });
      
      setClasses(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar turma');
    }
  };

  const requestEnrollment = async (classId: number) => {
    try {
      const data = await makeApiRequest(`/classes/${classId}/request-enrollment`, {
        method: 'POST',
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao solicitar participação');
    }
  };

  const enrollInClass = async (classId: number) => {
    try {
      const data = await makeApiRequest(`/classes/${classId}/enroll`, {
        method: 'POST',
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao se matricular na turma');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    isLoading,
    error,
    createClass,
    requestEnrollment,
    enrollInClass,
    fetchAvailableClasses,
    refetch: fetchClasses,
  };
};

export const useEnrollmentRequests = (classId: number) => {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await makeApiRequest(`/classes/${classId}/enrollment-requests`);
      setRequests(data);
    } catch (err: any) {
      console.error('Erro ao carregar solicitações:', err);
      setError(err.message || 'Erro ao carregar solicitações');
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async (enrollmentId: number) => {
    try {
      await makeApiRequest(`/classes/${classId}/approve-enrollment/${enrollmentId}`, {
        method: 'POST',
      });
      
      // Atualizar lista local
      setRequests(prev => prev.filter(req => req.id !== enrollmentId));
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao aprovar solicitação');
    }
  };

  const approveAllRequests = async () => {
    try {
      const data = await makeApiRequest(`/classes/${classId}/approve-all-enrollments`, {
        method: 'POST',
      });
      
      // Limpar lista local
      setRequests([]);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao aprovar todas as solicitações');
    }
  };

  const rejectRequest = async (enrollmentId: number) => {
    try {
      await makeApiRequest(`/classes/${classId}/reject-enrollment/${enrollmentId}`, {
        method: 'POST',
      });
      
      // Atualizar lista local
      setRequests(prev => prev.filter(req => req.id !== enrollmentId));
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao rejeitar solicitação');
    }
  };

  useEffect(() => {
    if (classId) {
      fetchRequests();
    }
  }, [classId]);

  return {
    requests,
    isLoading,
    error,
    approveRequest,
    approveAllRequests,
    rejectRequest,
    refetch: fetchRequests,
  };
};

export const useClass = (classId: number) => {
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClass = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await makeApiRequest(`/classes/${classId}`);
      setClassData(data);
    } catch (err: any) {
      console.error('Erro ao carregar turma:', err);
      setError(err.message || 'Erro ao carregar turma');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await makeApiRequest(`/classes/${classId}/students`);
      setStudents(data);
    } catch (err: any) {
      console.error('Erro ao carregar estudantes:', err);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClass();
      fetchStudents();
    }
  }, [classId]);

  return {
    classData,
    students,
    isLoading,
    error,
    refetch: fetchClass,
    refetchStudents: fetchStudents,
  };
};

// Hook específico para turmas de estudantes
export const useStudentClasses = () => {
  return useClasses(); // Por enquanto usa o mesmo endpoint
}; 