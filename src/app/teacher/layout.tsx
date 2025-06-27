'use client';

import { AdminProtection } from '@/components/AdminProtection';
import { NotificationCenter } from '@/components/NotificationCenter';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { useAppContext } from '@/contexts/AppContext';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAppContext();

  return (
    <AdminProtection allowedRoles={['admin', 'professor']}>
      <div className="flex h-screen bg-gray-100">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ProvEx - {user?.role === 'admin' ? 'Admin (Área do Professor)' : 'Professor'}
                </h1>
                <p className="text-sm text-gray-600">
                  Bem-vindo, {user?.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProtection>
  );
} 