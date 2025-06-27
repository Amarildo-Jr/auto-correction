import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
]

// Rotas específicas por role
const roleRoutes = {
  admin: ['/admin', '/teacher', '/student'], // Admin pode acessar tudo
  professor: ['/teacher'], // Professor só acessa área de professor
  student: ['/student'] // Estudante só acessa área de estudante
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Permitir arquivos estáticos e API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar se há token
  const token = request.cookies.get('token')?.value
  const userRole = request.cookies.get('userRole')?.value

  // Se não há token, redirecionar para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se não há role, redirecionar para login
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar permissões específicas por rota
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'professor' ? '/teacher/dashboard' : '/student/dashboard'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  if (pathname.startsWith('/teacher')) {
    if (!['admin', 'professor'].includes(userRole)) {
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'student' ? '/student/dashboard' : '/login'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  if (pathname.startsWith('/student')) {
    if (!['admin', 'student'].includes(userRole)) {
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'professor' ? '/teacher/dashboard' : '/login'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 