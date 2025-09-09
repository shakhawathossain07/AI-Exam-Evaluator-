import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center mb-4">
        <GraduationCap className="w-12 h-12 text-indigo-600 mr-3" />
        <h1 className="text-4xl font-bold text-indigo-600">
          Advanced AI Exam Paper Evaluator
        </h1>
      </div>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Experience grading that transcends human ability—unbiased, deeply analytical, and remarkably precise.
      </p>
    </motion.header>
  );
}