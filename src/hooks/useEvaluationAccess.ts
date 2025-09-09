import { useState, useEffect } from 'react'
import { checkEvaluationAccess, isCurrentUserAdmin } from '../services/api'

interface EvaluationAccess {
  canEvaluate: boolean
  evaluationsRemaining: number
  isAdmin: boolean
  message: string
  loading: boolean
  error: string | null
}

export function useEvaluationAccess() {
  const [access, setAccess] = useState<EvaluationAccess>({
    canEvaluate: false,
    evaluationsRemaining: 0,
    isAdmin: false,
    message: '',
    loading: true,
    error: null
  })

  const checkAccess = async () => {
    try {
      setAccess(prev => ({ ...prev, loading: true, error: null }))
      
      const accessInfo = await checkEvaluationAccess()
      
      setAccess({
        canEvaluate: accessInfo.canEvaluate,
        evaluationsRemaining: accessInfo.evaluationsRemaining,
        isAdmin: accessInfo.isAdmin,
        message: accessInfo.message,
        loading: false,
        error: null
      })
    } catch (error) {
      setAccess({
        canEvaluate: false,
        evaluationsRemaining: 0,
        isAdmin: false,
        message: 'Error checking access',
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    checkAccess()
  }, [])

  return { ...access, refresh: checkAccess }
}

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  return { isAdmin, loading }
}
