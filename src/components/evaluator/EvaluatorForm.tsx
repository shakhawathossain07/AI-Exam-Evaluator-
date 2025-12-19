import React from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '../FileUpload';
import { EvaluationForm } from '../EvaluationForm';
import { LoadingSpinner } from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { EXAM_TYPE_CONFIGS } from '../../constants/examTypes';
import type { EvaluatorFormData } from '../../types/evaluator';
import type { UploadedFile } from '../../types';

interface EvaluatorFormProps {
  formData: EvaluatorFormData;
  onFormDataChange: (updates: Partial<EvaluatorFormData>) => void;
  onEvaluate: () => Promise<void>;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onErrorDismiss: () => void;
}

export function EvaluatorForm({
  formData,
  onFormDataChange,
  onEvaluate,
  isLoading,
  loadingMessage,
  error,
  onErrorDismiss
}: EvaluatorFormProps) {
  const handleFileChange = (field: 'studentPaperFiles' | 'markSchemeFiles') => 
    (files: UploadedFile[]) => {
      onFormDataChange({ [field]: files });
    };

  const handleInputChange = (field: keyof EvaluatorFormData) => 
    (value: string) => {
      onFormDataChange({ [field]: value });
    };

  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800/50 p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Student Information Section */}
          <div className="bg-cyan-500/10 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-cyan-400 mb-2">
                  Student Name
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName')(e.target.value)}
                  placeholder="Enter student's full name"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors bg-slate-800/50 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-cyan-400 mb-2">
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId')(e.target.value)}
                  placeholder="Enter student ID/number"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors bg-slate-800/50 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="examType" className="block text-sm font-medium text-cyan-400 mb-2">
                  Examination Type & Grading System
                </label>
                <select
                  id="examType"
                  value={formData.examType}
                  onChange={(e) => handleInputChange('examType')(e.target.value as any)}
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors bg-slate-800/50 text-white"
                  disabled={isLoading}
                >
                  {Object.entries(EXAM_TYPE_CONFIGS).map(([type, config]) => (
                    <option key={type} value={type}>
                      {type} - {config.description} ({config.gradingScale})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-cyan-300 mt-1">
                  Selected: {EXAM_TYPE_CONFIGS[formData.examType].gradingCriteria}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="subject" className="block text-sm font-medium text-cyan-400 mb-2">
                  Subject
                  <span className="text-xs text-slate-500 ml-2">
                    (Suggested: {EXAM_TYPE_CONFIGS[formData.examType].subjects.join(', ')})
                  </span>
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject')(e.target.value)}
                  placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry)"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors bg-slate-800/50 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <FileUpload
            label="1. Upload Student's Exam Paper"
            description="Images or PDF files"
            files={formData.studentPaperFiles}
            onFilesChange={handleFileChange('studentPaperFiles')}
            accept="image/*,application/pdf"
            required
          />
          
          <FileUpload
            label="2. Upload Mark Scheme (Optional)"
            description="Images or PDF files"
            files={formData.markSchemeFiles}
            onFilesChange={handleFileChange('markSchemeFiles')}
            accept="image/*,application/pdf"
          />
        </div>
        
        <div>
          <EvaluationForm
            totalPossibleMarks={formData.totalPossibleMarks}
            onTotalMarksChange={handleInputChange('totalPossibleMarks')}
            onEvaluate={onEvaluate}
            isLoading={isLoading}
            disabled={formData.studentPaperFiles.length === 0}
          />
          
          {isLoading && (
            <LoadingSpinner message={loadingMessage} />
          )}
          
          {error && (
            <ErrorMessage message={error} onRetry={onErrorDismiss} />
          )}
        </div>
      </div>
    </motion.div>
  );
}