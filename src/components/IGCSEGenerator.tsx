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
  Zap,
  Sparkles
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
          className="flex flex-col items-center justify-center mb-4"
        >
          <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Cambridge IGCSE Generator
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cambridge IGCSE Science Combined 0653 Generator
            </h1>
          </div>
        </motion.div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Generate authentic Cambridge IGCSE Science Combined 0653 question papers 
          with real exam-style questions, proper formatting, and diagrams exactly like official papers.
        </p>
      </div>

      {/* Cambridge IGCSE Quick Reference */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Cambridge IGCSE 0653 Science Combined - Quick Reference</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-cyan-400 mb-2">Paper Types</h3>
            <div className="space-y-1 text-slate-400">
              <p><strong className="text-slate-300">Paper 1:</strong> Multiple Choice (45 min, 40 marks)</p>
              <p><strong className="text-slate-300">Paper 2:</strong> Core Theory (75 min, 80 marks)</p>
              <p><strong className="text-slate-300">Paper 3:</strong> Extended Theory (75 min, 80 marks)</p>
              <p><strong className="text-slate-300">Paper 4:</strong> Coursework Alternative (105 min, 120 marks)</p>
              <p><strong className="text-slate-300">Paper 5:</strong> Practical Test (75 min, 60 marks)</p>
              <p><strong className="text-slate-300">Paper 6:</strong> Alternative to Practical (60 min, 60 marks)</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-cyan-400 mb-2">Variants Explained</h3>
            <div className="space-y-1 text-slate-400">
              <p><strong className="text-slate-300">Variant 1:</strong> Asia/Australia time zones</p>
              <p><strong className="text-slate-300">Variant 2:</strong> Middle East/Africa time zones</p>
              <p><strong className="text-slate-300">Variant 3:</strong> Americas time zones</p>
              <p className="text-xs mt-2 text-slate-500">
                All variants test identical content at the same difficulty level but with different questions for security across time zones.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-cyan-400 mb-2">Session Codes</h3>
            <div className="space-y-1 text-slate-400">
              <p><strong className="text-slate-300">m25:</strong> May/June 2025</p>
              <p><strong className="text-slate-300">s25:</strong> October/November 2025</p>
              <p><strong className="text-slate-300">w25:</strong> February/March 2025</p>
              <p className="text-xs mt-2 text-slate-500">
                File naming: <code className="bg-slate-800/50 px-1.5 py-0.5 rounded">0653_m25_qp_12</code><br/>
                = Subject_Session_QuestionPaper_PaperNumber+Variant
              </p>
              <button 
                onClick={() => window.open('/CAMBRIDGE_IGCSE_REFERENCE.md', '_blank')}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline mt-1"
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
          { icon: FileText, label: 'Papers Generated', value: '0', color: 'cyan', gradient: 'from-cyan-500/20 to-blue-500/20' },
          { icon: Clock, label: 'Avg. Generation Time', value: '2.3s', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/20' },
          { icon: Users, label: 'Active Users', value: '1', color: 'purple', gradient: 'from-purple-500/20 to-pink-500/20' },
          { icon: Zap, label: 'Success Rate', value: '100%', color: 'orange', gradient: 'from-orange-500/20 to-amber-500/20' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} border border-${stat.color}-500/20`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mode Selection */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
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
                  flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200
                  ${isActive 
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-white' 
                    : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
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