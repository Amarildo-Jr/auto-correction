import axios from 'axios';

// Função para obter token usando tokenService
const getTokenService = () => {
  if (typeof window === 'undefined') return null;
  try {
    return require('./tokenService').default;
  } catch (error) {
    console.warn('TokenService não disponível:', error);
    return null;
  }
};

// Configuração base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para obter token usando tokenService ou fallback
const getToken = () => {
  if (typeof window === 'undefined') return null;
  
  const tokenService = getTokenService();
  if (tokenService) {
    return tokenService.getAccessToken();
  }
  
  // Fallback para tokens antigos
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
};

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar respostas e gerenciar token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se é erro 401 e não é uma tentativa de retry
    if (error.response?.status === 401 && !originalRequest._retry && getTokenService()) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const newToken = await getTokenService().getValidAccessToken();
        
        if (newToken) {
          // Retry da requisição original com novo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
      }

      // Se chegou aqui, o refresh falhou - limpar tokens e redirecionar
      if (typeof window !== 'undefined') {
        getTokenService().clearTokens();
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

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

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  text: string; // alias para question_text
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'; // alias para question_type
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points: number;
  options?: string[];
  correct_answer?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  student_id: number;
  score: number;
  percentage?: number;
  total_points?: number;
  points_earned?: number;
  exam_title: string;
  student_name: string;
  submitted_at: string;
  finished_at?: string;
  corrected_at?: string;
  is_corrected: boolean;
  status: 'pending' | 'completed' | 'corrected';
}

export interface TeacherResult {
  id: number;
  exam_id: number;
  student_id: number;
  score: number;
  percentage?: number;
  total_points?: number;
  exam_title: string;
  student_name: string;
  submitted_at: string;
  corrected_at?: string;
  is_corrected: boolean;
  status: 'pending' | 'completed' | 'corrected';
}

// Serviços de autenticação atualizados
export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/api/auth/login', credentials);
    const loginData = response.data;
    
    // Usar tokenService para salvar tokens de forma consistente
    if (typeof window !== 'undefined' && getTokenService()) {
      await getTokenService().setTokens(loginData);
    } else {
      // Fallback para compatibilidade
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('refreshToken', loginData.refresh_token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
    }
    
    return { token: loginData.token, user: loginData.user };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    user_type: 'student' | 'teacher';
  }) {
    const response = await api.post('/api/auth/register', userData);
    const loginData = response.data;
    
    // Usar tokenService para salvar tokens de forma consistente
    if (typeof window !== 'undefined' && getTokenService()) {
      await getTokenService().setTokens(loginData);
    } else {
      // Fallback para compatibilidade
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('refreshToken', loginData.refresh_token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
    }
    
    return { token: loginData.token, user: loginData.user };
  },

  logout() {
    if (typeof window !== 'undefined') {
      if (getTokenService()) {
        getTokenService().clearTokens();
      } else {
        // Fallback para compatibilidade
      localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('user');
      }
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getMe() {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  getToken(): string | null {
    return getToken();
  },

  isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;
    if (getTokenService()) {
      return getTokenService().hasValidToken();
    }
    // Fallback
    return !!this.getToken();
  }
};

// Função para fazer requisições com token
const apiRequest = async (url: string, options: any = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await api.request({
    url,
    ...config,
  });

  return response.data;
};

// Verificação de saúde
export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

// Serviços de provas
export const examService = {
  async getAll() {
    return apiRequest('/api/exams', { method: 'GET' });
  },

  async getById(id: string) {
    return apiRequest(`/api/exams/${id}`, { method: 'GET' });
  },

  async create(examData: any) {
    return apiRequest('/api/exams', {
      method: 'POST',
      data: examData,
    });
  },

  async update(id: string, examData: any) {
    return apiRequest(`/api/exams/${id}`, {
      method: 'PUT',
      data: examData,
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/exams/${id}`, { method: 'DELETE' });
  },

  async start(examId: number) {
    return apiRequest(`/api/exams/${examId}/start`, {
      method: 'POST'
    });
  }
};

// Serviços de turmas
export const classService = {
  async getAll() {
    return apiRequest('/api/classes', { method: 'GET' });
  },

  async getById(id: string) {
    return apiRequest(`/api/classes/${id}`, { method: 'GET' });
  },

  async create(classData: any) {
    return apiRequest('/api/classes', {
      method: 'POST',
      data: classData,
    });
  },

  async update(id: string, classData: any) {
    return apiRequest(`/api/classes/${id}`, {
      method: 'PUT',
      data: classData,
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/classes/${id}`, { method: 'DELETE' });
  }
};

// Serviços de questões  
export const questionService = {
  async getAll() {
    return apiRequest('/api/questions', { method: 'GET' });
  },

  async getById(id: string) {
    return apiRequest(`/api/questions/${id}`, { method: 'GET' });
  },

  async getByExam(examId: string) {
    return apiRequest(`/api/exams/${examId}/questions`, { method: 'GET' });
  },

  async create(questionData: any) {
    return apiRequest('/api/questions', {
      method: 'POST',
      data: questionData,
    });
  },

  async update(id: string, questionData: any) {
    return apiRequest(`/api/questions/${id}`, {
      method: 'PUT',
      data: questionData,
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/questions/${id}`, { method: 'DELETE' });
  }
};

// Serviços de resultados
export const resultService = {
  async getStudentResults() {
    return apiRequest('/api/student/results', { method: 'GET' });
  },

  async getTeacherResults() {
    return apiRequest('/api/teacher/results', { method: 'GET' });
  },

  async getResultById(id: string) {
    return apiRequest(`/api/student/results/${id}`, { method: 'GET' });
  }
};

// Serviços de notificações
export const notificationService = {
  async getAll() {
    return apiRequest('/api/notifications', { method: 'GET' });
  },

  async getNotifications() {
    return apiRequest('/api/notifications', { method: 'GET' });
  },

  async markAsRead(id: string | number) {
    return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead() {
    return apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' });
  },

  async deleteNotification(id: string | number) {
    return apiRequest(`/api/notifications/${id}`, { method: 'DELETE' });
  },

  async deleteAllNotifications() {
    return apiRequest('/api/notifications/delete-all', { method: 'DELETE' });
  },

  async createNotification(notificationData: any) {
    return apiRequest('/api/notifications', {
      method: 'POST',
      data: notificationData
    });
  }
};

// Serviços de matrícula/inscrição
export const enrollmentService = {
  async enroll(classId: number) {
    return apiRequest('/api/enrollment', {
      method: 'POST',
      data: { class_id: classId }
    });
  },

  async submitAnswer(enrollmentId: number, answerData: any) {
    return apiRequest(`/api/enrollments/${enrollmentId}/submit-answer`, {
      method: 'POST',
      data: answerData
    });
  },

  async finish(enrollmentId: number) {
    return apiRequest(`/api/enrollments/${enrollmentId}/finish`, {
      method: 'POST'
    });
  }
};

// Serviços de monitoramento
export const monitoringService = {
  async getExamMonitoringStats(examId: number) {
    return apiRequest(`/api/monitoring/exam-stats/${examId}`, { method: 'GET' });
  },

  async getStudentsProgress(examId: number) {
    return apiRequest(`/api/exams/${examId}/students-progress`, { method: 'GET' });
  },

  async recordEvent(eventData: any) {
    return apiRequest('/api/monitoring/events', {
      method: 'POST',
      data: eventData
    });
  }
};

export default api; 