import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-indigo-50 rounded-lg border border-indigo-200"
    >
      <div className="flex items-center justify-center space-x-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-6 h-6 text-indigo-600" />
        </motion.div>
        <span className="text-indigo-800 font-medium">{message}</span>
      </div>
    </motion.div>
  );
}