import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'
import { ReactNode } from 'react'

interface TeacherLayoutProps {
  children: ReactNode
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="flex h-screen">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
} 