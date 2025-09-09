import React, { useEffect, useState, useRef, useCallback } from 'react'
import { supabase, getSiteUrl } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Brain, Award, Target, Zap, ChevronLeft, ChevronRight, Shield, AlertTriangle } from 'lucide-react'
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

// Team information for carousel
const teamMembers = [
  {
    name: 'Md. Shakhawat Hossain',
    title: 'Undergraduate Student  | Lead Developer',
    department: 'Department of Electrical and Computer Engineering (ECE)',
    university: 'North South University',
    image: '/developer-photo.jpg'
  }
]

// Academic-themed background images
const academicImages = [
  {
    url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Knowledge Hub',
    description: 'Your gateway to academic excellence'
  },
  {
    url: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Learning Space',
    description: 'Advanced learning environment'
  },
  {
    url: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Academic Excellence',
    description: 'Pursuing knowledge and growth'
  },
  {
    url: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Study Focus',
    description: 'Dedicated learning sessions'
  }
]

// Dynamic background component to avoid inline styles
function DynamicBackground({ imageUrl, className }: { imageUrl: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--bg-image', `url(${imageUrl})`)
    }
  }, [imageUrl])
  
  return (
    <div 
      ref={ref}
      className={`${className} bg-dynamic`}
    />
  )
}

// Background image carousel
function BackgroundCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  // Preload images for smooth transitions
  useEffect(() => {
    const preloadImage = (src: string, index: number) => {
      const img = new Image()
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(index))
      }
      img.src = src
    }

    academicImages.forEach((image, index) => {
      preloadImage(image.url, index)
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % academicImages.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % academicImages.length)
  }, [])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + academicImages.length) % academicImages.length)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {academicImages.map((image, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            opacity: index === currentIndex && loadedImages.has(index) ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.05,
          }}
          transition={{ 
            duration: 2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 1.5 }
          }}
          className={`absolute inset-0 ${index === currentIndex ? 'carousel-layer-current' : 'carousel-layer-inactive'}`}
        >
          <DynamicBackground 
            imageUrl={image.url}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-blue-900/80 backdrop-blur-[0.5px]" />
        </motion.div>
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 -z-10" />

      {/* Navigation arrows */}
      <button
        onClick={prevImage}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/15 backdrop-blur-md text-white p-2 md:p-3 rounded-full hover:bg-white/25 transition-all duration-300 z-10 border border-white/20 shadow-lg"
        title="Previous image"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/15 backdrop-blur-md text-white p-2 md:p-3 rounded-full hover:bg-white/25 transition-all duration-300 z-10 border border-white/20 shadow-lg"
        title="Next image"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Image indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1.5 md:space-x-2 z-10">
        {academicImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
              index === currentIndex 
                ? 'bg-white scale-110 shadow-lg ring-2 ring-white/50' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            title={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image title overlay */}
      <motion.div
        key={`title-${currentIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-12 md:bottom-20 left-4 md:left-6 right-4 md:right-auto text-white z-10"
      >
        <h3 className="text-lg md:text-xl font-bold mb-1 drop-shadow-lg">{academicImages[currentIndex].title}</h3>
        <p className="text-white/90 text-sm md:text-base drop-shadow-md hidden sm:block">{academicImages[currentIndex].description}</p>
      </motion.div>
    </div>
  )
}

// Achievement stats
function AchievementStats() {
  const stats = [
    { label: 'A* Grades', value: '95%', icon: Award },
    { label: 'Pass Rate', value: '98%', icon: Target },
    { label: 'AI Accuracy', value: '99.7%', icon: Brain },
  ]

  return (
    <div className="absolute top-4 md:top-6 left-2 md:left-6 space-y-2 md:space-y-3 z-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-white/10 backdrop-blur-md text-white px-3 md:px-4 py-2 rounded-lg border border-white/20 shadow-lg"
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{stat.label}</p>
                <p className="text-sm md:text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-md"
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
  const [currentTeamMember, setCurrentTeamMember] = useState(0)

  // Auto-rotate team members carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTeamMember((prev) => (prev + 1) % teamMembers.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <BackgroundCarousel />
        <SupabaseSetupWarning />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <BackgroundCarousel />
        <AchievementStats />
        <SupabaseSetupWarning />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-20 w-full max-w-xl md:max-w-2xl"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20" />
          
          <div className="relative p-6 md:p-8 rounded-2xl">
            {/* Header with animated logo */}
            <div className="text-center mb-6 md:mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Brain className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                AI Exam Evaluator
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-white/90 font-medium text-sm md:text-base leading-relaxed"
              >
                {authMode === 'signin' ? 'Welcome back! Sign in to continue' : 'Join thousands of students achieving excellence'}
              </motion.p>
              
              {/* Team Information Carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 relative"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 relative">
                    <motion.img 
                      key={currentTeamMember}
                      src={teamMembers[currentTeamMember].image}
                      alt={teamMembers[currentTeamMember].name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hidden absolute inset-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <motion.div
                      key={`info-${currentTeamMember}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <p className="text-white font-semibold text-sm">{teamMembers[currentTeamMember].name}</p>
                      <p className="text-white/80 text-xs leading-tight">{teamMembers[currentTeamMember].title}</p>
                      <p className="text-white/70 text-xs leading-tight">{teamMembers[currentTeamMember].department}</p>
                      <p className="text-white/70 text-xs">{teamMembers[currentTeamMember].university}</p>
                    </motion.div>
                  </div>
                </div>
                
                {/* Manual navigation buttons */}
                <div className="absolute right-2 top-2 flex space-x-1">
                  <button
                    onClick={() => setCurrentTeamMember((prev) => (prev - 1 + teamMembers.length) % teamMembers.length)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Previous"
                  >
                    <ChevronLeft className="w-3 h-3 text-white/70" />
                  </button>
                  <button
                    onClick={() => setCurrentTeamMember((prev) => (prev + 1) % teamMembers.length)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Next"
                  >
                    <ChevronRight className="w-3 h-3 text-white/70" />
                  </button>
                </div>
                
                {/* Progress indicators */}
                <div className="flex justify-center mt-3 space-x-1">
                  {teamMembers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTeamMember(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTeamMember ? 'bg-white/80' : 'bg-white/30'
                      }`}
                      title={teamMembers[index].name}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              onSubmit={handleAuth}
              className="space-y-5 md:space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60 text-base"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60 text-base"
                    placeholder="Enter your password"
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 md:p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {signupSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 md:p-4 bg-green-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-200 text-sm font-medium">Account created successfully!</p>
                      <p className="text-green-300/80 text-xs mt-1">
                        Please check your email and click the confirmation link to activate your account before signing in.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={authLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200"
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
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 text-center space-y-4"
            >
              <button
                onClick={handleModeSwitch}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Create one now" 
                  : "Already have an account? Sign in"
                }
              </button>

              {/* Admin Access */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="flex items-center space-x-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 mx-auto"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Administrator Login</span>
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-2">
                  Admin access requires existing credentials
                </p>
              </div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 pt-6 border-t border-white/20"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto">
                    <Brain className="w-4 h-4 text-yellow-300" />
                  </div>
                  <p className="text-xs text-white/80 font-medium">AI Powered</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto">
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </div>
                  <p className="text-xs text-white/80 font-medium">Lightning Fast</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto">
                    <Award className="w-4 h-4 text-yellow-300" />
                  </div>
                  <p className="text-xs text-white/80 font-medium">Precise Grading</p>
                </div>
              </div>
            </motion.div>

            {/* Made With Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-8 pt-6 border-t border-white/20"
            >
              <motion.h3
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="text-xl font-black text-center mb-4"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(59,130,246,0.5)',
                  letterSpacing: '0.1em'
                }}
              >
                <span className="text-blue-500 drop-shadow-lg">M</span>
                <span className="text-red-500 drop-shadow-lg">a</span>
                <span className="text-yellow-500 drop-shadow-lg">d</span>
                <span className="text-blue-500 drop-shadow-lg">e</span>
                <span className="text-green-500 drop-shadow-lg"> W</span>
                <span className="text-red-500 drop-shadow-lg">i</span>
                <span className="text-yellow-500 drop-shadow-lg">t</span>
                <span className="text-blue-500 drop-shadow-lg">h</span>
              </motion.h3>
              
              <div className="flex justify-center items-center space-x-4 overflow-visible bg-gradient-to-r from-white/95 via-blue-50/95 to-white/95 backdrop-blur-sm rounded-xl px-4 py-6 border border-white/30 shadow-xl relative min-w-full">
                {/* Animated background effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
                      "linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)",
                      "linear-gradient(90deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {[
                  { src: '/kiro.jpg', name: 'Kiro', delay: 0.2, color: 'from-green-400 to-green-600' },
                  { src: '/gemini.png', name: 'Gemini', delay: 0, color: 'from-blue-400 to-blue-600' },
                  { src: '/netlify.jpg', name: 'Netlify', delay: 0.4, color: 'from-teal-400 to-teal-600' },
                  { src: '/supabase.jpg', name: 'Supabase', delay: 0.6, color: 'from-orange-400 to-orange-600' },
                  { src: '/namecheap.jpg', name: 'Namecheap', delay: 0.8, color: 'from-purple-400 to-purple-600' }
                ].map((logo, index) => (
                  <motion.div
                    key={logo.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -4, 0],
                    }}
                    transition={{
                      opacity: { duration: 0.4, delay: 1.2 + logo.delay },
                      scale: { duration: 0.4, delay: 1.2 + logo.delay, type: "spring", bounce: 0.2 },
                      y: { 
                        duration: 4 + index * 0.5,
                        delay: 2 + logo.delay,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    className="relative group cursor-pointer"
                  >
                    {/* Simplified ring animation */}
                    <motion.div
                      className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r ${logo.color} opacity-10 -z-10`}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                      }}
                      transition={{
                        duration: 3,
                        delay: logo.delay + 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 shadow-lg transition-all duration-200 flex items-center justify-center border-2 border-gray-700 relative z-10">
                      {/* Simplified shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 3,
                          delay: logo.delay + 2,
                          repeat: Infinity,
                          repeatDelay: 4
                        }}
                      />
                      
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="w-18 h-18 object-contain rounded-lg relative z-20 transition-all duration-200 brightness-100 contrast-110"
                        loading="lazy"
                        onError={(e) => {
                          if (logo.name === 'Bolt.new') {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMxRjIwMjQiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTMgMkwzIDEySDlMMTEgMjJMMjEgMTJIMTVMMTMgMloiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cjwvc3ZnPgo='
                          }
                        }}
                      />
                    </div>
                    
                    {/* Enhanced tooltip with animations */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.5, rotateX: -90 }}
                      whileHover={{ 
                        opacity: 1, 
                        y: -20, 
                        scale: 1, 
                        rotateX: 0,
                        transition: { 
                          type: "spring", 
                          bounce: 0.4, 
                          duration: 0.6 
                        }
                      }}
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-black text-white text-xs px-4 py-2 rounded-lg whitespace-nowrap z-50 shadow-2xl border border-gray-600"
                    >
                      <motion.span
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent font-semibold"
                        style={{
                          backgroundSize: '200% 100%'
                        }}
                      >
                        {logo.name}
                      </motion.span>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      
                      {/* Tooltip glow */}
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        animate={{
                          opacity: [0, 0.8, 0],
                          scale: [0.95, 1.05, 0.95]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>

                    {/* Enhanced glow effects */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      animate={{
                        boxShadow: [
                          `0 0 0 rgba(59, 130, 246, 0)`,
                          `0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)`,
                          `0 0 0 rgba(59, 130, 246, 0)`
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: 3 + logo.delay,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Success burst animation */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: 4 + logo.delay,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((sparkle) => (
                        <motion.div
                          key={sparkle}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          animate={{
                            x: [0, Math.cos(sparkle * 60 * Math.PI / 180) * 30],
                            y: [0, Math.sin(sparkle * 60 * Math.PI / 180) * 30],
                            opacity: [1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            delay: sparkle * 0.1 + logo.delay + 4,
                            repeat: Infinity,
                            repeatDelay: 4
                          }}
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Animated wave separator */}
              <motion.div
                className="flex justify-center mt-6"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.5, delay: 3.5 }}
              >
                <motion.svg
                  width="200"
                  height="20"
                  viewBox="0 0 200 20"
                  className="text-gray-300"
                  animate={{
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.path
                    d="M0,10 Q50,2 100,10 T200,10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 3.5, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M0,10 Q50,18 100,10 T200,10"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                    opacity={0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 4, ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.div>

              {/* Powered by text with enhanced animations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 4.5 }}
                className="text-center mt-4"
              >
                <motion.p
                  className="text-lg font-black"
                  style={{ 
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(59,130,246,0.5)',
                    letterSpacing: '0.05em'
                  }}
                  animate={{
                    color: [
                      '#3b82f6',
                      '#ef4444',
                      '#eab308',
                      '#22c55e',
                      '#3b82f6'
                    ]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-blue-500 drop-shadow-lg">P</span>
                  <span className="text-red-500 drop-shadow-lg">o</span>
                  <span className="text-yellow-500 drop-shadow-lg">w</span>
                  <span className="text-blue-500 drop-shadow-lg">e</span>
                  <span className="text-green-500 drop-shadow-lg">r</span>
                  <span className="text-red-500 drop-shadow-lg">e</span>
                  <span className="text-yellow-500 drop-shadow-lg">d</span>
                  <span className="text-blue-500 drop-shadow-lg"> b</span>
                  <span className="text-green-500 drop-shadow-lg">y</span>
                  <span className="text-red-500 drop-shadow-lg"> c</span>
                  <span className="text-yellow-500 drop-shadow-lg">u</span>
                  <span className="text-blue-500 drop-shadow-lg">t</span>
                  <span className="text-green-500 drop-shadow-lg">t</span>
                  <span className="text-red-500 drop-shadow-lg">i</span>
                  <span className="text-yellow-500 drop-shadow-lg">n</span>
                  <span className="text-blue-500 drop-shadow-lg">g</span>
                  <span className="text-green-500 drop-shadow-lg">-</span>
                  <span className="text-red-500 drop-shadow-lg">e</span>
                  <span className="text-yellow-500 drop-shadow-lg">d</span>
                  <span className="text-blue-500 drop-shadow-lg">g</span>
                  <span className="text-green-500 drop-shadow-lg">e</span>
                  <span className="text-red-500 drop-shadow-lg"> t</span>
                  <span className="text-yellow-500 drop-shadow-lg">e</span>
                  <span className="text-blue-500 drop-shadow-lg">c</span>
                  <span className="text-green-500 drop-shadow-lg">h</span>
                  <span className="text-red-500 drop-shadow-lg">n</span>
                  <span className="text-yellow-500 drop-shadow-lg">o</span>
                  <span className="text-blue-500 drop-shadow-lg">l</span>
                  <span className="text-green-500 drop-shadow-lg">o</span>
                  <span className="text-red-500 drop-shadow-lg">g</span>
                  <span className="text-yellow-500 drop-shadow-lg">y</span>
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {children}
    </div>
  )
}
