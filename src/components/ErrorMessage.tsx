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
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {isEdgeFunctionError ? 'Setup Required' : 'Error'}
          </h3>
          <p className="text-red-700 mb-4">{message}</p>
          
          {isEdgeFunctionError && (
            <div className="bg-red-100 border border-red-200 rounded-md p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Quick Fix:</h4>
              <ol className="list-decimal list-inside text-red-700 space-y-1 text-sm">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to Edge Functions</li>
                <li>Deploy the required functions: admin-api, evaluate-exam, setup-default-admin</li>
                <li>Restart your development server</li>
              </ol>
              <a 
                href="/SUPABASE_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-red-600 hover:text-red-800 font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View detailed setup guide
              </a>
            </div>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}