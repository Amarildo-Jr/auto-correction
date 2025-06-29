'use client'

import { resultService } from '@/services/api'
import { useCallback, useEffect, useState } from 'react'

export interface ExamResult {
  id: number
  exam_id: number
  student_id: number
  score: number
  percentage?: number
  total_points?: number
  points_earned?: number
  exam_title: string
  student_name: string
  submitted_at: string
  finished_at?: string
  corrected_at?: string
  is_corrected: boolean
  status: 'pending' | 'completed' | 'corrected'
}

export const useResults = () => {
  const [results, setResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await resultService.getStudentResults()
      setResults(data)
    } catch (err: any) {
      console.error('Erro ao buscar resultados:', err)
      setError(err.response?.data?.message || 'Erro ao carregar resultados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  return {
    results,
    isLoading,
    error,
    refetch: fetchResults,
  }
} 