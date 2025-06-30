import api from '@/services/api'
import { useCallback, useRef } from 'react'

interface UseAntiCheatProps {
  examId?: number
  questionId?: number
  enrollmentId?: number
}

export const useAntiCheat = ({ examId, questionId, enrollmentId }: UseAntiCheatProps = {}) => {
  const lastEventRef = useRef<number>(0)

  const reportSuspiciousActivity = useCallback(async (activityType: string, details: any = {}) => {
    const now = Date.now()
    // Evitar spam de eventos - mínimo 1 segundo entre reports do mesmo tipo
    if (now - lastEventRef.current < 1000) return
    lastEventRef.current = now

    try {
      await api.post('/api/monitoring/event', {
        enrollment_id: enrollmentId,
        exam_id: examId,
        event_type: 'suspicious_activity',
        event_data: {
          activity_type: activityType,
          question_id: questionId,
          timestamp: new Date().toISOString(),
          details
        }
      })
    } catch (error) {
      console.warn('Erro ao reportar atividade suspeita:', error)
    }
  }, [examId, questionId, enrollmentId])

  const preventCopyPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const activityType = e.type === 'paste' ? 'paste_attempt' : 
                        e.type === 'copy' ? 'copy_attempt' : 'cut_attempt'
    
    reportSuspiciousActivity(activityType, {
      blocked: true,
      event_type: e.type
    })
    
    // Mostrar aviso visual discreto
    const element = e.target as HTMLElement
    const originalBorder = element.style.border
    element.style.border = '2px solid #ef4444'
    setTimeout(() => {
      element.style.border = originalBorder
    }, 500)
  }, [reportSuspiciousActivity])

  const preventKeyboardShortcuts = useCallback((e: React.KeyboardEvent) => {
    const isCtrlKey = e.ctrlKey || e.metaKey
    const forbiddenKeys = ['c', 'v', 'x', 'a', 'z', 'y']
    
    if (isCtrlKey && forbiddenKeys.includes(e.key.toLowerCase())) {
      e.preventDefault()
      reportSuspiciousActivity('keyboard_shortcut_attempt', {
        blocked: true,
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey
      })
    }

    // Bloquear F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' || 
        (isCtrlKey && e.shiftKey && e.key === 'I') ||
        (isCtrlKey && e.key === 'u')) {
      e.preventDefault()
      reportSuspiciousActivity('dev_tools_attempt', {
        blocked: true,
        key: e.key
      })
    }
  }, [reportSuspiciousActivity])

  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    reportSuspiciousActivity('right_click_attempt', {
      blocked: true,
      position: { x: e.clientX, y: e.clientY }
    })
  }, [reportSuspiciousActivity])

  const getSecureTextareaProps = useCallback(() => ({
    onPaste: preventCopyPaste,
    onCopy: preventCopyPaste,
    onCut: preventCopyPaste,
    onKeyDown: preventKeyboardShortcuts,
    onContextMenu: preventContextMenu,
    spellCheck: false,
    autoComplete: 'off',
    style: {
      userSelect: 'text' as const,
      WebkitUserSelect: 'text' as const,
    }
  }), [preventCopyPaste, preventKeyboardShortcuts, preventContextMenu])

  return {
    getSecureTextareaProps,
    reportSuspiciousActivity
  }
} 