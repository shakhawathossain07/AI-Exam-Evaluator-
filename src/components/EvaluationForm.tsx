import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

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
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        onClick={onEvaluate}
        disabled={disabled || isLoading}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-200
          ${disabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Evaluating...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>Evaluate & Grade Paper</span>
          </>
        )}
      </motion.button>

      {disabled && !isLoading && (
        <p className="text-sm text-red-600 text-center">
          Please upload the student's exam paper to continue.
        </p>
      )}
    </div>
  );
}