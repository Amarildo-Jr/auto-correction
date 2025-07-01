'use client'

import { resultService } from '@/services/api'
import { useCallback, useEffect, useState } from 'react'

export interface ExamResult {
  id: number
  exam_id: number
  student_id: number
  total_points: number
  max_points: number
  percentage: number
  status: 'pending' | 'completed' | 'corrected'
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
  // Campos de compatibilidade com interface antiga
  exam_title: string
  score: number
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
      
      // Processar dados para garantir compatibilidade
      const processedResults = data.map((result: any) => ({
        ...result,
        exam_title: result.exam?.title || '',
        score: result.percentage || 0,
        exam_id: result.exam_id
      }))
      
      setResults(processedResults)
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