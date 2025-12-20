import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Users,
  UserPlus,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Search,
  Shield,
  Crown,
  LogOut,
  AlertCircle,
  Key
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DynamicBackground } from './BackgroundAnimation';

// Type definitions
interface AdminData {
  id: string;
  email: string;
  is_default_admin?: boolean;
  is_super_admin?: boolean;
  permissions?: Record<string, unknown>;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  evaluation_limit: number;
  evaluations_used: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  notes?: string;
}

interface AdminUser {
  id: string;
  email: string;
  is_default_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  created_by?: string;
}

interface AdminDashboardProps {
  adminData: AdminData;
  onLogout: () => void;
}

type AdminTab = 'settings' | 'users' | 'assign-admin';

export function AdminDashboard({ adminData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');
  const [globalSettings, setGlobalSettings] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash'
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Assign admin form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  // User management - track individual user input values
  const [userInputs, setUserInputs] = useState<{[key: string]: {limit: number, count: number}}>({});

  useEffect(() => {
    // Clear messages when switching tabs
    setMessage(null);
    setUserMessage(null);
    loadData();
  }, [activeTab]);

  // Load initial data when component mounts
  useEffect(() => {
    loadGlobalSettings(); // Always load settings on mount
  }, []);

  const loadData = async () => {
    try {
      if (activeTab === 'settings') {
        await loadGlobalSettings();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'assign-admin') {
        await loadAdmins();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadGlobalSettings = async () => {
    try {
      console.log('🔍 Loading global settings using safe function...');
      
      // Use the new safe function that always returns exactly one row
      const { data, error } = await supabase.rpc('get_global_settings');
      
      if (error) {
        console.error('❌ Failed to load global settings:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Global settings loaded successfully:', data);
        setGlobalSettings({
          geminiApiKey: data.api_key || '',
          geminiModel: data.model || 'gemini-2.5-flash'
        });
      } else {
        console.log('⚠️ No settings data returned, using defaults');
        setGlobalSettings({
          geminiApiKey: '',
          geminiModel: 'gemini-2.5-flash'
        });
      }
    } catch (error) {
      console.error('💥 Failed to load global settings:', error);
      // Set default values on error
      setGlobalSettings({
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash'
      });
    }
  };

  const loadUsers = async () => {
    console.log('🔍 Starting to load users...');
    setLoading(true);
    
    try {
      // Skip Edge Function and go directly to database
      console.log('📊 Querying user_profiles table directly...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profileError) {
        console.error('❌ Direct query failed:', profileError);
        setUserMessage({ type: 'error', text: `Database error: ${profileError.message}` });
        setUsers([]);
      } else {
        console.log('✅ Query successful! Found users:', profileData?.length || 0);
        console.log('📋 User data:', profileData);
        setUsers(profileData || []);
        
        if (profileData && profileData.length > 0) {
          setUserMessage({ type: 'success', text: `Loaded ${profileData.length} users successfully` });
        }
      }
    } catch (error) {
      console.error('💥 Load users error:', error);
      setUserMessage({ type: 'error', text: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}` });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      console.log('📋 Loading admin list...');
      
      // Use the new RPC function
      const { data, error } = await supabase.rpc('get_all_admins');
      
      if (error) {
        console.error('Failed to load admins:', error);
        setAdmins([]);
        return;
      }
      
      if (data && Array.isArray(data)) {
        console.log('✅ Admins loaded via RPC function:', data);
        setAdmins(data);
      } else {
        console.log('✅ No admins found or empty result');
        setAdmins([]);
      }
    } catch (error) {
      console.error('Failed to load admins:', error);
      setAdmins([]);
    }
  };

  const saveGlobalSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log('💾 Saving global settings using safe function...', globalSettings);
      
      // Use the new safe function that prevents multiple rows
      const { data, error } = await supabase.rpc('update_global_settings', {
        new_api_key: globalSettings.geminiApiKey,
        new_model: globalSettings.geminiModel
      });

      if (error) {
        console.error('❌ Failed to save global settings:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        setMessage({ 
          type: 'error', 
          text: `Database error: ${error.message} (Code: ${error.code})` 
        });
        return;
      }

      console.log('✅ Global settings saved successfully:', data);
      
      if (data && data.success) {
        setMessage({ type: 'success', text: 'Global settings saved successfully!' });
        // Reload settings to confirm the update
        await loadGlobalSettings();
      } else {
        console.warn('⚠️ Save completed but with unexpected response:', data);
        setMessage({ type: 'error', text: 'Settings save completed but response was unexpected' });
      }
      
    } catch (error) {
      console.error('💥 Save settings error:', error);
      
      // Try fallback: direct database update
      console.log('🔄 Trying fallback: direct database update...');
      try {
        const { data: updateData, error: updateError } = await supabase
          .from('global_settings')
          .update({
            gemini_api_key: globalSettings.geminiApiKey,
            gemini_model: globalSettings.geminiModel,
            updated_at: new Date().toISOString()
          })
          .eq('id', (await supabase.from('global_settings').select('id').limit(1).single()).data?.id);

        if (updateError) {
          console.error('❌ Fallback also failed:', updateError);
          throw updateError;
        }

        console.log('✅ Fallback save successful:', updateData);
        setMessage({ type: 'success', text: 'Settings saved successfully (using fallback method)!' });
        await loadGlobalSettings();
        return;
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
      }
      
      // More detailed error information
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      setMessage({ 
        type: 'error', 
        text: `Failed to save settings: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserLimit = async (userId: string, newLimit: number) => {
    try {
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('admin-api/user-limit', {
          method: 'POST',
          body: { userId, limit: newLimit }
        });

        if (!error && !data?.error) {
          await loadUsers();
          setUserMessage({ type: 'success', text: 'User limit updated successfully!' });
          return;
        }
      } catch (edgeFunctionError) {
        console.log('Edge function not available, using direct database approach');
      }

      // Fallback: Direct database update using RPC function
      const { data, error } = await supabase.rpc('update_user_evaluation_limit', {
        target_user_id: userId,
        new_limit: newLimit
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        await loadUsers();
        setUserMessage({ type: 'success', text: 'User limit updated successfully!' });
      } else {
        throw new Error('User not found or update failed');
      }
    } catch (error) {
      console.error('Update user limit error:', error);
      setUserMessage({ type: 'error', text: 'Failed to update user limit.' });
    }
  };

  const resetUserEvaluations = async (userId: string) => {
    try {
      // Reset user's evaluation count to 0
      const { data, error } = await supabase.rpc('reset_user_evaluation_count', {
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        await loadUsers();
        setUserMessage({ type: 'success', text: 'User evaluation count reset successfully!' });
      } else {
        throw new Error('User not found or reset failed');
      }
    } catch (error) {
      console.error('Reset user evaluation count error:', error);
      setUserMessage({ type: 'error', text: 'Failed to reset user evaluation count.' });
    }
  };

  const setUserEvaluationCount = async (userId: string, newCount: number) => {
    try {
      // Set user's evaluation count to specific value
      const { data, error } = await supabase.rpc('set_user_evaluation_count', {
        target_user_id: userId,
        new_count: newCount
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        await loadUsers();
        setUserMessage({ type: 'success', text: 'User evaluation count updated successfully!' });
      } else {
        throw new Error('User not found or update failed');
      }
    } catch (error) {
      console.error('Set user evaluation count error:', error);
      setUserMessage({ type: 'error', text: 'Failed to set user evaluation count.' });
    }
  };

  const assignAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      setMessage({ type: 'error', text: 'Please provide both email and password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log('🔧 Attempting to assign new admin:', newAdminEmail);
      
      // Hash the password
      const hashedPassword = await hashPasswordSimple(newAdminPassword);
      
      // Use the new RPC function
      const { data, error } = await supabase.rpc('assign_new_admin', {
        requester_email: adminData.email,
        new_admin_email: newAdminEmail,
        new_admin_password_hash: hashedPassword
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        console.log('✅ Admin assigned successfully via RPC');
        setNewAdminEmail('');
        setNewAdminPassword('');
        await loadAdmins();
        setMessage({ type: 'success', text: data.message });
      } else {
        throw new Error(data?.error || 'Failed to assign admin');
      }

    } catch (error) {
      console.error('💥 Admin assignment error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to assign admin.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple password hashing function (same as AdminLogin)
  const hashPasswordSimple = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'exam_evaluator_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const removeAdmin = async (adminEmail: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;

    try {
      console.log('🗑️ Attempting to remove admin:', adminEmail);
      
      // Use the new RPC function
      const { data, error } = await supabase.rpc('remove_admin', {
        requester_email: adminData.email,
        admin_to_remove_email: adminEmail
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        console.log('✅ Admin removed successfully via RPC');
        await loadAdmins();
        setMessage({ type: 'success', text: data.message });
      } else {
        throw new Error(data?.error || 'Failed to remove admin');
      }
    } catch (error) {
      console.error('💥 Admin removal error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to remove admin.' 
      });
    }
  };

  const handleLimitChange = async (userId: string, newLimit: number) => {
    // Update local state immediately for responsiveness
    setUsers(prevUsers => 
      prevUsers.map(user => 
        (user.user_id || user.id) === userId 
          ? { ...user, evaluation_limit: newLimit }
          : user
      )
    );
    
    // Update database
    await updateUserLimit(userId, newLimit);
  };

  const availableModels = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended - Latest)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Stable)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Legacy)' },
    { value: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview' }
  ];

  const navItems = [
    { id: 'settings' as AdminTab, label: 'Global Settings', icon: Settings },
    { id: 'users' as AdminTab, label: 'User Management', icon: Users },
    // Only show Admin Management for super admins or default admins
    ...(adminData.is_super_admin || adminData.is_default_admin ? [
      { id: 'assign-admin' as AdminTab, label: 'Admin Management', icon: UserPlus }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Stunning Dynamic Background */}
      <DynamicBackground variant="admin" />
      
      {/* Header */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm shadow-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
              <span className="text-sm text-slate-400">({adminData.email})</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-slate-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 flex-1
                  ${isActive 
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Status Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20' 
                : 'bg-red-500/10 backdrop-blur-sm border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {message.text}
            </p>
          </motion.div>
        )}

        {/* Content */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/20">
                  <Key className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Global API Configuration</h2>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {globalSettings.geminiApiKey ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">API Key Configured</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">API Key Required</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Global Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={globalSettings.geminiApiKey}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    placeholder="Enter global Gemini API key"
                    className="w-full px-4 py-3 pr-12 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  This API key will be used by all users for exam evaluation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Global Gemini Model
                </label>
                <select
                  title="Select Gemini Model"
                  value={globalSettings.geminiModel}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-slate-800/50 text-white"
                >
                  {availableModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveGlobalSettings}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : 'Save Global Settings'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">User Management</h2>
            </div>

            {/* User-specific message */}
            {userMessage && (
              <div className={`p-3 rounded-xl mb-4 ${
                userMessage.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-300 border border-red-500/20'
              }`}>
                {userMessage.text}
              </div>
            )}

            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-white">No Users Found</p>
                  <p className="text-sm">Users will appear here after they register for the service.</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.user_id || user.id} className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.email}</p>
                      <p className="text-sm text-slate-400">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-400">
                        Evaluations: {user.evaluations_used || 0} / {user.evaluation_limit || 5}
                      </p>
                      <p className="text-sm text-slate-500">
                        Status: {user.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Evaluation Limit Setting */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-slate-400">Limit:</label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={user.evaluation_limit || 5}
                          onChange={(e) => {
                            // Update local state immediately for UI responsiveness
                            const newLimit = parseInt(e.target.value) || 5;
                            setUsers(prevUsers => 
                              prevUsers.map(u => 
                                (u.user_id || u.id) === (user.user_id || user.id)
                                  ? { ...u, evaluation_limit: newLimit }
                                  : u
                              )
                            );
                          }}
                          className="w-20 px-2 py-1 text-sm border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-center bg-slate-800 text-white"
                          title="Type the evaluation limit"
                          placeholder="0"
                        />
                        <button
                          onClick={() => updateUserLimit(user.user_id || user.id, user.evaluation_limit || 5)}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/20"
                          title="Click to save the limit to database"
                        >
                          Set Limit
                        </button>
                      </div>
                      
                      {/* Evaluation Count Display (Read-only) */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-slate-400">Used:</label>
                        <div className="w-16 px-2 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-center text-white">
                          {user.evaluations_used || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'assign-admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Assign New Admin */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/20">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Assign New Admin</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter new admin email"
                    className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={assignAdmin}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{loading ? 'Assigning...' : 'Assign Admin'}</span>
              </motion.button>
            </div>

            {/* Current Admins */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Current Admins</h3>
                <button
                  onClick={loadAdmins}
                  className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Refresh admin list"
                >
                  Refresh
                </button>
              </div>
              {admins.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-white">No Admins Found</p>
                  <p className="text-sm">Loading admin data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((admin) => (
                  <div key={admin.id || admin.email} className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      {admin.isDefaultAdmin ? (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      ) : admin.isSuperAdmin ? (
                        <Shield className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {admin.email}
                          {admin.isDefaultAdmin && (
                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/20">
                              Default Admin
                            </span>
                          )}
                          {admin.isSuperAdmin && !admin.isDefaultAdmin && (
                            <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
                              Super Admin
                            </span>
                          )}
                          {!admin.isDefaultAdmin && !admin.isSuperAdmin && (
                            <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/20">
                              Regular Admin
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-400">
                          {admin.role || 'Regular Admin'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Created: {new Date(admin.createdAt || admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {admin.canBeRemoved !== false && !admin.isDefaultAdmin && (
                      <button
                        onClick={() => removeAdmin(admin.email)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}