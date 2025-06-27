import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratar respostas e erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // Redirecionar para login se não estiver já na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Tipos
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'professor' | 'student';
  created_at: string;
}

export interface Class {
  id: number;
  name: string;
  description: string;
  instructor_id: number;
  schedule: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassEnrollment {
  id: number;
  class_id: number;
  student_id: number;
  enrolled_at: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  created_by: number;
  class_id?: number;
  status: 'draft' | 'published' | 'finished';
  created_at: string;
}

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
  points: number;
  order_number: number;
  alternatives?: Alternative[];
}

export interface Alternative {
  id: number;
  question_id: number;
  alternative_text: string;
  is_correct: boolean;
  order_number: number;
}

export interface ExamEnrollment {
  id: number;
  exam_id: number;
  student_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'graded';
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export interface Answer {
  id: number;
  enrollment_id: number;
  question_id: number;
  answer_text?: string;
  selected_alternative_id?: number;
  points_earned?: number;
  created_at: string;
}

// Serviços de autenticação
export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Também armazenar em cookies para o middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
      document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    }
    return { token, user };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    user_type: 'student' | 'teacher';
  }) {
    const response = await api.post('/api/auth/register', userData);
    const { token, user } = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Também armazenar em cookies para o middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
      document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    }
    return { token, user };
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remover cookies também
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
  }
};

// Serviços de usuários
export const userService = {
  async create(userData: {
    name: string; 
    email: string; 
    password: string;
    role: 'admin' | 'professor' | 'student';
  }) {
    const response = await api.post('/api/users', userData);
    return response.data;
  }
};

// Serviços de provas
export const examService = {
  async getAll() {
    const response = await api.get('/api/exams');
    return response.data;
  },

  async getStudentExams() {
    const response = await api.get('/api/student/exams');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/api/exams/${id}`);
    return response.data;
  },

  async create(examData: {
    title: string;
    description: string;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    class_id?: number;
  }) {
    const response = await api.post('/api/exams', examData);
    return response.data;
  },

  async update(examId: number, examData: {
    title?: string;
    description?: string;
    duration_minutes?: number;
    start_time?: string;
    end_time?: string;
    class_id?: number;
    questions?: number[];
    question_points?: Record<string, number>;
  }) {
    const response = await api.put(`/api/exams/${examId}`, examData);
    return response.data;
  },

  async addQuestion(examId: number, questionData: {
    question_text: string;
    question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';
    points: number;
    order_number: number;
    alternatives?: {
      text: string;
      is_correct: boolean;
      order_number: number;
    }[];
  }) {
    const response = await api.post(`/api/exams/${examId}/questions`, questionData);
    return response.data;
  },

  async getEnrollmentStatus(examId: number) {
    const response = await api.get(`/api/exams/${examId}/enrollment-status`);
    return response.data;
  },

  async start(examId: number) {
    const response = await api.post(`/api/exams/${examId}/start`);
    return response.data;
  }
};

// Serviços de realização de provas
export const enrollmentService = {
  async submitAnswer(enrollmentId: number, answerData: {
    question_id: number;
    answer_text?: string;
    selected_alternatives?: number[];
  }) {
    const response = await api.post(`/api/enrollments/${enrollmentId}/submit-answer`, answerData);
    return response.data;
  },

  async finish(enrollmentId: number) {
    const response = await api.post(`/api/enrollments/${enrollmentId}/finish`);
    return response.data;
  }
};

// Serviços de monitoramento
export const monitoringService = {
  async recordEvent(eventData: {
    enrollment_id: number;
    event_type: 'video_capture' | 'screen_capture' | 'focus_change' | 'suspicious_activity';
    event_data: any;
  }) {
    const response = await api.post('/api/monitoring/event', eventData);
    return response.data;
  },

  async getSuspiciousActivities(enrollmentId: number) {
    const response = await api.get(`/api/monitoring/suspicious-activities/${enrollmentId}`);
    return response.data;
  },

  async getDashboardAlerts() {
    const response = await api.get('/api/monitoring/dashboard-alerts');
    return response.data;
  },

  async getExamMonitoringStats(examId: number) {
    const response = await api.get(`/api/monitoring/exam-stats/${examId}`);
    return response.data;
  }
};

// Serviços de notificações
export const notificationService = {
  async getNotifications(userId?: number) {
    const url = userId ? `/api/notifications?user_id=${userId}` : '/api/notifications';
    const response = await api.get(url);
    return response.data;
  },

  async markAsRead(notificationId: number) {
    const response = await api.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/api/notifications/mark-all-read');
    return response.data;
  },

  async createNotification(notificationData: {
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    const response = await api.post('/api/notifications', notificationData);
    return response.data;
  },

  async deleteNotification(notificationId: number) {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }
};

// Serviços de turmas
export const classService = {
  async getAll() {
    const response = await api.get('/api/classes');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/api/classes/${id}`);
    return response.data;
  },

  async create(classData: {
    name: string;
    description?: string;
    schedule?: string;
    is_active?: boolean;
  }) {
    const response = await api.post('/api/classes', classData);
    return response.data;
  },

  async enroll(classId: number) {
    const response = await api.post(`/api/classes/${classId}/enroll`);
    return response.data;
  },

  async getStudents(classId: number) {
    const response = await api.get(`/api/classes/${classId}/students`);
    return response.data;
  }
};

// Serviço de teste
export const testService = {
  async healthCheck() {
    const response = await api.get('/api/test');
    return response.data;
  }
}; 

export default api; 