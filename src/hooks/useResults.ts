'use client'

import { useEffect, useState } from 'react'

export interface ExamResult {
  id: number
  exam_id: number
  exam_title: string
  student_id?: number
  student_name?: string
  status: 'pending' | 'in_progress' | 'completed' | 'graded'
  total_points?: number
  points_earned?: number
  percentage?: number
  start_time?: string
  end_time?: string
  finished_at?: string
  created_at: string
}

interface UseResultsReturn {
  results: ExamResult[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export const useResults = () => {
  const [results, setResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await makeApiRequest('/api/student/results')
      setResults(data)
    } catch (err: any) {
      console.error('Erro ao carregar resultados:', err)
      setError(err.message || 'Erro inesperado ao carregar resultados')
    } finally {
      setIsLoading(false)
    }
  }

  const getExamResult = async (examId: number): Promise<ExamResult | null> => {
    try {
      const data = await makeApiRequest(`/api/student/results/${examId}`)
      return data
    } catch (err: any) {
      console.error('Erro ao carregar resultado da prova:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  return {
    results,
    isLoading,
    error,
    refetch: fetchResults,
    getExamResult
  }
} 