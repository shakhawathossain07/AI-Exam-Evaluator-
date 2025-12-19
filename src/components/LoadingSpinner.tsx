import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl border border-cyan-500/20"
    >
      <div className="flex items-center justify-center space-x-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center"
          >
            <Brain className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <motion.div 
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </motion.div>
        </div>
        <span className="text-white font-medium">{message}</span>
      </div>
    </motion.div>
  );
}