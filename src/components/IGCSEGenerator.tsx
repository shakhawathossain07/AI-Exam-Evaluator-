import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Download, 
  Settings, 
  FileText, 
  Clock,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { QuestionPaperGenerator } from './igcse/QuestionPaperGenerator';
import { IGCSESettings } from './igcse/IGCSESettings';

type GeneratorMode = 'question-paper' | 'settings';

export function IGCSEGenerator() {
  const [activeMode, setActiveMode] = useState<GeneratorMode>('question-paper');

  const modes = [
    {
      id: 'question-paper' as GeneratorMode,
      label: 'Question Paper',
      icon: FileText,
      description: 'Generate authentic IGCSE Science Combined 0653 question papers'
    },
    {
      id: 'settings' as GeneratorMode,
      label: 'Settings',
      icon: Settings,
      description: 'Configure generation parameters'
    }
  ];

  const renderContent = () => {
    switch (activeMode) {
      case 'question-paper':
        return <QuestionPaperGenerator />;
      case 'settings':
        return <IGCSESettings />;
      default:
        return <QuestionPaperGenerator />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-4"
        >
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Cambridge IGCSE Science Combined 0653 Generator
          </h1>
        </motion.div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate authentic Cambridge IGCSE Science Combined 0653 question papers 
          with real exam-style questions, proper formatting, and diagrams exactly like official papers.
        </p>
      </div>

      {/* Cambridge IGCSE Quick Reference */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Cambridge IGCSE 0653 Science Combined - Quick Reference</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-blue-700 mb-2">Paper Types</h3>
            <div className="space-y-1 text-blue-600">
              <p><strong>Paper 1:</strong> Multiple Choice (45 min, 40 marks)</p>
              <p><strong>Paper 2:</strong> Core Theory (75 min, 80 marks)</p>
              <p><strong>Paper 3:</strong> Extended Theory (75 min, 80 marks)</p>
              <p><strong>Paper 4:</strong> Coursework Alternative (105 min, 120 marks)</p>
              <p><strong>Paper 5:</strong> Practical Test (75 min, 60 marks)</p>
              <p><strong>Paper 6:</strong> Alternative to Practical (60 min, 60 marks)</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-700 mb-2">Variants Explained</h3>
            <div className="space-y-1 text-blue-600">
              <p><strong>Variant 1:</strong> Asia/Australia time zones</p>
              <p><strong>Variant 2:</strong> Middle East/Africa time zones</p>
              <p><strong>Variant 3:</strong> Americas time zones</p>
              <p className="text-xs mt-2 text-blue-500">
                All variants test identical content at the same difficulty level but with different questions for security across time zones.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-700 mb-2">Session Codes</h3>
            <div className="space-y-1 text-blue-600">
              <p><strong>m25:</strong> May/June 2025</p>
              <p><strong>s25:</strong> October/November 2025</p>
              <p><strong>w25:</strong> February/March 2025</p>
              <p className="text-xs mt-2 text-blue-500">
                File naming: <code>0653_m25_qp_12</code><br/>
                = Subject_Session_QuestionPaper_PaperNumber+Variant
              </p>
              <button 
                onClick={() => window.open('/CAMBRIDGE_IGCSE_REFERENCE.md', '_blank')}
                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
              >
                📖 View Complete Reference Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Papers Generated', value: '0', color: 'blue' },
          { icon: Clock, label: 'Avg. Generation Time', value: '2.3s', color: 'green' },
          { icon: Users, label: 'Active Users', value: '1', color: 'purple' },
          { icon: Zap, label: 'Success Rate', value: '100%', color: 'yellow' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMode(mode.id)}
                className={`
                  flex items-center space-x-3 px-6 py-4 rounded-lg border-2 transition-all duration-200
                  ${isActive 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{mode.label}</div>
                  <div className="text-sm opacity-75">{mode.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

export default IGCSEGenerator;