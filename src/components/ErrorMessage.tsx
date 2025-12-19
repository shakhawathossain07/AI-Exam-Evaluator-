import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const isEdgeFunctionError = message.includes('Edge Function') || 
                             message.includes('Function not found') ||
                             message.includes('not deployed');

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {isEdgeFunctionError ? 'Setup Required' : 'Error'}
          </h3>
          <p className="text-red-300 mb-4">{message}</p>
          
          {isEdgeFunctionError && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-red-300 mb-2">Quick Fix:</h4>
              <ol className="list-decimal list-inside text-red-300/80 space-y-1 text-sm">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to Edge Functions</li>
                <li>Deploy the required functions: admin-api, evaluate-exam, setup-default-admin</li>
                <li>Restart your development server</li>
              </ol>
              <a 
                href="/SUPABASE_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-red-400 hover:text-red-300 font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View detailed setup guide
              </a>
            </div>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}