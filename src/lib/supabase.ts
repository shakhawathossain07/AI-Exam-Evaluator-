import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export the site URL for use in auth functions
export const getSiteUrl = () => {
  // Production URL
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return 'https://aiexamevaluator.me'
  }
  
  // Development URLs
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Fallback for development
  return 'http://localhost:3000'
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      evaluations: {
        Row: {
          id: string
          user_id: string
          student_paper_files: Record<string, unknown>[]
          mark_scheme_files: Record<string, unknown>[]
          total_possible_marks: number | null
          evaluation_result: Record<string, unknown> | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          student_paper_files?: Record<string, unknown>[]
          mark_scheme_files?: Record<string, unknown>[]
          total_possible_marks?: number | null
          evaluation_result?: Record<string, unknown> | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_paper_files?: Record<string, unknown>[]
          mark_scheme_files?: Record<string, unknown>[]
          total_possible_marks?: number | null
          evaluation_result?: Record<string, unknown> | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}