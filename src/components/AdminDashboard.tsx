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
    geminiModel: 'gemini-2.0-flash'
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
          geminiModel: data.model || 'gemini-2.0-flash'
        });
      } else {
        console.log('⚠️ No settings data returned, using defaults');
        setGlobalSettings({
          geminiApiKey: '',
          geminiModel: 'gemini-1.5-flash'
        });
      }
    } catch (error) {
      console.error('💥 Failed to load global settings:', error);
      // Set default values on error
      setGlobalSettings({
        geminiApiKey: '',
        geminiModel: 'gemini-1.5-flash'
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
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended - Stable)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Stable)' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
    { value: 'gemini-exp-1206', label: 'Gemini 2.5 Flash (Latest Experimental)' }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
              <span className="text-sm text-gray-500">({adminData.email})</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-white/20">
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
                  relative px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 flex-1
                  ${isActive 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-red-100 rounded-lg -z-10"
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
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50/80 backdrop-blur-sm border border-green-200' 
                : 'bg-red-50/80 backdrop-blur-sm border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
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
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800">Global API Configuration</h2>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {globalSettings.geminiApiKey ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">API Key Configured</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-600">API Key Required</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={globalSettings.geminiApiKey}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    placeholder="Enter global Gemini API key"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This API key will be used by all users for exam evaluation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Gemini Model
                </label>
                <select
                  title="Select Gemini Model"
                  value={globalSettings.geminiModel}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm"
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
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            </div>

            {/* User-specific message */}
            {userMessage && (
              <div className={`p-3 rounded-lg mb-4 ${
                userMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {userMessage.text}
              </div>
            )}

            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Users Found</p>
                  <p className="text-sm">Users will appear here after they register for the service.</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.user_id || user.id} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Evaluations: {user.evaluations_used || 0} / {user.evaluation_limit || 5}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {user.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Evaluation Limit Setting */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Limit:</label>
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
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center"
                          title="Type the evaluation limit"
                          placeholder="0"
                        />
                        <button
                          onClick={() => updateUserLimit(user.user_id || user.id, user.evaluation_limit || 5)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                          title="Click to save the limit to database"
                        >
                          Set Limit
                        </button>
                      </div>
                      
                      {/* Evaluation Count Display (Read-only) */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Used:</label>
                        <div className="w-16 px-2 py-1 text-sm bg-gray-100 border border-gray-200 rounded text-center text-gray-700">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <UserPlus className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800">Assign New Admin</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter new admin email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={assignAdmin}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Current Admins</h3>
                <button
                  onClick={loadAdmins}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  title="Refresh admin list"
                >
                  Refresh
                </button>
              </div>
              {admins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Admins Found</p>
                  <p className="text-sm">Loading admin data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((admin) => (
                  <div key={admin.id || admin.email} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {admin.isDefaultAdmin ? (
                        <Crown className="w-5 h-5 text-yellow-600" />
                      ) : admin.isSuperAdmin ? (
                        <Shield className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Shield className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {admin.email}
                          {admin.isDefaultAdmin && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Default Admin
                            </span>
                          )}
                          {admin.isSuperAdmin && !admin.isDefaultAdmin && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              Super Admin
                            </span>
                          )}
                          {!admin.isDefaultAdmin && !admin.isSuperAdmin && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Regular Admin
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {admin.role || 'Regular Admin'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(admin.createdAt || admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {admin.canBeRemoved !== false && !admin.isDefaultAdmin && (
                      <button
                        onClick={() => removeAdmin(admin.email)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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