import api from '@/services/api'
import { useEffect, useState } from 'react'

export interface AnalyticsData {
  general_stats: {
    total_exams: number
    total_students: number
    total_teachers: number
    total_questions: number
    avg_auto_precision: number
    avg_exam_duration: number
  }
  grade_distribution: {
    [key: string]: number
  }
  question_types: Array<{
    type: string
    count: number
  }>
  correction_stats: {
    auto_corrected: number
    manual_corrected: number
    pending_correction: number
  }
  daily_usage: Array<{
    date: string
    enrollments: number
  }>
  monitoring_events: Array<{
    type: string
    count: number
  }>
  platform_evaluations: {
    [key: string]: number
  }
  user_difficulty_stats: {
    [key: string]: number
  }
  problem_stats: {
    [key: string]: number
  }
  recommendation_stats: {
    [key: string]: number
  }
  device_stats: {
    [key: string]: number
  }
  performance_metrics: {
    completion_rate: number
    auto_correction_rate: number
    platform_satisfaction: number
  }
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get('/admin/analytics/dashboard')
        setAnalytics(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar dados analíticos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return { analytics, isLoading, error }
} 