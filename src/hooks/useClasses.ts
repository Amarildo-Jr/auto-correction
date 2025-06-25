'use client';

import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Class {
  id: number;
  name: string;
  description?: string;
  instructor_id: number;
  instructor_name?: string;
  schedule?: string;
  is_active: boolean;
  created_at: string;
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

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/classes');
      setClasses(data);
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err);
      setError(err.message || 'Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/classes/available');
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
      const data = await apiRequest('/classes', {
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
      const data = await apiRequest(`/classes/${classId}/request-enrollment`, {
        method: 'POST',
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao solicitar participação');
    }
  };

  const enrollInClass = async (classId: number) => {
    try {
      const data = await apiRequest(`/classes/${classId}/enroll`, {
        method: 'POST',
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao se matricular na turma');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

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
      
      const data = await apiRequest(`/classes/${classId}/enrollment-requests`);
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
      await apiRequest(`/classes/${classId}/approve-enrollment/${enrollmentId}`, {
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
      const data = await apiRequest(`/classes/${classId}/approve-all-enrollments`, {
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
      await apiRequest(`/classes/${classId}/reject-enrollment/${enrollmentId}`, {
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

  const loadClass = useCallback(async () => {
    if (!classId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/classes/${classId}`);
      setClassData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar turma');
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  const loadStudents = useCallback(async () => {
    if (!classId) return;
    
    try {
      const data = await apiRequest(`/classes/${classId}/students`);
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar estudantes');
    }
  }, [classId]);

  useEffect(() => {
    loadClass();
    loadStudents();
  }, [loadClass, loadStudents]);

  return {
    classData,
    students,
    isLoading,
    error,
    loadClass,
    loadStudents,
  };
};

// Hook específico para turmas de estudantes
export const useStudentClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/student/classes');
      setClasses(data);
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err);
      setError(err.message || 'Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/student/available-classes');
      setClasses(data);
    } catch (err: any) {
      console.error('Erro ao carregar turmas disponíveis:', err);
      setError(err.message || 'Erro ao carregar turmas disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  const requestEnrollment = async (classId: number) => {
    try {
      const data = await apiRequest(`/classes/${classId}/request-enrollment`, {
        method: 'POST',
      });
      
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao solicitar participação');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    isLoading,
    error,
    requestEnrollment,
    fetchAvailableClasses,
    refetch: fetchClasses,
  };
}; 