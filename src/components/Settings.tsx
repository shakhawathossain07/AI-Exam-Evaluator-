import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Settings() {
  const [globalSettings, setGlobalSettings] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash'
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
          geminiModel: data.model || 'gemini-1.5-flash'
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
        geminiModel: 'gemini-1.5-flash'
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
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Your account settings and preferences</p>
      </motion.div>

      {/* Global Configuration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200 p-6"
      >
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Global API Configuration</h2>
            <p className="text-blue-700 mb-4">
              The AI evaluation system is configured globally by administrators. This ensures consistent 
              performance and eliminates the need for individual API key setup.
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Current Model:</span>
                <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {globalSettings.geminiModel || 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">API Status:</span>
                {isApiConfigured ? (
                  <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Configured</span>
                  </span>
                ) : (
                  <span className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded flex items-center space-x-1">
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
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50/80 backdrop-blur-sm border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50/80 backdrop-blur-sm border border-red-200'
              : 'bg-blue-50/80 backdrop-blur-sm border border-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Info className="w-5 h-5 text-blue-600" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 
            message.type === 'error' ? 'text-red-800' : 'text-blue-800'
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
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Preferences</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Evaluation History</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your evaluation history is automatically saved and can be accessed from the Results tab.
            </p>
            <div className="text-xs text-gray-500">
              • All evaluations are stored securely
              • Access your results anytime from the Results page
              • Export individual evaluations as needed
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Data Privacy</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your uploaded exam papers and evaluation results are private and secure.
            </p>
            <div className="text-xs text-gray-500">
              • Files are processed securely and not stored permanently
              • Only you can access your evaluation results
              • Data is encrypted in transit and at rest
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
          className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Ready to Get Started!</h3>
              <p className="text-green-700 mb-4">
                Your system is fully configured and ready for exam evaluation. Here's what you can do:
              </p>
              <ul className="text-sm text-green-700 space-y-2">
                <li>• Navigate to the "Evaluate" tab to start evaluating exam papers</li>
                <li>• Upload student papers and optional mark schemes</li>
                <li>• Get detailed AI-powered evaluations with grades and feedback</li>
                <li>• View your evaluation history in the "Results" tab</li>
                <li>• Access analytics and insights in the "Analytics" tab</li>
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
          className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Configuration Required</h3>
              <p className="text-red-700 mb-4">
                Global API configuration not found. Please contact your administrator.
              </p>
              <div className="text-sm text-red-600 space-y-1">
                <p>• The system requires API configuration to function</p>
                <p>• Contact your administrator to set up the Gemini API key</p>
                <p>• Once configured, you'll be able to evaluate exam papers</p>
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
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Debug Database Access</h2>
        
        <button
          onClick={testDatabaseAccess}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-200"
        >
          Test Database Connection
        </button>
        
        {debugResult && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
            <h3 className="font-medium text-gray-800 mb-2">Debug Result</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {debugResult}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}