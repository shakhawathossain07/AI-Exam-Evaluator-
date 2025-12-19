import { motion } from 'framer-motion';
import { Printer, RotateCcw, User, Hash, BookOpen, Award, Sparkles, FileCheck } from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import { QuestionCard } from './QuestionCard';
import { StudentPaperPreview } from './StudentPaperPreview';
import type { EvaluationResult, UploadedFile } from '../types';

interface StudentInfo {
  name: string;
  id: string;
  subject: string;
  examType?: string;
}

interface ResultsDisplayProps {
  results: EvaluationResult;
  studentPaperFiles: UploadedFile[];
  studentInfo?: StudentInfo;
  onReset: () => void;
}

export function ResultsDisplay({ results, studentPaperFiles, studentInfo, onReset }: ResultsDisplayProps) {
  const handlePrint = () => {
    // Prepare the page for printing
    document.title = `Evaluation Report - ${studentInfo?.name || 'Student'}`;
    
    // Add a small delay to ensure all content is loaded
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/50 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-3">
            <FileCheck className="w-4 h-4 mr-2" />
            Evaluation Complete
          </div>
          <h2 className="text-3xl font-bold text-white">Evaluation Report</h2>
        </div>
        <div className="flex space-x-3 no-print">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Evaluation</span>
          </motion.button>
        </div>
      </div>

      {/* Student Information Card */}
      {studentInfo && (studentInfo.name || studentInfo.id || studentInfo.subject) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentInfo.name && (
              <div className="flex items-center space-x-3 bg-slate-800/30 rounded-xl p-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Student Name</p>
                  <p className="text-white font-semibold">{studentInfo.name}</p>
                </div>
              </div>
            )}
            {studentInfo.id && (
              <div className="flex items-center space-x-3 bg-slate-800/30 rounded-xl p-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Student ID</p>
                  <p className="text-white font-semibold">{studentInfo.id}</p>
                </div>
              </div>
            )}
            {studentInfo.subject && (
              <div className="flex items-center space-x-3 bg-slate-800/30 rounded-xl p-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Subject</p>
                  <p className="text-white font-semibold">{studentInfo.subject}</p>
                </div>
              </div>
            )}
            {studentInfo.examType && (
              <div className="flex items-center space-x-3 bg-slate-800/30 rounded-xl p-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Exam Type</p>
                  <p className="text-white font-semibold">{studentInfo.examType}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          title="Total Score"
          value={`${results.evaluation.summary.totalAwarded || 'N/A'} / ${results.evaluation.summary.totalPossible || 'N/A'}`}
          delay={0}
        />
        <ScoreCard
          title="Percentage"
          value={results.evaluation.summary.percentage ? `${results.evaluation.summary.percentage.toFixed(1)}%` : 'N/A'}
          delay={0.1}
        />
        <ScoreCard
          title="Grade"
          value={results.evaluation.summary.grade?.grade || 'N/A'}
          color={results.evaluation.summary.grade?.color}
          delay={0.2}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Student Paper Preview - Make it print-friendly */}
        <div className="lg:col-span-2 print-include">
          <h3 className="text-xl font-semibold text-white mb-4">
            Student's Paper (Reference)
          </h3>
          <div className="no-print">
            <StudentPaperPreview files={studentPaperFiles} />
          </div>
          
          {/* Print-only version with better formatting */}
          <div className="hidden print:block print-include">
            <div className="border border-slate-700 rounded-xl p-4 mb-4 bg-slate-900/50">
              <h4 className="font-semibold mb-2 text-white">Student Paper Files:</h4>
              {studentPaperFiles.map((file, index) => (
                <div key={file.id} className="mb-2">
                  <p className="text-sm text-slate-300">
                    <strong>File {index + 1}:</strong> {file.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Type: {file.file.type} | Size: {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ))}
              <p className="text-xs text-slate-500 mt-2">
                Note: PDF content can be viewed in the digital version of this report.
              </p>
            </div>
          </div>
        </div>

        {/* Evaluation Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chief Examiner's Summary */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Chief Examiner's Summary
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50"
            >
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {results.evaluation.summary.feedback}
              </p>
            </motion.div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="print-page-break">
            <h3 className="text-xl font-semibold text-white mb-4">
              Detailed Question-by-Question Report
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
              {results.evaluation.questions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  delay={0.4 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}