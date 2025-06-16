'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCallback, useEffect, useState } from 'react'

export interface ExamResult {
  id: number
  exam_id: number
  student_id: number
  total_points: number
  max_points: number
  percentage: number
  status: 'completed' | 'in_progress' | 'not_started'
  started_at?: string
  finished_at?: string
  answers_count: number
  questions_count: number
  exam: {
    id: number
    title: string
    description?: string
    duration_minutes: number
    start_time: string
    end_time: string
    class_id?: number
    class_name?: string
  }
}

export const useResults = () => {
  const [results, setResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  const fetchResults = useCallback(async () => {
    const token = getToken()
    if (!token || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/student/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar resultados')
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      console.error('Erro ao carregar resultados:', err)
      setError(err.message || 'Erro inesperado ao carregar resultados')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const getExamResult = useCallback(async (examId: number): Promise<ExamResult | null> => {
    const token = getToken()
    if (!token || !isAuthenticated) return null

    try {
      const response = await fetch(`http://localhost:5000/api/student/results/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Erro ao carregar resultado da prova')
      }

      return await response.json()
    } catch (err: any) {
      console.error('Erro ao carregar resultado da prova:', err)
      throw err
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchResults()
  }, [fetchResults, isAuthenticated])

  return {
    results,
    isLoading,
    error,
    refetch: fetchResults,
    getExamResult
  }
} 