import { notificationService } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  });

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await notificationService.getNotifications();
      setState(prev => ({
        ...prev,
        notifications: response.notifications,
        unreadCount: response.unread_count,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao carregar notificações',
        isLoading: false
      }));
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao marcar como lida'
      }));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })),
        unreadCount: 0
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao marcar todas como lidas'
      }));
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.is_read;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao excluir notificação'
      }));
    }
  }, []);

  const createNotification = useCallback(async (notificationData: {
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }) => {
    try {
      const newNotification = await notificationService.createNotification(notificationData);
      
      setState(prev => ({
        ...prev,
        notifications: [newNotification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1
      }));
      
      return newNotification;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao criar notificação'
      }));
      throw error;
    }
  }, []);

  // Buscar notificações ao montar o componente
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling para novas notificações (a cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Funções utilitárias
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.is_read);
  }, [state.notifications]);

  const getNotificationsByType = useCallback((type: string) => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  const getNotificationsByPriority = useCallback((priority: 'low' | 'normal' | 'high' | 'urgent') => {
    return state.notifications.filter(n => n.priority === priority);
  }, [state.notifications]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'exam_reminder':
        return '📅';
      case 'result_available':
        return '📊';
      case 'suspicious_activity':
        return '⚠️';
      case 'exam_completed':
        return '✅';
      case 'enrollment_request':
        return '👤';
      default:
        return '📢';
    }
  }, []);

  return {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getPriorityColor,
    getTypeIcon
  };
}; 