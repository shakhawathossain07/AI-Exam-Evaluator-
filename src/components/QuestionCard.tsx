import React from 'react';
import { motion } from 'framer-motion';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  delay?: number;
}

export const QuestionCard = React.memo(function QuestionCard({ question, delay = 0 }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden question-card-print"
    >
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">{question.heading}</h4>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          {question.marks}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Question Text */}
        <div>
          <h5 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Question
          </h5>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{question.questionText}</p>
        </div>

        {/* Student's Answer */}
        <div>
          <h5 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Student's Answer (Transcription)
          </h5>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border break-words">
            {question.transcription}
          </p>
        </div>

        {/* Evaluation */}
        <div>
          <h5 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Evaluation
          </h5>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{question.evaluation}</p>
        </div>

        {/* Justification */}
        <div>
          <h5 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Justification of Marks
          </h5>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{question.justification}</p>
        </div>
      </div>
    </motion.div>
  );
});