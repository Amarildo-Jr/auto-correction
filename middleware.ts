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
  
  console.log(`Middleware executado para: ${pathname}`);
  
  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    console.log(`Rota pública permitida: ${pathname}`);
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

  console.log(`Token presente: ${!!token}, UserRole: ${userRole}`);

  // Se não há token, redirecionar para login
  if (!token) {
    console.log(`Redirecionando para login - sem token. Pathname: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se não há role, redirecionar para login
  if (!userRole) {
    console.log(`Redirecionando para login - sem role. Pathname: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar permissões específicas por rota
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      console.log(`Acesso negado ao admin - role: ${userRole}`);
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'professor' ? '/teacher/dashboard' : '/student/dashboard'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  if (pathname.startsWith('/teacher')) {
    if (!['admin', 'professor'].includes(userRole)) {
      console.log(`Acesso negado ao teacher - role: ${userRole}`);
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'student' ? '/student/dashboard' : '/login'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  if (pathname.startsWith('/student')) {
    if (!['admin', 'student'].includes(userRole)) {
      console.log(`Acesso negado ao student - role: ${userRole}`);
      // Redirecionar para dashboard apropriado
      const dashboardUrl = userRole === 'professor' ? '/teacher/dashboard' : '/login'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  console.log(`Acesso permitido para ${pathname} com role: ${userRole}`);
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