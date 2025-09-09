import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogIn, AlertCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Team information for carousel
const teamMembers = [
  {
    name: 'Md. Shakhawat Hossain',
    title: 'Undergraduate Student | Lead Developer',
    department: 'Department of Electrical and Computer Engineering (ECE)',
    university: 'North South University',
    image: '/developer-photo.jpg'
  }
]

interface AdminData {
  id: string;
  email: string;
  is_default_admin?: boolean;
  is_super_admin?: boolean;
  permissions?: Record<string, unknown>;
}

interface AdminLoginProps {
  onAdminLogin: (adminData: AdminData) => void;
  onBackToUser: () => void;
}

export function AdminLogin({ onAdminLogin, onBackToUser }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTeamMember, setCurrentTeamMember] = useState(0);

  // Auto-rotate team members carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTeamMember((prev) => (prev + 1) % teamMembers.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

  // Custom password hashing function (same as edge function)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'exam_evaluator_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('admin-api', {
          body: { 
            action: 'login',
            email, 
            password 
          },
          method: 'POST'
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        onAdminLogin(data);
        return;
      } catch {
        // Edge function not available, using direct database approach
        
        // Fallback: Direct database query for development
        const { data: adminUser, error: queryError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (queryError) {
          if (queryError.code === 'PGRST116') {
            throw new Error('No admin account found with this email. Please register first.');
          }
          // Show the actual database error for debugging
          throw new Error(`Database error: ${queryError.message} (Code: ${queryError.code})`);
        }

        if (!adminUser) {
          throw new Error('No admin account found with this email. Please register first.');
        }

        if (!adminUser.password_hash) {
          throw new Error('Invalid account configuration');
        }

        // Compare password with hash
        const hashedInputPassword = await hashPassword(password);

        const isValidPassword = hashedInputPassword === adminUser.password_hash;

        if (!isValidPassword) {
          throw new Error('Invalid password');
        }
        
        // Get admin permissions using the new RPC function
        const { data: permissions, error: permError } = await supabase.rpc('check_admin_permissions', {
          admin_email: adminUser.email
        });
        
        if (permError) {
          // Fall back to original data if RPC fails
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password_hash, ...adminData } = adminUser;
          onAdminLogin(adminData);
        } else {
          // Merge original admin data with permissions
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password_hash, ...adminData } = adminUser;
          const completeAdminData = {
            ...adminData,
            ...permissions,
            // Ensure backward compatibility with existing field names
            is_super_admin: permissions.isSuperAdmin,
            is_default_admin: permissions.isDefaultAdmin
          };
          onAdminLogin(completeAdminData);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="adminGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>
              <circle cx="30" cy="30" r="2" fill="rgba(255, 255, 255, 0.4)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminGrid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20" />
        
        {/* Content */}
        <div className="relative p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Admin Portal
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white/90 font-medium"
            >
              Secure administrative access
            </motion.p>
          </div>

          {/* Team Information Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 relative"
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
                    // Fallback to generic avatar if image fails to load
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
                  key={`admin-info-${currentTeamMember}`}
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

          {/* Information Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-blue-200 font-medium text-sm mb-1">Administrator Access</h3>
                <p className="text-blue-200/80 text-xs">
                  Sign in with your existing admin credentials. Only authorized administrators can access this portal.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-semibold text-white/90 mb-2">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter admin email"
                />
              </div>

              <div>
                <label htmlFor="adminPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Admin Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-300" />
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Access Admin Portal</span>
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
              onClick={onBackToUser}
              className="text-white/90 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              ← Back to User Login
            </button>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg backdrop-blur-sm"
          >
            <p className="text-amber-200 text-xs text-center">
              🔒 This is a secure administrative area. All access attempts are logged and monitored.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}