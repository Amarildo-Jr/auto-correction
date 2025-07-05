'use client'

import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/contexts/AppContext'
import {
  BarChart,
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAppContext()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Minhas Turmas',
      href: '/student/classes',
      icon: BookOpen
    },
    {
      title: 'Provas',
      href: '/student/exams',
      icon: FileText
    },
    {
      title: 'Resultados',
      href: '/student/results',
      icon: BarChart
    },
    {
      title: 'Fórum',
      href: '/student/forum',
      icon: MessageSquare
    },
    {
      title: 'Avaliar Plataforma',
      href: '/student/feedback',
      icon: Star
    },
    {
      title: 'Suporte',
      href: '/student/support',
      icon: HelpCircle
    }
  ]

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Logo expanded={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </Button>
      </div>
    </aside>
  )
} 