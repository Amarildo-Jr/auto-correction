'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getPriorityColor,
    getTypeIcon
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navegar baseado no tipo de notificação
    switch (notification.type) {
      case 'exam_reminder':
        if (notification.data?.exam_id) {
          router.push(`/student/exams/${notification.data.exam_id}`);
        }
        break;
      case 'result_available':
        if (notification.data?.enrollment_id) {
          router.push(`/student/results/${notification.data.enrollment_id}`);
        }
        break;
      case 'suspicious_activity':
        if (notification.data?.enrollment_id) {
          router.push(`/teacher/results/${notification.data.enrollment_id}`);
        }
        break;
      case 'exam_completed':
        if (notification.data?.exam_id) {
          router.push(`/teacher/exams/${notification.data.exam_id}`);
        }
        break;
      case 'enrollment_request':
        router.push('/teacher/enrollment-requests');
        break;
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  };

  const recentNotifications = notifications.slice(0, 10);
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.is_read);

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} não lidas
                </Badge>
              </div>
            </div>
          </div>

          {/* Notificações Urgentes */}
          {urgentNotifications.length > 0 && (
            <div className="p-2 bg-red-50 border-b">
              <h4 className="text-xs font-medium text-red-800 mb-2 flex items-center gap-1">
                <span className="animate-pulse">🚨</span>
                Urgentes ({urgentNotifications.length})
              </h4>
              {urgentNotifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 bg-white rounded border border-red-200 mb-1 cursor-pointer hover:bg-red-50"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-red-800 truncate">{notification.title}</p>
                      <p className="text-xs text-red-600 line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de Notificações */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Carregando...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-transparent"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div
                    className={`w-full p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${!notification.is_read ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="text-sm">{getTypeIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 