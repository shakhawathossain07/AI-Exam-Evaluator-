import React, { useEffect, useState, useCallback } from 'react'
import { supabase, getSiteUrl, isMissingEnvVars } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Brain, Shield, AlertTriangle, FileText, BarChart3, Clock, Play, AlertCircle } from 'lucide-react'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'
import { setupDefaultAdmin } from '../services/api'

interface AuthWrapperProps {
  children: React.ReactNode
}

interface AdminData {
  id: string;
  email: string;
  is_default_admin?: boolean;
  is_super_admin?: boolean;
  permissions?: Record<string, unknown>;
}

// Feature workflow steps inspired by Devin design
const workflowSteps = [
  {
    step: 1,
    title: 'Upload',
    description: 'Upload exam papers in PDF format',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Evaluate',
    description: 'AI analyzes and grades responses',
    icon: Brain,
  },
  {
    step: 3,
    title: 'Review',
    description: 'Review scores and detailed feedback',
    icon: BarChart3,
  },
  {
    step: 4,
    title: 'Export',
    description: 'Export results and track history',
    icon: Clock,
  },
]

// YouTube Video Component
function YouTubeEmbed() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoId = '7n9bQw8xM5s'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-700/50 shadow-2xl"
    >
      <div className="aspect-video w-full">
        {!isPlaying ? (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="AI Exam Evaluator Demo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </div>
            </motion.div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/90 text-sm font-medium">Watch Demo: See AI Exam Evaluator in Action</p>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="AI Exam Evaluator Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    </motion.div>
  )
}

