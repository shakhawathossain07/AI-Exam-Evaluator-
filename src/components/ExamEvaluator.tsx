import { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './FileUpload';
import { EvaluationForm } from './EvaluationForm';
import { ResultsDisplay } from './ResultsDisplay';
import { EvaluationReview } from './EvaluationReview';
import { Header } from './Header';
import { EnhancedLoadingSpinner } from './EnhancedLoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { EvaluationStatusBanner } from './evaluation/EvaluationStatusBanner';
import { DraftRecoveryBanner } from './evaluation/DraftRecoveryBanner';
import { evaluateExamPaper, saveEvaluation } from '../services/api';
import { useEvaluationAccess } from '../hooks/useEvaluationAccess';
import { useExamEvaluatorState } from '../hooks/useExamEvaluatorState';
import { useDraftManager } from '../hooks/useDraftManager';
import { EXAM_TYPE_CONFIGS } from '../constants/examTypes';
import { processStudentPaperFiles } from '../utils/fileProcessing';
import type { EvaluationResult } from '../types';

export function ExamEvaluator() {
  // Custom hooks for state management
  const { formData, evaluationState, updateFormData, updateEvaluationState, resetState } = useExamEvaluatorState();
  const { canEvaluate, evaluationsRemaining, isAdmin, message: accessMessage, loading: accessLoading, refresh: refreshAccess } = useEvaluationAccess();
  const draftManager = useDraftManager();

  // Auto-save draft when results change
  useEffect(() => {
    if (evaluationState.results && evaluationState.showReview && evaluationState.evaluationId) {
      draftManager.saveDraft(
        evaluationState.results,
        evaluationState.evaluationId,
        {
          name: formData.studentName,
          id: formData.studentId,
          subject: formData.subject,
          examType: formData.examType
        },
        formData.studentPaperFiles
      );
    }
  }, [evaluationState.results, evaluationState.showReview, evaluationState.evaluationId, formData, draftManager]);

  const handleLoadDraft = useCallback(() => {
    const draftData = draftManager.loadDraft();
    if (!draftData) return;

    updateEvaluationState({
      results: draftData.results,
      evaluationId: draftData.evaluationId,
      showReview: true
    });

    updateFormData({
      studentName: draftData.studentInfo?.name || '',
      studentId: draftData.studentInfo?.id || '',
      subject: draftData.studentInfo?.subject || '',
      examType: (draftData.studentInfo?.examType as any) || 'O-Level',
      studentPaperFiles: draftData.studentPaperFiles?.map((fileData: any) => ({
        id: fileData.id,
        file: new File([], fileData.name, { type: fileData.type }),
        preview: null
      })) || []
    });
  }, [draftManager, updateEvaluationState, updateFormData]);

  const handleEvaluate = useCallback(async () => {
    // Check evaluation access before proceeding
    if (!canEvaluate && !isAdmin) {
      updateEvaluationState({ 
        error: accessMessage || "You have reached your evaluation limit. Please contact an administrator." 
      });
      return;
    }

    if (formData.studentPaperFiles.length === 0) {
      updateEvaluationState({ error: "Please upload the student's exam paper before evaluating." });
      return;
    }

    updateEvaluationState({
      isLoading: true,
      error: null,
      loadingMessage: 'Preparing files for evaluation...'
    });

    try {
      const apiFormData = new FormData();
      
      // Add student paper files
      formData.studentPaperFiles.forEach(file => {
        apiFormData.append('studentPaper', file.file);
      });
      
      // Add mark scheme files
      formData.markSchemeFiles.forEach(file => {
        apiFormData.append('markScheme', file.file);
      });
      
      // Add form data
      if (formData.totalPossibleMarks.trim()) {
        apiFormData.append('totalPossibleMarks', formData.totalPossibleMarks.trim());
      }
      if (formData.studentName.trim()) {
        apiFormData.append('studentName', formData.studentName.trim());
      }
      if (formData.studentId.trim()) {
        apiFormData.append('studentId', formData.studentId.trim());
      }
      if (formData.subject.trim()) {
        apiFormData.append('subject', formData.subject.trim());
      }
      
      apiFormData.append('examType', formData.examType);
      apiFormData.append('gradingCriteria', EXAM_TYPE_CONFIGS[formData.examType].gradingCriteria);

      updateEvaluationState({ loadingMessage: 'AI is evaluating the exam paper...' });
      const result = await evaluateExamPaper(apiFormData);
      
      // Batch state updates to prevent flickering
      updateEvaluationState({
        isLoading: false,
        loadingMessage: '',
        results: result,
        evaluationId: result.evaluationId,
        showReview: true,
        originalStudentPaperData: result.originalStudentPaperFiles || []
      });
      
      // Refresh evaluation access status
      refreshAccess();
      
    } catch (err) {
      console.error('Evaluation error:', err);
      updateEvaluationState({
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [canEvaluate, isAdmin, accessMessage, formData, updateEvaluationState, refreshAccess]);

  const handleSaveReview = useCallback(async (updatedResults: EvaluationResult) => {
    if (!evaluationState.evaluationId) return;

    try {
      updateEvaluationState({ loadingMessage: 'Saving evaluation...' });
      await saveEvaluation(evaluationState.evaluationId, updatedResults.evaluation);
      
      updateEvaluationState({
        results: updatedResults,
        showReview: false,
        loadingMessage: ''
      });
      
      draftManager.clearDraft();
    } catch (err) {
      console.error('Save error:', err);
      updateEvaluationState({
        error: err instanceof Error ? err.message : 'Failed to save evaluation',
        loadingMessage: ''
      });
    }
  }, [evaluationState.evaluationId, updateEvaluationState, draftManager]);

  const handleCancelReview = useCallback(() => {
    updateEvaluationState({ showReview: false });
  }, [updateEvaluationState]);

  const handleResultsChange = useCallback((updatedResults: EvaluationResult) => {
    if (!evaluationState.showReview) {
      console.warn('Attempted to update results when not in review mode');
      return;
    }
    
    try {
      updateEvaluationState({ results: updatedResults });
    } catch (error) {
      console.error('Error updating results for draft:', error);
    }
  }, [evaluationState.showReview, updateEvaluationState]);

  const handleReset = useCallback(() => {
    resetState();
    draftManager.clearDraft();
  }, [resetState, draftManager]);

  // Convert original student paper data to display format
  const studentPaperFilesForDisplay = useMemo(() => {
    return processStudentPaperFiles(
      evaluationState.originalStudentPaperData,
      formData.studentPaperFiles
    );
  }, [evaluationState.originalStudentPaperData, formData.studentPaperFiles]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <Header />
      
      {/* Evaluation Access Status Banner */}
      {!accessLoading && (
        <EvaluationStatusBanner
          isAdmin={isAdmin}
          canEvaluate={canEvaluate}
          evaluationsRemaining={evaluationsRemaining}
          accessMessage={accessMessage}
          onRefreshAccess={refreshAccess}
        />
      )}
      
      {/* Draft Recovery Banner */}
      <DraftRecoveryBanner
        hasDraft={draftManager.hasDraft}
        showReview={evaluationState.showReview}
        onLoadDraft={handleLoadDraft}
        onClearDraft={draftManager.clearDraft}
      />
      
      <AnimatePresence initial={false}>
        {!evaluationState.results && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Student Information Section */}
                <div className="bg-indigo-50/80 backdrop-blur-sm p-6 rounded-lg border border-indigo-200/50">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="studentName" className="block text-sm font-medium text-indigo-700 mb-2">
                        Student Name
                      </label>
                      <input
                        id="studentName"
                        type="text"
                        value={formData.studentName}
                        onChange={(e) => updateFormData({ studentName: e.target.value })}
                        placeholder="Enter student's full name"
                        className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                        disabled={evaluationState.isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-indigo-700 mb-2">
                        Student ID
                      </label>
                      <input
                        id="studentId"
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => updateFormData({ studentId: e.target.value })}
                        placeholder="Enter student ID/number"
                        className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                        disabled={evaluationState.isLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="examType" className="block text-sm font-medium text-indigo-700 mb-2">
                        Examination Type & Grading System
                      </label>
                      <select
                        id="examType"
                        value={formData.examType}
                        onChange={(e) => updateFormData({ examType: e.target.value as any })}
                        className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                        disabled={evaluationState.isLoading}
                      >
                        {Object.entries(EXAM_TYPE_CONFIGS).map(([type, config]) => (
                          <option key={type} value={type}>
                            {type} - {config.description} ({config.gradingScale})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-indigo-600 mt-1">
                        Selected: {EXAM_TYPE_CONFIGS[formData.examType].gradingCriteria}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-indigo-700 mb-2">
                        Subject
                        <span className="text-xs text-gray-500 ml-2">
                          (Suggested: {EXAM_TYPE_CONFIGS[formData.examType].subjects.join(', ')})
                        </span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => updateFormData({ subject: e.target.value })}
                        placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry)"
                        className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                        disabled={evaluationState.isLoading}
                      />
                    </div>
                  </div>
                </div>

                <FileUpload
                  label="1. Upload Student's Exam Paper"
                  description="Images or PDF files"
                  files={formData.studentPaperFiles}
                  onFilesChange={(files) => updateFormData({ studentPaperFiles: files })}
                  accept="image/*,application/pdf"
                  required
                />
                
                <FileUpload
                  label="2. Upload Mark Scheme (Optional)"
                  description="Images or PDF files"
                  files={formData.markSchemeFiles}
                  onFilesChange={(files) => updateFormData({ markSchemeFiles: files })}
                  accept="image/*,application/pdf"
                />
              </div>
              
              <div>
                <EvaluationForm
                  totalPossibleMarks={formData.totalPossibleMarks}
                  onTotalMarksChange={(value) => updateFormData({ totalPossibleMarks: value })}
                  onEvaluate={handleEvaluate}
                  isLoading={evaluationState.isLoading}
                  disabled={formData.studentPaperFiles.length === 0}
                />
                
                <EnhancedLoadingSpinner 
                  isActive={evaluationState.isLoading}
                  estimatedDuration={50000} // 50 seconds based on your observed timing
                  onComplete={() => {
                    // This callback is handled by the API completion
                  }}
                />
                
                {evaluationState.error && (
                  <ErrorMessage 
                    message={evaluationState.error} 
                    onRetry={() => updateEvaluationState({ error: null })} 
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {evaluationState.showReview && evaluationState.results && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <EvaluationReview
              results={evaluationState.results}
              studentPaperFiles={studentPaperFilesForDisplay}
              onSave={handleSaveReview}
              onCancel={handleCancelReview}
              onResultsChange={handleResultsChange}
            />
          </motion.div>
        )}
        
        {evaluationState.results && !evaluationState.showReview && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ResultsDisplay
              results={evaluationState.results}
              studentPaperFiles={studentPaperFilesForDisplay}
              studentInfo={{
                name: formData.studentName,
                id: formData.studentId,
                subject: formData.subject,
                examType: formData.examType
              }}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}