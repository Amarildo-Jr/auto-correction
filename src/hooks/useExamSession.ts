import { enrollmentService, monitoringService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface ExamSession {
  enrollmentId: number;
  examId: number;
  startTime: Date;
  endTime: Date;
  answers: Record<number, any>; // question_id -> answer
}

export const useExamSession = (enrollmentId: number | null) => {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAnswer = useCallback(async (questionId: number, answer: {
    answer_text?: string;
    selected_alternative_id?: number;
  }) => {
    if (!enrollmentId) return { success: false, error: 'Sessão não iniciada' };

    try {
      const result = await enrollmentService.submitAnswer(enrollmentId, {
        question_id: questionId,
        ...answer
      });

      // Atualizar estado local
      setSession(prev => prev ? {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answer
        }
      } : null);

      return { success: true, data: result };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao salvar resposta' 
      };
    }
  }, [enrollmentId]);

  const finishExam = useCallback(async () => {
    if (!enrollmentId) return { success: false, error: 'Sessão não iniciada' };

    setIsLoading(true);
    try {
      const result = await enrollmentService.finish(enrollmentId);
      return { success: true, data: result };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao finalizar prova' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  const recordMonitoringEvent = useCallback(async (eventType: string, eventData: any) => {
    if (!enrollmentId) return;

    try {
      await monitoringService.recordEvent({
        enrollment_id: enrollmentId,
        event_type: eventType as any,
        event_data: eventData
      });
    } catch (err) {
      console.error('Erro ao registrar evento de monitoramento:', err);
    }
  }, [enrollmentId]);

  // Auto-save de respostas
  const autoSaveAnswer = useCallback(async (questionId: number, answer: any) => {
    // Implementar debounce para auto-save
    const timeoutId = setTimeout(() => {
      submitAnswer(questionId, answer);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [submitAnswer]);

  // Monitoramento de foco da página
  useEffect(() => {
    if (!enrollmentId) return;

    const handleFocusChange = (event: FocusEvent) => {
      recordMonitoringEvent('focus_change', {
        type: event.type,
        timestamp: new Date().toISOString()
      });
    };

    const handleVisibilityChange = () => {
      recordMonitoringEvent('focus_change', {
        type: document.hidden ? 'hidden' : 'visible',
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enrollmentId, recordMonitoringEvent]);

  return {
    session,
    isLoading,
    error,
    submitAnswer,
    finishExam,
    recordMonitoringEvent,
    autoSaveAnswer,
  };
}; 