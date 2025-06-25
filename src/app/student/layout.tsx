import { StudentSidebar } from '@/components/student/StudentSidebar'
import { ReactNode } from 'react'

interface StudentLayoutProps {
  children: ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="flex h-screen">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 