import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogIn, AlertCircle, Info, ArrowLeft, Lock, Users, Settings, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Admin feature cards
const adminFeatures = [
  {
    icon: Users,
    title: 'User Management',
    description: 'Manage user accounts and permissions',
  },
  {
    icon: Settings,
    title: 'System Config',
    description: 'Configure application settings',
  },
  {
    icon: Activity,
    title: 'Analytics',
    description: 'View usage statistics and reports',
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Monitor and manage security settings',
  },
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="adminGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminGrid)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-red-500/30"
            >
              <Shield className="w-9 h-9 text-white" />
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                <span className="text-red-400">Admin</span> Portal,
                <br />
                <span className="text-slate-300">secure access</span>
                <br />
                <span className="text-slate-300">full control</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-slate-400 text-lg xl:text-xl mb-10 max-w-lg"
            >
              Manage users, configure settings, and monitor your AI Exam Evaluator system from one central dashboard.
            </motion.p>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-3"
            >
              <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">Admin Capabilities</h3>
              <div className="grid grid-cols-2 gap-3">
                {adminFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-red-500/30 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">All access attempts are logged and monitored</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Login Form */}
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
                className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
              <p className="text-slate-400 text-sm">Secure administrative access</p>
            </div>

            {/* Login Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Administrator Login</h2>
                <p className="text-slate-400 text-sm">
                  Sign in with your admin credentials
                </p>
              </div>

              {/* Info Notice */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 text-xs">
                      Only authorized administrators can access this portal. Contact your system admin if you need access.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Email
                    </label>
                    <input
                      id="adminEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-white placeholder-slate-500"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="adminPassword" className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Password
                    </label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-white placeholder-slate-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg shadow-red-500/25 transition-all duration-200"
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
              </form>

              {/* Back to User Login */}
              <div className="mt-6 text-center">
                <button
                  onClick={onBackToUser}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to User Login</span>
                </button>
              </div>
            </div>

            {/* Mobile Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:hidden mt-6 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-xs font-medium">Access attempts are monitored</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}