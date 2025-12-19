import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function DebugSupabase() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults(prev => [...prev, { 
        test: testName, 
        success: true, 
        result: JSON.stringify(result, null, 2) 
      }]);
    } catch (error) {
      setResults(prev => [...prev, { 
        test: testName, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: JSON.stringify(error, null, 2)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = () => runTest('Basic Connection', async () => {
    return { connected: !!supabase, url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...' };
  });

  const testAdminTable = () => runTest('Admin Table Check', async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count(*)', { count: 'exact' });
    if (error) throw error;
    return { tableExists: true, count: data };
  });

  const testAdminTableStructure = () => runTest('Admin Table Structure', async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    if (error) throw error;
    
    // Sanitize admin data - don't show password hashes
    const sanitizedData = data?.map(item => ({
      ...item,
      password_hash: item.password_hash ? '[HIDDEN]' : null
    }));
    
    return { 
      structure: data && data.length > 0 ? Object.keys(data[0]) : 'No data to show structure',
      sampleData: sanitizedData 
    };
  });

  const testRPCFunction = () => runTest('RPC Function Test', async () => {
    const { data, error } = await supabase.rpc('create_admin_user', {
      admin_email: 'test@debug.com',
      admin_password_hash: 'debug_hash'
    });
    if (error) throw error;
    return data;
  });

  const testGlobalSettings = () => runTest('Global Settings Check', async () => {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*');
    if (error) throw error;
    
    // Sanitize global settings - don't show API keys
    const sanitizedData = data?.map(item => ({
      id: item.id,
      gemini_model: item.gemini_model,
      has_api_key: item.gemini_api_key ? 'YES' : 'NO',
      api_key_length: item.gemini_api_key ? item.gemini_api_key.length : 0,
      updated_at: item.updated_at,
      updated_by: item.updated_by
    }));
    
    return sanitizedData;
  });

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'exam_evaluator_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const testPasswordHash = () => runTest('Password Hash Test', async () => {
    const testPassword = 'password123';
    const hash = await hashPassword(testPassword);
    return { 
      password: testPassword, 
      hash,
      hashLength: hash.length 
    };
  });

  const clearResults = () => setResults([]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug Console</h1>
      
      <div className="mb-4 space-x-2">
        <button onClick={testConnection} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
          Test Connection
        </button>
        <button onClick={testAdminTable} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
          Test Admin Table
        </button>
        <button onClick={testAdminTableStructure} disabled={loading} className="bg-purple-500 text-white px-4 py-2 rounded">
          Check Table Structure
        </button>
        <button onClick={testRPCFunction} disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded">
          Test RPC Function
        </button>
        <button onClick={testGlobalSettings} disabled={loading} className="bg-indigo-500 text-white px-4 py-2 rounded">
          Test Global Settings
        </button>
        <button onClick={testPasswordHash} disabled={loading} className="bg-pink-500 text-white px-4 py-2 rounded">
          Test Password Hash
        </button>
        <button onClick={clearResults} className="bg-gray-500 text-white px-4 py-2 rounded">
          Clear Results
        </button>
      </div>

      {loading && <div className="mb-4 text-blue-600">Running test...</div>}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="font-bold text-lg mb-2">
              {result.test} - {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            {result.success ? (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {result.result}
              </pre>
            ) : (
              <div>
                <p className="text-red-600 font-medium mb-2">Error: {result.error}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {result.details}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
