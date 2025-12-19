import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminRegistrationProps {
  onAdminLogin: (adminData: any) => void;
  onBackToLogin: () => void;
}

export function AdminRegistration({ onAdminLogin, onBackToLogin }: AdminRegistrationProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Custom password hashing function (same as edge function)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'exam_evaluator_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Email domain validation - only allow Gmail, Outlook, Yahoo, and .edu emails
    const allowedDomains = [
      'gmail.com',
      'outlook.com', 'outlook.co.uk', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'live.co.uk', 'msn.com',
      'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com'
    ];
    const emailDomain = email.toLowerCase().split('@')[1];
    const isEduEmail = emailDomain && emailDomain.endsWith('.edu');
    if (!emailDomain || (!allowedDomains.includes(emailDomain) && !isEduEmail)) {
      setError('Please use a valid Gmail, Outlook, Yahoo, or .edu email address to create an account.');
      setLoading(false);
      return;
    }

    try {
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('admin-api', {
          body: { 
            action: 'register',
            email, 
            password 
          },
          method: 'POST'
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setSuccess(true);
        setTimeout(() => {
          onAdminLogin(data);
        }, 2000);
        return;
      } catch (edgeFunctionError) {
        console.log('Edge function not available, using direct database approach');
        console.log('Edge function error:', edgeFunctionError);
        
        // Fallback: Direct database insertion for development
        const hashedPassword = await hashPassword(password);
        
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', email)
          .single();

        console.log('Existing admin check:', { existingAdmin, checkError });

        if (existingAdmin) {
          throw new Error('Admin with this email already exists');
        }

        // Try to insert new admin directly using service role
        console.log('Attempting to insert admin with email:', email);
        console.log('Password hash length:', hashedPassword.length);

        // Try using a manual SQL approach with RPC
        let newAdmin = null;
        try {
          const { data: rpcResult, error: insertError } = await supabase.rpc('create_admin_user', {
            admin_email: email,
            admin_password_hash: hashedPassword
          });

          if (insertError) throw insertError;
          newAdmin = rpcResult;
          
          // If RPC doesn't exist, fall back to direct insert
          if (!newAdmin) {
            throw new Error('RPC function not available');
          }
        } catch (rpcError) {
          console.log('RPC failed, trying direct insert:', rpcError);
          
          // Final fallback: direct insert (this might fail due to RLS)
          const { data: directInsertResult, error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email,
              password_hash: hashedPassword,
              is_default_admin: false
            })
            .select()
            .single();

          if (insertError) {
            // Provide helpful error message about RLS
            if (insertError.code === '42501' || insertError.message.includes('policy')) {
              throw new Error('Database security policy prevents registration. Please run the SQL fix script in your Supabase dashboard first.');
            }
            // Show the actual error for debugging
            throw new Error(`Database error: ${insertError.message} (Code: ${insertError.code})`);
          }

          if (!directInsertResult) {
            throw new Error('Failed to create admin user');
          }
          
          newAdmin = directInsertResult;
        }

        console.log('Insert result:', { newAdmin });

        if (!newAdmin) {
          throw new Error('Failed to create admin user');
        }

        setSuccess(true);
        setTimeout(() => {
          const { password_hash, ...adminData } = newAdmin;
          onAdminLogin(adminData);
        }, 2000);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 w-full max-w-md mx-4"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20" />
          
          <div className="relative p-8 rounded-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Registration Successful!</h1>
            <p className="text-white/90 mb-4">
              Your admin account has been created successfully.
            </p>
            <p className="text-white/70 text-sm">
              Redirecting to admin portal...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

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
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Admin Registration
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white/90 font-medium"
            >
              Create your administrator account
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onSubmit={handleRegister}
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="adminPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60"
                    placeholder="Enter password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-white placeholder-white/60"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Admin Account</span>
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <button
              onClick={onBackToLogin}
              className="text-white/90 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              ← Back to Admin Login
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
              🔒 Your admin account will have full system access. Keep your credentials secure.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}