// Workflow Step Card Component
function WorkflowCard({ step, title, description, icon: Icon, index }: {
  step: number
  title: string
  description: string
  icon: React.ElementType
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-cyan-400" />
          <h4 className="text-white font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// Supabase Setup Warning
function SupabaseSetupWarning() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  const needsSetup = !supabaseUrl || !supabaseKey || 
    supabaseUrl.includes('your-project-ref') || 
    supabaseKey.includes('your-anon-key')

  if (!needsSetup) return null

  // If completely missing, show full-page error
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Error</h1>
          <p className="text-slate-400 mb-6">
            The application is missing required environment variables. Please ensure the following are configured in your Netlify dashboard:
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 text-left mb-6">
            <code className="text-sm">
              <div className={`mb-2 ${supabaseUrl ? 'text-green-400' : 'text-red-400'}`}>
                VITE_SUPABASE_URL: {supabaseUrl ? '✓ Set' : '✗ Missing'}
              </div>
              <div className={supabaseKey ? 'text-green-400' : 'text-red-400'}>
                VITE_SUPABASE_ANON_KEY: {supabaseKey ? '✓ Set' : '✗ Missing'}
              </div>
            </code>
          </div>
          <p className="text-slate-500 text-sm">
            After adding the variables, trigger a new deploy in Netlify.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
    >
      <div className="bg-amber-500/90 backdrop-blur-sm text-white p-4 rounded-lg border border-amber-400/50 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-100 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-100 mb-1">Supabase Setup Required</h3>
            <p className="text-amber-100 text-sm mb-2">
              Please set up your Supabase project to use this application.
            </p>
            <p className="text-amber-200 text-xs">
              Check SUPABASE_SETUP.md for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminData, setAdminData] = useState<AdminData | null>(null)

  useEffect(() => {
    // Handle auth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      if (urlParams.get('type') === 'signup' || hashParams.get('type') === 'signup') {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleAuthCallback()

    // Check URL parameters for admin access
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true)
    }
    
    // Setup default admin on app start
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    const isConfigured = supabaseUrl && supabaseKey && 
      !supabaseUrl.includes('your-project-ref') && 
      !supabaseKey.includes('your-anon-key')

    if (isConfigured) {
      setupDefaultAdmin().catch(() => {
        // Silently ignore admin setup errors during initialization
      })
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        await supabase.auth.signOut()
        setUser(null)
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    setSignupSuccess(false)

    try {
      if (authMode === 'signup') {
        // Validate email provider - only allow Gmail, Outlook, and Yahoo
        const emailLower = email.toLowerCase().trim()
        const allowedDomains = [
          'gmail.com',
          'outlook.com',
          'outlook.co.uk',
          'hotmail.com',
          'hotmail.co.uk',
          'live.com',
          'live.co.uk',
          'msn.com',
          'yahoo.com',
          'yahoo.co.uk',
          'yahoo.co.in',
          'ymail.com'
        ]
        
        const emailDomain = emailLower.split('@')[1]
        const isEduEmail = emailDomain && emailDomain.endsWith('.edu')
        if (!emailDomain || (!allowedDomains.includes(emailDomain) && !isEduEmail)) {
          throw new Error('Please use a valid Gmail, Outlook, Yahoo, or .edu email address to create an account.')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSiteUrl()}/auth/callback`
          }
        })
        if (error) throw error
        
        setSignupSuccess(true)
        setEmail('')
        setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleModeSwitch = useCallback(() => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setSignupSuccess(false)
    setEmail('')
    setPassword('')
  }, [authMode])

  const handleAdminLogin = useCallback((adminData: AdminData) => {
    setAdminData(adminData)
    setShowAdminLogin(false)
  }, [])

  const handleAdminLogout = useCallback(() => {
    setAdminData(null)
  }, [])

  const handleBackToUser = useCallback(() => {
    setShowAdminLogin(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <SupabaseSetupWarning />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white font-medium text-lg">Initializing AI Exam Evaluator...</p>
        </div>
      </div>
    )
  }

  // Show admin dashboard if admin is logged in
  if (adminData) {
    return <AdminDashboard adminData={adminData} onLogout={handleAdminLogout} />
  }

  // Show admin login if requested
  if (showAdminLogin) {
    return (
      <AdminLogin 
        onAdminLogin={handleAdminLogin} 
        onBackToUser={handleBackToUser}
      />
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <SupabaseSetupWarning />
        
        {/* Gradient background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Panel - Branding & Info */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
                className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/30"
              >
                <Brain className="w-9 h-9 text-white" />
              </motion.div>

              {/* Main Headline - Devin style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                  <span className="text-cyan-400">AI Exam</span> Evaluator,
                  <br />
                  <span className="text-slate-300">the intelligent</span>
                  <br />
                  <span className="text-slate-300">grading assistant</span>
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-slate-400 text-lg xl:text-xl mb-10 max-w-lg"
              >
                Transform your exam grading with AI-powered evaluation. Upload, analyze, and get instant feedback.
              </motion.p>

              {/* YouTube Video Section */}
              <div className="mb-10">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4"
                >
                  See how it works
                </motion.h3>
                <YouTubeEmbed />
              </div>

              {/* Workflow Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">How it works</h3>
                <div className="grid grid-cols-2 gap-3">
                  {workflowSteps.map((step, index) => (
                    <WorkflowCard
                      key={step.step}
                      step={step.step}
                      title={step.title}
                      description={step.description}
                      icon={step.icon}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-md"
            >
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">AI Exam Evaluator</h1>
                <p className="text-slate-400 text-sm">Intelligent grading assistant</p>
              </div>

              {/* Auth Card */}
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {authMode === 'signin' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {authMode === 'signin' 
                      ? 'Sign in to continue to your dashboard' 
                      : 'Get started with your free account'}
                  </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleAuth} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 text-white placeholder-slate-500"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 text-white placeholder-slate-500"
                        placeholder="••••••••"
                        autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {signupSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                    >
                      <p className="text-green-400 text-sm font-medium">Account created successfully!</p>
                      <p className="text-green-400/70 text-xs mt-1">
                        Check your email for the confirmation link.
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={authLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-200"
                  >
                    {authLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        {authMode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Mode Switch */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleModeSwitch}
                    className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>

                {/* Admin Access */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 py-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Administrator Login</span>
                  </button>
                </div>
              </div>

              {/* Mobile Video Section */}
              <div className="lg:hidden mt-8">
                <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4 text-center">
                  See how it works
                </h3>
                <YouTubeEmbed />
              </div>

              {/* Made With Section - Compact for login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-slate-500 text-xs mb-4">Made with</p>
                <div className="flex justify-center items-center space-x-3">
                  {[
                    { src: '/kiro.jpg', name: 'Kiro' },
                    { src: '/gemini.png', name: 'Gemini' },
                    { src: '/netlify.jpg', name: 'Netlify' },
                    { src: '/supabase.jpg', name: 'Supabase' },
                  ].map((logo) => (
                    <motion.div
                      key={logo.name}
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 p-1"
                      title={logo.name}
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {children}
    </div>
  )
}
