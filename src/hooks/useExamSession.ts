import { enrollmentService, monitoringService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface ExamSession {
  enrollmentId: number;
  examId: number;
  startTime: Date;
  endTime: Date;
  answers: Record<number, any>; // question_id -> answer
  isActive: boolean;
  timeRemaining: number;
  suspiciousActivityCount: number;
  lastActivityTime: Date;
}

export const useExamSession = (enrollmentId: number | null) => {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contadores para detecção de comportamento suspeito
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardShortcutAttempts, setKeyboardShortcutAttempts] = useState(0);

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
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (err) {
      console.error('Erro ao registrar evento de monitoramento:', err);
    }
  }, [enrollmentId]);

  // Detectar comportamentos suspeitos
  const detectSuspiciousActivity = useCallback(async (activityType: string, details: any) => {
    const suspiciousEvent = {
      type: 'suspicious_activity',
      activity_type: activityType,
      details,
      timestamp: new Date().toISOString(),
      session_info: {
        focus_loss_count: focusLossCount,
        tab_switch_count: tabSwitchCount,
        copy_paste_attempts: copyPasteAttempts,
        right_click_attempts: rightClickAttempts,
        keyboard_shortcut_attempts: keyboardShortcutAttempts
      }
    };

    await recordMonitoringEvent('suspicious_activity', suspiciousEvent);
    
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        suspiciousActivityCount: prev.suspiciousActivityCount + 1
      };
    });
  }, [focusLossCount, tabSwitchCount, copyPasteAttempts, rightClickAttempts, keyboardShortcutAttempts, recordMonitoringEvent]);

  // Auto-save de respostas
  const autoSaveAnswer = useCallback(async (questionId: number, answer: any) => {
    // Implementar debounce para auto-save
    const timeoutId = setTimeout(() => {
      submitAnswer(questionId, answer);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [submitAnswer]);

  // Monitoramento avançado de foco da página
  useEffect(() => {
    if (!enrollmentId) return;

    let focusStartTime = Date.now();
    let isTabActive = true;

    const handleFocusChange = (event: FocusEvent) => {
      const eventType = event.type;
      const now = Date.now();
      
      if (eventType === 'blur' && isTabActive) {
        focusStartTime = now;
        isTabActive = false;
        setFocusLossCount(prev => prev + 1);
        
        recordMonitoringEvent('focus_change', {
          type: eventType,
          timestamp: new Date().toISOString()
        });
      } else if (eventType === 'focus' && !isTabActive) {
        const timeAway = now - focusStartTime;
        isTabActive = true;
        
        // Detectar tempo suspeito fora da aba
        if (timeAway > 30000) { // Mais de 30 segundos
          detectSuspiciousActivity('extended_focus_loss', {
            time_away_ms: timeAway,
            time_away_seconds: Math.round(timeAway / 1000)
          });
        }
        
      recordMonitoringEvent('focus_change', {
          type: eventType,
          time_away_ms: timeAway,
        timestamp: new Date().toISOString()
      });
      }
    };

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      
      if (isHidden) {
        setTabSwitchCount(prev => prev + 1);
      }
      
      recordMonitoringEvent('visibility_change', {
        type: isHidden ? 'hidden' : 'visible',
        timestamp: new Date().toISOString()
      });

      // Detectar muitas trocas de aba
      if (tabSwitchCount > 5) {
        detectSuspiciousActivity('excessive_tab_switching', {
          switch_count: tabSwitchCount
        });
      }
    };

    // Detectar tentativas de copiar/colar
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCopyPaste = (event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'v');
      const isDevTools = event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I');
      const isRefresh = event.key === 'F5' || (event.ctrlKey && event.key === 'r');
      
      if (isCopyPaste) {
        setCopyPasteAttempts(prev => prev + 1);
        detectSuspiciousActivity('copy_paste_attempt', {
          key: event.key,
          ctrl_key: event.ctrlKey,
          meta_key: event.metaKey
        });
        event.preventDefault();
      }
      
      if (isDevTools) {
        setKeyboardShortcutAttempts(prev => prev + 1);
        detectSuspiciousActivity('dev_tools_attempt', {
          key_combination: 'F12 or Ctrl+Shift+I'
        });
        event.preventDefault();
      }
      
      if (isRefresh) {
        detectSuspiciousActivity('page_refresh_attempt', {
          key_combination: event.ctrlKey ? 'Ctrl+R' : 'F5'
        });
        event.preventDefault();
      }
    };

    // Detectar clique direito
    const handleContextMenu = (event: MouseEvent) => {
      setRightClickAttempts(prev => prev + 1);
      detectSuspiciousActivity('right_click_attempt', {
        x: event.clientX,
        y: event.clientY
      });
      event.preventDefault();
    };

    // Detectar seleção de texto
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 10) {
        detectSuspiciousActivity('text_selection', {
          selected_text_length: selection.toString().length,
          selected_text: selection.toString().substring(0, 100) // Primeiros 100 caracteres
        });
      }
    };

    // Detectar redimensionamento da janela (possível tentativa de abrir outras janelas)
    const handleResize = () => {
      recordMonitoringEvent('window_resize', {
        width: window.innerWidth,
        height: window.innerHeight,
        timestamp: new Date().toISOString()
      });
    };

    // Adicionar event listeners
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mouseup', handleTextSelection);
    window.addEventListener('resize', handleResize);

    // Monitoramento de mouse inativo (possível uso de outra aplicação)
    let mouseTimer: NodeJS.Timeout;
    const handleMouseMove = () => {
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        detectSuspiciousActivity('mouse_inactive', {
          inactive_duration_ms: 60000 // 1 minuto sem movimento
        });
      }, 60000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mouseup', handleTextSelection);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimer);
    };
  }, [enrollmentId, recordMonitoringEvent, detectSuspiciousActivity, tabSwitchCount]);

  return {
    session,
    isLoading,
    error,
    submitAnswer,
    finishExam,
    recordMonitoringEvent,
    autoSaveAnswer,
    suspiciousActivityCount: session?.suspiciousActivityCount || 0,
    behaviorStats: {
      focusLossCount,
      tabSwitchCount,
      copyPasteAttempts,
      rightClickAttempts,
      keyboardShortcutAttempts
    }
  };
}; 