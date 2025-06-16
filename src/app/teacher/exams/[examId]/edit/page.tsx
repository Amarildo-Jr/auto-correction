'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EditExamPage({ params }: { params: { examId: string } }) {
  const router = useRouter()

  // Redirecionar para a página de edição completa com questões
  useEffect(() => {
    router.replace(`/teacher/exams/edit/${params.examId}`)
  }, [params.examId, router])

  return <LoadingSpinner />
} 