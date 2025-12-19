import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap } from 'lucide-react';

interface EvaluationFormProps {
  totalPossibleMarks: string;
  onTotalMarksChange: (value: string) => void;
  onEvaluate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function EvaluationForm({
  totalPossibleMarks,
  onTotalMarksChange,
  onEvaluate,
  isLoading,
  disabled
}: EvaluationFormProps) {
  return (
    <div className="space-y-6">
      {/* Hidden input to maintain functionality */}
      <input
        type="hidden"
        value={totalPossibleMarks}
        onChange={(e) => onTotalMarksChange(e.target.value)}
      />

      <motion.button
        whileHover={!disabled && !isLoading ? { scale: 1.02, y: -2 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        onClick={onEvaluate}
        disabled={disabled || isLoading}
        className={`
          relative w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 overflow-hidden group
          ${disabled || isLoading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
          }
        `}
      >
        {/* Animated background shimmer */}
        {!disabled && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        {isLoading ? (
          <>
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <Sparkles className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
            </div>
            <span>AI is Evaluating...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Evaluate & Grade Paper</span>
          </>
        )}
      </motion.button>

      {disabled && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg py-3 px-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Please upload the student's exam paper to continue.</span>
        </div>
      )}
    </div>
  );
}