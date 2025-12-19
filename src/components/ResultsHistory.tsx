import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  Award,
  FileText,
  Clock,
  User,
  Hash,
  BookOpen,
  History
} from 'lucide-react';
import { getEvaluationHistory, getEvaluation } from '../services/api';
import { supabase } from '../lib/supabase';
import { ResultsDisplay } from './ResultsDisplay';
import type { EvaluationMetadata, EvaluationSummary, Question } from '../types';

interface StoredEvaluation {
  summary: EvaluationSummary;
  questions: Question[];
  rawResponse?: string;
  metadata?: EvaluationMetadata;
}

interface Evaluation {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  evaluation_result: StoredEvaluation;
  total_possible_marks: number | null;
  error_message: string | null;
  student_paper_files?: Array<{ name: string; type: string }>;
  mark_scheme_files?: Array<{ name: string; type: string }>;
}

export function ResultsHistory() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [viewingDetails, setViewingDetails] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const data = await getEvaluationHistory();
      setEvaluations(data);
    } catch (error) {
      console.error('Failed to load evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvaluations = useCallback(() => {
    let filtered = evaluations;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(evaluation => {
        // Search by evaluation ID
        if (evaluation.id.toLowerCase().includes(searchLower)) return true;
        
        // Search by grade
        const grade = evaluation.evaluation_result?.summary?.grade?.grade;
        if (grade && grade.toLowerCase().includes(searchLower)) return true;
        
        // Search by student information - check both summary and metadata locations
        const studentInfo = evaluation.evaluation_result?.summary?.studentInfo || evaluation.evaluation_result?.metadata?.studentInfo;
        if (studentInfo) {
          if (studentInfo.studentName && studentInfo.studentName.toLowerCase().includes(searchLower)) return true;
          if (studentInfo.studentId && studentInfo.studentId.toLowerCase().includes(searchLower)) return true;
          if (studentInfo.subject && studentInfo.subject.toLowerCase().includes(searchLower)) return true;
        }
        
        return false;
      });
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, searchTerm, statusFilter]);

  useEffect(() => {
    filterEvaluations();
  }, [filterEvaluations]);

  const viewEvaluationDetails = async (evaluationId: string) => {
    try {
      const evaluation = await getEvaluation(evaluationId);
      setSelectedEvaluation(evaluation);
      setViewingDetails(true);
    } catch (error) {
      console.error('Failed to load evaluation details:', error);
    }
  };

  // Helper function to convert StudentInfo format for ResultsDisplay component
  const convertStudentInfoForDisplay = (studentInfo: any) => {
    if (!studentInfo) return undefined;
    return {
      name: studentInfo.studentName || '',
      id: studentInfo.studentId || '',
      subject: studentInfo.subject || '',
      examType: studentInfo.examType
    };
  };

  const deleteEvaluation = async (evaluationId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;

    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', evaluationId);

      if (error) throw error;

      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    } catch (error) {
      console.error('Failed to delete evaluation:', error);
    }
  };

  const exportEvaluation = async (evaluation: Evaluation) => {
    try {
      // Get student info for better filename
      const studentInfo = evaluation.evaluation_result?.summary?.studentInfo || evaluation.evaluation_result?.metadata?.studentInfo;
      const studentName = studentInfo?.studentName || 'Student';
      const evaluationId = evaluation.id.slice(0, 8);
      
      // Create HTML content for PDF
      const htmlContent = generateEvaluationHTML(evaluation);
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download the PDF report.');
        return;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Set title and trigger print
      printWindow.document.title = `Evaluation Report - ${studentName} - ${evaluationId}`;
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
    } catch (error) {
      console.error('Failed to export evaluation:', error);
      alert('Failed to export evaluation. Please try again.');
    }
  };

  const generateEvaluationHTML = (evaluation: Evaluation) => {
    const studentInfo = evaluation.evaluation_result?.summary?.studentInfo || evaluation.evaluation_result?.metadata?.studentInfo;
    const summary = evaluation.evaluation_result?.summary;
    const questions = evaluation.evaluation_result?.questions || [];
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Evaluation Report</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #4F46E5; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .header h1 { 
          color: #1F2937; 
          margin: 0 0 10px 0; 
          font-size: 2rem; 
        }
        .student-info { 
          background: #F3F4F6; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
        }
        .student-info h3 { 
          margin: 0 0 15px 0; 
          color: #4F46E5; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 15px; 
        }
        .info-item { 
          display: flex; 
          align-items: center; 
        }
        .info-label { 
          font-weight: 600; 
          color: #6B7280; 
          margin-right: 10px; 
        }
        .score-cards { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .score-card { 
          background: white; 
          border: 1px solid #E5E7EB; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .score-title { 
          font-size: 0.875rem; 
          color: #6B7280; 
          margin-bottom: 5px; 
        }
        .score-value { 
          font-size: 1.5rem; 
          font-weight: bold; 
          color: #1F2937; 
        }
        .feedback-section { 
          background: #F9FAFB; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
        }
        .feedback-section h3 { 
          margin: 0 0 15px 0; 
          color: #1F2937; 
        }
        .questions-section h3 { 
          color: #1F2937; 
          margin-bottom: 20px; 
        }
        .question-card { 
          border: 1px solid #E5E7EB; 
          border-radius: 8px; 
          padding: 20px; 
          margin-bottom: 20px; 
          page-break-inside: avoid; 
        }
        .question-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 15px; 
          padding-bottom: 10px; 
          border-bottom: 1px solid #E5E7EB; 
        }
        .question-title { 
          font-weight: 600; 
          color: #1F2937; 
        }
        .question-marks { 
          background: #EFF6FF; 
          color: #1D4ED8; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-weight: 600; 
          font-size: 0.875rem; 
        }
        .question-content { 
          margin-bottom: 15px; 
        }
        .question-section { 
          margin-bottom: 15px; 
        }
        .question-section h5 { 
          font-size: 0.875rem; 
          font-weight: 600; 
          color: #4F46E5; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          margin-bottom: 8px; 
        }
        .question-text { 
          background: #F3F4F6; 
          padding: 10px; 
          border-radius: 4px; 
          font-size: 0.875rem; 
        }
        @media print {
          body { font-size: 12px; }
          .score-cards { grid-template-columns: repeat(3, 1fr); }
          .question-card { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Evaluation Report</h1>
        <p>Generated on ${new Date(evaluation.created_at).toLocaleDateString()}</p>
      </div>

      ${studentInfo && (studentInfo.studentName || studentInfo.studentId || studentInfo.subject) ? `
      <div class="student-info">
        <h3>Student Information</h3>
        <div class="info-grid">
          ${studentInfo.studentName ? `
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span>${studentInfo.studentName}</span>
          </div>` : ''}
          ${studentInfo.studentId ? `
          <div class="info-item">
            <span class="info-label">ID:</span>
            <span>${studentInfo.studentId}</span>
          </div>` : ''}
          ${studentInfo.subject ? `
          <div class="info-item">
            <span class="info-label">Subject:</span>
            <span>${studentInfo.subject}</span>
          </div>` : ''}
          ${studentInfo.examType ? `
          <div class="info-item">
            <span class="info-label">Exam Type:</span>
            <span>${studentInfo.examType}</span>
          </div>` : ''}
        </div>
      </div>` : ''}

      <div class="score-cards">
        <div class="score-card">
          <div class="score-title">Total Score</div>
          <div class="score-value">${summary?.totalAwarded || 0} / ${summary?.totalPossible || 0}</div>
        </div>
        <div class="score-card">
          <div class="score-title">Percentage</div>
          <div class="score-value">${summary?.percentage ? summary.percentage.toFixed(1) + '%' : 'N/A'}</div>
        </div>
        <div class="score-card">
          <div class="score-title">Grade</div>
          <div class="score-value">${summary?.grade?.grade || 'N/A'}</div>
        </div>
      </div>

      ${summary?.feedback ? `
      <div class="feedback-section">
        <h3>Chief Examiner's Summary</h3>
        <p>${summary.feedback.replace(/\n/g, '<br>')}</p>
      </div>` : ''}

      ${questions.length > 0 ? `
      <div class="questions-section">
        <h3>Question-by-Question Breakdown</h3>
        ${questions.map((question, index) => `
        <div class="question-card">
          <div class="question-header">
            <span class="question-title">${question.heading || `Question ${index + 1}`}</span>
            <span class="question-marks">${question.marks || 'N/A'}</span>
          </div>
          <div class="question-content">
            ${question.questionText ? `
            <div class="question-section">
              <h5>Question</h5>
              <div class="question-text">${question.questionText}</div>
            </div>` : ''}
            ${question.transcription ? `
            <div class="question-section">
              <h5>Student's Answer</h5>
              <div class="question-text">${question.transcription}</div>
            </div>` : ''}
            ${question.evaluation ? `
            <div class="question-section">
              <h5>Evaluation</h5>
              <p>${question.evaluation}</p>
            </div>` : ''}
            ${question.justification ? `
            <div class="question-section">
              <h5>Justification</h5>
              <p>${question.justification}</p>
            </div>` : ''}
          </div>
        </div>`).join('')}
      </div>` : ''}
    </body>
    </html>
    `;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A*', 'A'].includes(grade)) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (['B', 'C'].includes(grade)) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (['D', 'E'].includes(grade)) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  };

  if (viewingDetails && selectedEvaluation) {
    return (
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewingDetails(false)}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Results
          </button>
        </div>
        <ResultsDisplay
          results={{
            success: true,
            evaluation: {
              ...selectedEvaluation.evaluation_result,
              rawResponse: selectedEvaluation.evaluation_result.rawResponse || ''
            },
            metadata: {
              studentPaperPages: selectedEvaluation.student_paper_files?.length || 0,
              markSchemePages: selectedEvaluation.mark_scheme_files?.length || 0,
              totalPossibleMarks: selectedEvaluation.total_possible_marks,
              evaluatedAt: selectedEvaluation.created_at
            }
          }}
          studentPaperFiles={[]} // We don't have the original files
          studentInfo={convertStudentInfoForDisplay(
            selectedEvaluation.evaluation_result?.summary?.studentInfo || 
            selectedEvaluation.evaluation_result?.metadata?.studentInfo
          )}
          onReset={() => setViewingDetails(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-slate-400">Loading evaluation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
          <History className="w-4 h-4 mr-2" />
          Evaluation History
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Evaluation Results</h1>
        <p className="text-slate-400">Browse and manage your exam evaluation history</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, student name, student ID, subject, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white appearance-none transition-all"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="completed" className="bg-slate-900">Completed</option>
              <option value="processing" className="bg-slate-900">Processing</option>
              <option value="failed" className="bg-slate-900">Failed</option>
              <option value="pending" className="bg-slate-900">Pending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredEvaluations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No evaluations found</h3>
              <p className="text-slate-400">
                {evaluations.length === 0 
                  ? "You haven't created any evaluations yet." 
                  : "No evaluations match your current filters."
                }
              </p>
            </motion.div>
          ) : (
            filteredEvaluations.map((evaluation, index) => {
              const studentInfo = evaluation.evaluation_result?.summary?.studentInfo || evaluation.evaluation_result?.metadata?.studentInfo;
              
              return (
                <motion.div
                  key={evaluation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="font-semibold text-white">
                          Evaluation #{evaluation.id.slice(0, 8)}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                          {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                        </span>
                        {evaluation.evaluation_result?.summary?.grade && (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getGradeColor(evaluation.evaluation_result.summary.grade.grade)}`}>
                            Grade {evaluation.evaluation_result.summary.grade.grade}
                          </span>
                        )}
                      </div>

                      {/* Student Information */}
                      {studentInfo && (studentInfo.studentName || studentInfo.studentId || studentInfo.subject) && (
                        <div className="mb-3 p-3 bg-cyan-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/20">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            {studentInfo.studentName && (
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-cyan-400" />
                                <span className="text-white font-medium">{studentInfo.studentName}</span>
                              </div>
                            )}
                            {studentInfo.studentId && (
                              <div className="flex items-center space-x-2">
                                <Hash className="w-4 h-4 text-cyan-400" />
                                <span className="text-white font-medium">{studentInfo.studentId}</span>
                              </div>
                            )}
                            {studentInfo.subject && (
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-cyan-400" />
                                <span className="text-white font-medium">{studentInfo.subject}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(evaluation.created_at).toLocaleDateString()}</span>
                        </div>
                        {evaluation.evaluation_result?.summary && (
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>
                              <span className="text-cyan-400">{evaluation.evaluation_result.summary.totalAwarded || 0}</span>
                              <span className="text-slate-500"> / </span>
                              <span>{evaluation.evaluation_result.summary.totalPossible || 0}</span> marks
                            </span>
                          </div>
                        )}
                        {evaluation.evaluation_result?.summary?.percentage && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{evaluation.evaluation_result.summary.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>

                      {evaluation.error_message && (
                        <div className="mt-3 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                          <p className="text-red-400 text-sm">{evaluation.error_message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {evaluation.status === 'completed' && (
                        <>
                          <button
                            onClick={() => viewEvaluationDetails(evaluation.id)}
                            className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportEvaluation(evaluation)}
                            className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                            title="Download PDF Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteEvaluation(evaluation.id)}
                        className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}