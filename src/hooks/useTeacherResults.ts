import { useAppContext } from '@/contexts/AppContext'
import { useEffect, useState } from 'react'

interface TeacherResult {
  id: number
  exam_id: number
  exam_title: string
  class_name: string
  student_id: number
  student_name: string
  student_email: string
  total_points: number
  max_points: number
  percentage: number
  status: string
  started_at: string | null
  finished_at: string | null
  time_taken: number | null
}

export function useTeacherResults() {
  const { isAuthenticated } = useAppContext()
  const [results, setResults] = useState<TeacherResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  const fetchResults = async () => {
    const token = getToken()
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/teacher/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar resultados')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const recalculateResults = async (examId?: number, studentId?: number) => {
    const token = getToken()
    if (!token) return { success: false, message: 'Token não encontrado' }

    try {
      const body: any = {}
      if (examId) body.exam_id = examId
      if (studentId) body.student_id = studentId

      const response = await fetch('http://localhost:5000/api/teacher/results/recalculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.error || 'Erro ao recalcular' }
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
  }, [isAuthenticated])

  return {
    results,
    isLoading,
    error,
    fetchResults,
    recalculateResults
  }
} 