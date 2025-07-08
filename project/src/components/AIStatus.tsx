/**
 * AI Status Component
 * 
 * Displays the current status of AI integration to users and developers.
 * Shows whether AI is enabled, loading, or if there are any configuration issues.
 */

import React from 'react';
import { Brain, AlertCircle, CheckCircle, Loader, Trophy } from 'lucide-react';

interface AIStatusProps {
  isEnabled: boolean;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function AIStatus({ isEnabled, loading = false, error = null, className = '' }: AIStatusProps) {
  // Don't render anything if AI is working normally
  if (isEnabled && !loading && !error) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${className}`}>
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-blue-700">AI is thinking...</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700">AI temporarily unavailable</span>
        </>
      ) : isEnabled ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-700">AI powered learning active</span>
        </>
      ) : (
        <>
          <Brain className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Using pre-made questions</span>
        </>
      )}
    </div>
  );
}

/**
 * Developer-focused AI configuration status
 * Shows detailed information about AI setup for debugging
 */
export function AIConfigStatus() {
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;
  
  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs max-w-xs">
      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Brain className="w-4 h-4" />
        AI Configuration
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {hasApiKey ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <AlertCircle className="w-3 h-3 text-red-500" />
          )}
          <span className={hasApiKey ? 'text-green-700' : 'text-red-700'}>
            OpenAI API Key: {hasApiKey ? 'Configured' : 'Missing'}
          </span>
        </div>
        {!hasApiKey && (
          <div className="text-gray-600 mt-2">
            Add VITE_OPENAI_API_KEY to .env file to enable AI features
          </div>
        )}
      </div>
    </div>
  );
}