import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-4">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-50" />
          <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Advanced AI Exam Paper Evaluator
        </h1>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400">
          <Sparkles className="w-4 h-4 mr-2" />
          Powered by Gemini 2.5 Flash
        </span>
      </div>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Experience grading that transcends human ability—unbiased, deeply analytical, and remarkably precise.
      </p>
    </motion.header>
  );
}