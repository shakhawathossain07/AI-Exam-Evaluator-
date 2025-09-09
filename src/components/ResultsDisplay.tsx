import { motion } from 'framer-motion';
import { Printer, RotateCcw, User, Hash, BookOpen, Award } from 'lucide-react';
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
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Evaluation Report</h2>
        <div className="flex space-x-3 no-print">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentInfo.name && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-700">Student Name</p>
                  <p className="text-indigo-800 font-semibold">{studentInfo.name}</p>
                </div>
              </div>
            )}
            {studentInfo.id && (
              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-700">Student ID</p>
                  <p className="text-indigo-800 font-semibold">{studentInfo.id}</p>
                </div>
              </div>
            )}
            {studentInfo.subject && (
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-700">Subject</p>
                  <p className="text-indigo-800 font-semibold">{studentInfo.subject}</p>
                </div>
              </div>
            )}
            {studentInfo.examType && (
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-700">Exam Type</p>
                  <p className="text-indigo-800 font-semibold">{studentInfo.examType}</p>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Student's Paper (Reference)
          </h3>
          <div className="no-print">
            <StudentPaperPreview files={studentPaperFiles} />
          </div>
          
          {/* Print-only version with better formatting */}
          <div className="hidden print:block print-include">
            <div className="border border-gray-300 p-4 mb-4">
              <h4 className="font-semibold mb-2">Student Paper Files:</h4>
              {studentPaperFiles.map((file, index) => (
                <div key={file.id} className="mb-2">
                  <p className="text-sm">
                    <strong>File {index + 1}:</strong> {file.file.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Type: {file.file.type} | Size: {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                Note: PDF content can be viewed in the digital version of this report.
              </p>
            </div>
          </div>
        </div>

        {/* Evaluation Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chief Examiner's Summary */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Chief Examiner's Summary
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200"
            >
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {results.evaluation.summary.feedback}
              </p>
            </motion.div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="print-page-break">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
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