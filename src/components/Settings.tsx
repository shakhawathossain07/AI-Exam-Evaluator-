import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Settings as SettingsIcon, Shield, Database, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Settings() {
  const [globalSettings, setGlobalSettings] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash'
  });
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [debugResult, setDebugResult] = useState<string>('');

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      console.log('🔍 Loading global settings using safe RPC function...');
      
      // Use the new safe RPC function that always returns exactly one row
      const { data, error } = await supabase.rpc('get_global_settings');
      
      if (error) {
        console.error('❌ Failed to load global settings via RPC:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Global settings loaded successfully:', data);
        setGlobalSettings({
          geminiApiKey: data.api_key || '',
          geminiModel: data.model || 'gemini-2.5-flash'
        });
        
        // Check if API key is actually configured (not empty and has reasonable length)
        const hasValidApiKey = data.api_key && 
                              data.api_key.trim() !== '' && 
                              data.api_key.length > 20;
        
        setIsApiConfigured(hasValidApiKey);
        
        if (hasValidApiKey) {
          setMessage({ 
            type: 'info', 
            text: 'API configuration is managed globally by administrators. You can start evaluating papers immediately!' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Global API configuration not found. Please contact your administrator.' 
          });
        }
      } else {
        console.log('⚠️ No settings data returned from RPC');
        setIsApiConfigured(false);
        setMessage({ 
          type: 'error', 
          text: 'Global API configuration not found. Please contact your administrator.' 
        });
      }
    } catch (error) {
      console.error('💥 Failed to load global settings:', error);
      setIsApiConfigured(false);
      setMessage({ 
        type: 'error', 
        text: 'Unable to load global settings. Please contact your administrator.' 
      });
      
      // Set default values on error
      setGlobalSettings({
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash'
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug function to test database access (sanitized)
  const testDatabaseAccess = async () => {
    try {
      console.log('=== TESTING DATABASE ACCESS ===');
      
      // Test 1: Check if we can connect to Supabase
      const { data: authData } = await supabase.auth.getUser();
      console.log('Auth status:', authData.user ? 'Authenticated' : 'Anonymous');
      
      // Test 2: Try to select from global_settings
      const { data, error, count } = await supabase
        .from('global_settings')
        .select('*', { count: 'exact' });
      
      console.log('Database query result:', { data, error, count });
      
      if (error) {
        setDebugResult(`ERROR: ${error.message}`);
      } else {
        // Sanitize the data to hide sensitive information
        const sanitizedData = data?.map(item => ({
          id: item.id,
          gemini_model: item.gemini_model,
          has_api_key: item.gemini_api_key ? 'YES' : 'NO',
          api_key_length: item.gemini_api_key ? item.gemini_api_key.length : 0,
          updated_at: item.updated_at,
          updated_by: item.updated_by
        }));
        
        setDebugResult(`SUCCESS: Found ${count} rows. Configuration: ${JSON.stringify(sanitizedData, null, 2)}`);
      }
    } catch (err) {
      console.error('Debug test failed:', err);
      setDebugResult(`EXCEPTION: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-2"
      >
        <div className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs sm:text-sm text-cyan-400 mb-3 sm:mb-4">
          <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Account Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Settings</h1>
        <p className="text-slate-400 text-sm sm:text-base">Your account settings and preferences</p>
      </motion.div>

      {/* Global Configuration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-blue-500/20 p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-2">Global API Configuration</h2>
            <p className="text-slate-400 text-sm sm:text-base mb-4">
              The AI evaluation system is configured globally by administrators. This ensures consistent 
              performance and eliminates the need for individual API key setup.
            </p>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium text-slate-300">Current Model:</span>
                <span className="text-xs sm:text-sm text-cyan-400 bg-cyan-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-cyan-500/20 w-fit">
                  {globalSettings.geminiModel || 'Not configured'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium text-slate-300">API Status:</span>
                {isApiConfigured ? (
                  <span className="text-xs sm:text-sm text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-emerald-500/20 flex items-center space-x-1 w-fit">
                    <CheckCircle className="w-3 h-3" />
                    <span>Configured</span>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-red-400 bg-red-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-red-500/20 flex items-center space-x-1 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    <span>Not Configured</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20' 
              : message.type === 'error'
              ? 'bg-red-500/10 backdrop-blur-sm border border-red-500/20'
              : 'bg-blue-500/10 backdrop-blur-sm border border-blue-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-blue-400" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-emerald-300' : 
            message.type === 'error' ? 'text-red-300' : 'text-blue-300'
          }`}>
            {message.text}
          </p>
        </motion.div>
      )}

      {/* User Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-cyan-400" />
          User Preferences
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <h3 className="font-medium text-white mb-2">Evaluation History</h3>
            <p className="text-sm text-slate-400 mb-3">
              Your evaluation history is automatically saved and can be accessed from the Results tab.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>• All evaluations are stored securely</p>
              <p>• Access your results anytime from the Results page</p>
              <p>• Export individual evaluations as needed</p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <h3 className="font-medium text-white mb-2">Data Privacy</h3>
            <p className="text-sm text-slate-400 mb-3">
              Your uploaded exam papers and evaluation results are private and secure.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>• Files are processed securely and not stored permanently</p>
              <p>• Only you can access your evaluation results</p>
              <p>• Data is encrypted in transit and at rest</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Getting Started - Only show if API is configured */}
      {isApiConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Ready to Get Started!</h3>
              <p className="text-slate-400 mb-4">
                Your system is fully configured and ready for exam evaluation. Here's what you can do:
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Navigate to the "Evaluate" tab to start evaluating exam papers</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Upload student papers and optional mark schemes</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Get detailed AI-powered evaluations with grades and feedback</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>View your evaluation history in the "Results" tab</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Access analytics and insights in the "Analytics" tab</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Not Configured Message - Only show if API is NOT configured */}
      {!isApiConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Configuration Required</h3>
              <p className="text-slate-400 mb-4">
                Global API configuration not found. Please contact your administrator.
              </p>
              <div className="text-sm text-slate-400 space-y-2">
                <p className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>The system requires API configuration to function</p>
                <p className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>Contact your administrator to set up the Gemini API key</p>
                <p className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>Once configured, you'll be able to evaluate exam papers</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Debug Section - For testing direct database access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-cyan-400" />
          Debug Database Access
        </h2>
        
        <button
          onClick={testDatabaseAccess}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
        >
          Test Database Connection
        </button>
        
        {debugResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-medium text-white mb-2">Debug Result</h3>
            <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono">
              {debugResult}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}