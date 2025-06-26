'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Redirecionando...</p>
      </div>
    </div>
  )
} 