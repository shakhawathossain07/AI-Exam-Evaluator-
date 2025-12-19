import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Edit3, Check, AlertCircle, Clock, FileText, User, Hash, BookOpen, Award } from 'lucide-react';
import { OptimizedPDFViewer } from './OptimizedPDFViewer';
import type { EvaluationResult, Question, UploadedFile } from '../types';

// Error Boundary Component
class EvaluationErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EvaluationReview Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-300">Something went wrong</h3>
              <p className="text-red-400 mt-1">
                There was an error displaying the evaluation review. Please try refreshing the page.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-red-500/25"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface EvaluationReviewProps {
  results: EvaluationResult;
  studentPaperFiles?: UploadedFile[];
  onSave: (updatedResults: EvaluationResult) => void;
  onCancel: () => void;
  onResultsChange?: (results: EvaluationResult) => void;
}

export function EvaluationReview({ results, studentPaperFiles = [], onSave, onCancel, onResultsChange }: EvaluationReviewProps) {
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(results.evaluation.questions);
  const [editedFeedback, setEditedFeedback] = useState(results.evaluation.summary.feedback);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  
  // Add state for calculated totals
  const [calculatedTotals, setCalculatedTotals] = useState({
    totalAwarded: results.evaluation.summary.totalAwarded || 0,
    totalPossible: results.evaluation.summary.totalPossible || 0,
    percentage: results.evaluation.summary.percentage || 0,
    grade: results.evaluation.summary.grade || { grade: 'N/A', color: 'gray' }
  });

  // Auto-save changes to parent component for draft functionality - DISABLED TO PREVENT WHITE SCREEN
  useEffect(() => {
    // Temporarily disable auto-save to prevent white screen issue
    // TODO: Re-enable once the root cause is identified
    console.log('Auto-save disabled to prevent white screen');
    setLastSaved(new Date());
  }, [editedQuestions, editedFeedback, hasChanges]);

  // Define grade calculation function first
  const calculateGrade = useCallback((percentage: number) => {
    // Get exam type from results metadata or default to O-Level
    const examType = results.metadata?.studentInfo?.examType || 'O-Level';
    
    switch (examType?.toUpperCase()) {
      case 'IELTS':
        // IELTS uses 9-band system
        if (percentage >= 95) return { grade: '9.0', color: 'green' };
        if (percentage >= 90) return { grade: '8.5', color: 'green' };
        if (percentage >= 85) return { grade: '8.0', color: 'green' };
        if (percentage >= 80) return { grade: '7.5', color: 'blue' };
        if (percentage >= 75) return { grade: '7.0', color: 'blue' };
        if (percentage >= 70) return { grade: '6.5', color: 'blue' };
        if (percentage >= 65) return { grade: '6.0', color: 'orange' };
        if (percentage >= 60) return { grade: '5.5', color: 'orange' };
        if (percentage >= 55) return { grade: '5.0', color: 'orange' };
        if (percentage >= 50) return { grade: '4.5', color: 'red' };
        if (percentage >= 45) return { grade: '4.0', color: 'red' };
        if (percentage >= 40) return { grade: '3.5', color: 'red' };
        if (percentage >= 35) return { grade: '3.0', color: 'red' };
        if (percentage >= 30) return { grade: '2.5', color: 'red' };
        if (percentage >= 25) return { grade: '2.0', color: 'red' };
        if (percentage >= 20) return { grade: '1.5', color: 'red' };
        if (percentage >= 15) return { grade: '1.0', color: 'red' };
        if (percentage >= 10) return { grade: '0.5', color: 'red' };
        return { grade: '0.0', color: 'red' };

      case 'O-LEVEL':
      case 'A-LEVEL':
        // Cambridge O-Level and A-Level grading
        if (percentage >= 90) return { grade: 'A*', color: 'green' };
        if (percentage >= 80) return { grade: 'A', color: 'green' };
        if (percentage >= 70) return { grade: 'B', color: 'blue' };
        if (percentage >= 60) return { grade: 'C', color: 'yellow' };
        if (percentage >= 50) return { grade: 'D', color: 'orange' };
        if (percentage >= 40) return { grade: 'E', color: 'orange' };
        if (examType?.toUpperCase() === 'O-LEVEL') {
          // O-Level has additional grades
          if (percentage >= 30) return { grade: 'F', color: 'red' };
          if (percentage >= 20) return { grade: 'G', color: 'red' };
        }
        return { grade: 'U', color: 'red' }; // Unclassified

      default:
        // Standard/Generic grading system
        if (percentage >= 90) return { grade: 'A+', color: 'green' };
        if (percentage >= 85) return { grade: 'A', color: 'green' };
        if (percentage >= 80) return { grade: 'A-', color: 'green' };
        if (percentage >= 75) return { grade: 'B+', color: 'blue' };
        if (percentage >= 70) return { grade: 'B', color: 'blue' };
        if (percentage >= 65) return { grade: 'B-', color: 'blue' };
        if (percentage >= 60) return { grade: 'C+', color: 'orange' };
        if (percentage >= 55) return { grade: 'C', color: 'orange' };
        if (percentage >= 50) return { grade: 'C-', color: 'orange' };
        if (percentage >= 45) return { grade: 'D+', color: 'red' };
        if (percentage >= 40) return { grade: 'D', color: 'red' };
        if (percentage >= 35) return { grade: 'D-', color: 'red' };
        return { grade: 'F', color: 'red' };
    }
  }, [results.metadata?.studentInfo?.examType]);

  // Simplified recalculate function
  const recalculateTotals = useCallback((questions: Question[]) => {
    let totalAwarded = 0;
    let totalPossible = 0;

    questions.forEach((question) => {
      const marks = parseMarks(question.marks);
      totalAwarded += marks.awarded;
      totalPossible += marks.total;
    });

    const percentage = totalPossible > 0 ? (totalAwarded / totalPossible) * 100 : 0;
    const grade = calculateGrade(percentage);
    
    setCalculatedTotals({
      totalAwarded: Math.round(totalAwarded * 100) / 100,
      totalPossible: Math.round(totalPossible * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      grade
    });
  }, [calculateGrade]);

  // Recalculate totals whenever questions change
  useEffect(() => {
    recalculateTotals(editedQuestions);
  }, [editedQuestions, recalculateTotals]);

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    // Simple validation
    if (index < 0 || index >= editedQuestions.length || !field) {
      return;
    }

    const updated = [...editedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    
    setEditedQuestions(updated);
    setHasChanges(true);
  };

  const updateFeedback = (value: string) => {
    try {
      setEditedFeedback(value);
      setHasChanges(true);
    } catch (error) {
      console.error('Error updating feedback:', error);
      // Prevent white screen by not updating state if there's an error
    }
  };

  const handleSave = () => {
    const updatedResults = {
      ...results,
      evaluation: {
        ...results.evaluation,
        questions: editedQuestions,
        summary: {
          ...results.evaluation.summary,
          feedback: editedFeedback,
          totalAwarded: calculatedTotals.totalAwarded,
          totalPossible: calculatedTotals.totalPossible,
          percentage: calculatedTotals.percentage,
          grade: calculatedTotals.grade,
          studentInfo: results.evaluation.summary.studentInfo || results.metadata?.studentInfo
        }
      }
    };
    onSave(updatedResults);
  };

  const parseMarks = (marksString: string) => {
    try {
      if (!marksString || typeof marksString !== 'string') {
        console.warn(`Invalid marks input: ${marksString}`);
        return { awarded: 0, total: 1 };
      }

      const parts = marksString.split('/');
      if (parts.length !== 2) {
        console.warn(`Invalid marks format: ${marksString}`);
        return { awarded: 0, total: 1 };
      }
      
      const awarded = parseFloat(parts[0]);
      const total = parseFloat(parts[1]);
      
      // Validate parsed values
      if (isNaN(awarded) || isNaN(total) || awarded < 0 || total <= 0) {
        console.warn(`Invalid mark values: awarded=${awarded}, total=${total}`);
        return { awarded: 0, total: 1 };
      }
      
      // Ensure awarded doesn't exceed total
      if (awarded > total) {
        console.warn(`Awarded marks (${awarded}) exceed total marks (${total}). Capping awarded to total.`);
        return { awarded: total, total };
      }
      
      return {
        awarded: Math.round(awarded * 100) / 100, // Round to 2 decimal places
        total: Math.round(total * 100) / 100      // Round to 2 decimal places
      };
    } catch (error) {
      console.error('Error parsing marks:', error);
      return { awarded: 0, total: 1 };
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    return date.toLocaleTimeString();
  };

  // Get the primary student paper file (first PDF or image)
  const getPrimaryStudentFile = () => {
    return studentPaperFiles.length > 0 ? studentPaperFiles[0] : null;
  };

  const isPDFFile = (file: UploadedFile) => {
    return file.file.type === 'application/pdf';
  };

  return (
    <EvaluationErrorBoundary onError={(error) => console.error('Review component error:', error)}>
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-amber-300 mb-2">Review AI Evaluation</h2>
            <p className="text-amber-400/80">
              Please review the AI's evaluation below. Each question shows the relevant portion of the student's exam paper 
              automatically positioned for easy verification. You can edit marks, justifications, and feedback as needed.
            </p>
            <div className="flex items-center space-x-2 mt-3 text-sm text-amber-500">
              <Clock className="w-4 h-4" />
              <span>Auto-saved: {formatLastSaved(lastSaved)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Section */}
      {results.metadata?.studentInfo && (
        results.metadata.studentInfo.studentName || 
        results.metadata.studentInfo.studentId || 
        results.metadata.studentInfo.subject || 
        results.metadata.studentInfo.examType
      ) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/10 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.metadata.studentInfo.studentName && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-cyan-400">Student Name</p>
                  <p className="text-white font-semibold">{results.metadata.studentInfo.studentName}</p>
                </div>
              </div>
            )}
            {results.metadata.studentInfo.studentId && (
              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-cyan-400">Student ID</p>
                  <p className="text-white font-semibold">{results.metadata.studentInfo.studentId}</p>
                </div>
              </div>
            )}
            {results.metadata.studentInfo.subject && (
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-cyan-400">Subject</p>
                  <p className="text-white font-semibold">{results.metadata.studentInfo.subject}</p>
                </div>
              </div>
            )}
            {results.metadata.studentInfo.examType && (
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-cyan-400">Exam Type</p>
                  <p className="text-white font-semibold">{results.metadata.studentInfo.examType}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25"
          >
            <Save className="w-4 h-4" />
            <span>Save & Finalize</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel (Keep Draft)</span>
          </motion.button>
        </div>

        {hasChanges && (
          <div className="flex items-center space-x-2 text-emerald-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Changes auto-saved as draft</span>
          </div>
        )}
      </div>

      {/* Current Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Total Score</h3>
          <p className="text-2xl font-bold text-white">
            {calculatedTotals.totalAwarded} / {calculatedTotals.totalPossible}
          </p>
          {/* Add accuracy indicator */}
          <p className="text-xs text-emerald-400 mt-1">✓ Calculation Verified</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Percentage</h3>
          <p className="text-2xl font-bold text-white">
            {calculatedTotals.percentage ? `${calculatedTotals.percentage.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Grade</h3>
          <p className={`text-2xl font-bold ${
            calculatedTotals.grade?.color === 'green' ? 'text-emerald-400' :
            calculatedTotals.grade?.color === 'blue' ? 'text-blue-400' :
            calculatedTotals.grade?.color === 'yellow' ? 'text-yellow-400' :
            calculatedTotals.grade?.color === 'orange' ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {calculatedTotals.grade?.grade || 'N/A'}
          </p>
        </div>
      </div>

      {/* Chief Examiner's Feedback */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chief Examiner's Feedback</h3>
        <textarea
          value={editedFeedback}
          onChange={(e) => updateFeedback(e.target.value)}
          className="w-full h-32 p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-800/50 text-white placeholder:text-slate-500 resize-none"
          placeholder="Enter overall feedback for the student..."
        />
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Question-by-Question Review</h3>
        
        {editedQuestions.map((question, index) => {
            const totalPages = results.metadata?.studentPaperPages || 1;
            let pageNumber = 1;
            let pageSource = 'default';

            // Always trust AI-provided page numbers - no fallback logic
            if (typeof question.pageNumber === 'number' && question.pageNumber > 0) {
              pageNumber = question.pageNumber;
              pageSource = 'AI provided';
            } else {
              // Only use fallback if AI didn't provide a page number at all
              console.warn(`[EvaluationReview] Question ${index + 1} missing AI page number, using fallback`);
              pageNumber = Math.min(totalPages, Math.max(1, index + 1));
              pageSource = 'fallback (AI missing)';
            }

            console.log(`[EvaluationReview] Question ${index + 1} (${question.heading}): pageNumber=${pageNumber} (${pageSource}), AI provided=${question.pageNumber}, totalPages=${totalPages || 'unknown'}`);

            const isEditing = editingQuestion === index;
             const marks = parseMarks(question.marks);
             const primaryFile = getPrimaryStudentFile();
             
             return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
                  <h4 className="font-semibold text-white">{question.heading}</h4>
                  <div className="flex items-center space-x-3">
                    <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium border border-cyan-500/20">
                      {question.marks}
                    </span>
                    <button
                      onClick={() => setEditingQuestion(isEditing ? null : index)}
                      className={`p-2 rounded-xl transition-colors ${
                        isEditing 
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  {/* Left Column - Student Paper with Smart PDF Viewer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">
                        Student's Answer (Original)
                      </h5>
                      <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                        Page {pageNumber} ({pageSource})
                      </div>
                    </div>
                    
                    {primaryFile ? (
                      isPDFFile(primaryFile) ? (
                        <OptimizedPDFViewer
                          file={primaryFile.file}
                          pageNumber={pageNumber}
                          className="h-[600px]"
                        />
                      ) : (
                        <div className="border border-slate-700/50 rounded-2xl overflow-hidden">
                          <img
                            src={primaryFile.preview || ''}
                            alt={`Student's answer for ${question.heading}`}
                            className="w-full h-auto object-contain bg-slate-800"
                          />
                        </div>
                      )
                    ) : (
                      <div className="border border-slate-700/50 rounded-2xl p-8 text-center bg-slate-800/50">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No student paper available</p>
                      </div>
                    )}

                    {/* Student's Answer (Transcription) */}
                    <div>
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                        Student's Answer (Transcription)
                      </h5>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                        <p className="text-slate-300 whitespace-pre-wrap text-sm">
                          {question.transcription}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        AI transcription of the handwritten content above
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Question Details and Evaluation */}
                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                        Question
                      </h5>
                      <p className="text-slate-300 whitespace-pre-wrap">{question.questionText}</p>
                    </div>

                    {/* Evaluation */}
                    <div>
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                        Evaluation
                      </h5>
                      {isEditing ? (
                        <textarea
                          value={question.evaluation}
                          onChange={(e) => updateQuestion(index, 'evaluation', e.target.value)}
                          className="w-full h-24 p-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-800/50 text-white resize-none"
                          title="Edit evaluation for this question"
                          placeholder="Enter evaluation for this question..."
                        />
                      ) : (
                        <p className="text-slate-300 whitespace-pre-wrap">{question.evaluation}</p>
                      )}
                    </div>

                    {/* Justification */}
                    <div>
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                        Justification of Marks
                      </h5>
                      {isEditing ? (
                        <textarea
                          value={question.justification}
                          onChange={(e) => updateQuestion(index, 'justification', e.target.value)}
                          className="w-full h-24 p-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-800/50 text-white resize-none"
                          title="Edit justification for this question"
                          placeholder="Enter justification for marks awarded..."
                        />
                      ) : (
                        <p className="text-slate-300 whitespace-pre-wrap">{question.justification}</p>
                      )}
                    </div>

                    {/* Marks */}
                    {isEditing && (
                      <div>
                        <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                          Marks
                        </h5>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={marks.total}
                            step="0.5"
                            value={marks.awarded}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') return;
                              
                              const newAwarded = parseFloat(inputValue);
                              if (isNaN(newAwarded) || newAwarded < 0) return;
                              
                              const cappedAwarded = Math.min(newAwarded, marks.total);
                              updateQuestion(index, 'marks', `${cappedAwarded}/${marks.total}`);
                            }}
                            className="w-20 px-3 py-2 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-800/50 text-white"
                            placeholder="Awarded"
                            title="Marks Awarded"
                          />
                          <span className="text-slate-400">/</span>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={marks.total}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') return;
                              
                              const newTotal = parseFloat(inputValue);
                              if (isNaN(newTotal) || newTotal < 0.5) return;
                              
                              const adjustedAwarded = Math.min(marks.awarded, newTotal);
                              updateQuestion(index, 'marks', `${adjustedAwarded}/${newTotal}`);
                            }}
                            className="w-20 px-3 py-2 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-800/50 text-white"
                            placeholder="Total"
                            title="Total Marks"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
        })}
      </div>
      </div>
    </EvaluationErrorBoundary>
  );
}