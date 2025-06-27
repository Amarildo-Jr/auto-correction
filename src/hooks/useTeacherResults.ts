'use client';

import tokenService from '@/services/tokenService';
import { useEffect, useState } from 'react';

export interface TeacherResult {
  id: number
  exam_id: number
  exam_title: string
  student_id: number
  student_name: string
  student_email: string
  status: 'pending' | 'in_progress' | 'completed' | 'graded'
  total_points?: number
  points_earned?: number
  percentage?: number
  start_time?: string
  end_time?: string
  finished_at?: string
  created_at: string
  answers?: Answer[]
}

export interface Answer {
  id: number
  question_id: number
  question_text: string
  question_type: string
  answer_text?: string
  selected_alternative_id?: number
  alternative_text?: string
  is_correct?: boolean
  points_earned?: number
  points_possible: number
  needs_manual_correction?: boolean
  corrected_by?: number
  correction_comment?: string
}

const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  const token = await tokenService.getValidAccessToken()
  
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

export function useTeacherResults() {
  const [results, setResults] = useState<TeacherResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await makeApiRequest('/api/teacher/results')
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const recalculateResults = async (examId?: number, studentId?: number, recorrectEssays: boolean = false) => {
    try {
      const body: any = {}
      if (examId) body.exam_id = examId
      if (studentId) body.student_id = studentId
      body.recorrect_essays = recorrectEssays

      const data = await makeApiRequest('/api/teacher/results/recalculate', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      if (!data.success) {
        return { 
          success: false, 
          message: data.message,
          recalculated_count: data.recalculated_count 
        }
      }

      // Recarregar resultados após recálculo
      await fetchResults()

      return { 
        success: true, 
        message: data.message,
        recalculated_count: data.recalculated_count 
      }
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Erro desconhecido' 
      }
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  return {
    results,
    isLoading,
    error,
    fetchResults,
    recalculateResults
  }
} 