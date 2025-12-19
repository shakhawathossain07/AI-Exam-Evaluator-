import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  FileImage, 
  Scan, 
  Search, 
  PenTool, 
  Calculator, 
  CheckCircle, 
  Clock,
  Zap,
  Eye,
  BookOpen
} from 'lucide-react';

interface EvaluationMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in milliseconds
  status: 'pending' | 'active' | 'completed';
}

interface EnhancedLoadingSpinnerProps {
  isActive: boolean;
  onComplete?: () => void;
  estimatedDuration?: number; // Duration in milliseconds
}

// Add a completion method that can be called externally
export interface EnhancedLoadingSpinnerRef {
  completeLoading: () => void;
}

const initialMilestones: EvaluationMilestone[] = [
  {
    id: 'processing',
    title: 'Processing Documents',
    description: 'Analyzing uploaded files and extracting text content...',
    icon: <FileImage className="w-5 h-5" />,
    duration: 0.12, // 12% of total time
    status: 'pending'
  },
  {
    id: 'scanning',
    title: 'OCR & Content Recognition',
    description: 'Using advanced OCR to read handwritten and printed text...',
    icon: <Scan className="w-5 h-5" />,
    duration: 0.15, // 15% of total time
    status: 'pending'
  },
  {
    id: 'understanding',
    title: 'Understanding Content',
    description: 'AI is comprehending the student\'s answers and approach...',
    icon: <Eye className="w-5 h-5" />,
    duration: 0.18, // 18% of total time
    status: 'pending'
  },
  {
    id: 'analyzing',
    title: 'Analyzing Responses',
    description: 'Evaluating each answer against marking criteria...',
    icon: <Search className="w-5 h-5" />,
    duration: 0.20, // 20% of total time
    status: 'pending'
  },
  {
    id: 'checking',
    title: 'Cross-referencing Mark Scheme',
    description: 'Comparing answers with provided marking guidelines...',
    icon: <BookOpen className="w-5 h-5" />,
    duration: 0.10, // 10% of total time
    status: 'pending'
  },
  {
    id: 'grading',
    title: 'Calculating Scores',
    description: 'Assigning marks and calculating final grades...',
    icon: <Calculator className="w-5 h-5" />,
    duration: 0.08, // 8% of total time
    status: 'pending'
  },
  {
    id: 'feedback',
    title: 'Generating Feedback',
    description: 'Creating detailed feedback and improvement suggestions...',
    icon: <PenTool className="w-5 h-5" />,
    duration: 0.12, // 12% of total time
    status: 'pending'
  },
  {
    id: 'finalizing',
    title: 'Finalizing Results',
    description: 'Compiling comprehensive evaluation report...',
    icon: <Zap className="w-5 h-5" />,
    duration: 0.05, // 5% of total time
    status: 'pending'
  }
];

export function EnhancedLoadingSpinner({ isActive, onComplete, estimatedDuration }: EnhancedLoadingSpinnerProps) {
  const [milestones, setMilestones] = useState<EvaluationMilestone[]>(initialMilestones);
  
  // Use estimated duration if provided, otherwise fallback to 60 seconds as reasonable default
  const totalDuration = useMemo(() => estimatedDuration || 60000, [estimatedDuration]);
  
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Effect to complete loading when external evaluation finishes
  useEffect(() => {
    if (!isActive && progress > 0 && !isCompleting) {
      setIsCompleting(true);
      // Quickly complete the animation
      setProgress(100);
      setMilestones(prev => prev.map(m => ({ ...m, status: 'completed' })));
      
      setTimeout(() => {
        onComplete?.();
        setIsCompleting(false);
      }, 1000);
    }
  }, [isActive, progress, isCompleting, onComplete]);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setElapsedTime(0);
      setMilestones(initialMilestones);
      setIsCompleting(false);
      return;
    }

    let progressTimer: NodeJS.Timeout;
    const milestoneTimeouts: NodeJS.Timeout[] = [];
    const startTime = Date.now();

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);
      
      // Progress reaches 95% at estimated time, then slows down
      let progressPercent;
      if (elapsed < totalDuration) {
        progressPercent = (elapsed / totalDuration) * 95;
      } else {
        // After estimated time, slowly crawl to 100%
        const overtime = elapsed - totalDuration;
        const slowProgress = 95 + (Math.min(overtime / (totalDuration * 0.5), 1) * 5);
        progressPercent = Math.min(slowProgress, 99);
      }
      
      setProgress(progressPercent);
      
      // Continue updating until externally stopped
      progressTimer = setTimeout(updateProgress, 200);
    };

    const runMilestones = () => {
      let cumulativePercentage = 0;
      
      initialMilestones.forEach((milestone, index) => {
        const milestoneStartTime = cumulativePercentage * totalDuration;
        const milestoneEndTime = (cumulativePercentage + milestone.duration) * totalDuration;
        
        const timeout1 = setTimeout(() => {
          if (isActive) {
            setMilestones(prev => prev.map((m, i) => ({
              ...m,
              status: i < index ? 'completed' : i === index ? 'active' : 'pending'
            })));
          }
        }, milestoneStartTime);
        
        const timeout2 = setTimeout(() => {
          if (isActive) {
            setMilestones(prev => prev.map((m, i) => ({
              ...m,
              status: i <= index ? 'completed' : 'pending'
            })));
          }
        }, milestoneEndTime);
        
        milestoneTimeouts.push(timeout1, timeout2);
        cumulativePercentage += milestone.duration;
      });
    };

    updateProgress();
    runMilestones();

    return () => {
      clearTimeout(progressTimer);
      milestoneTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isActive, totalDuration]);

  if (!isActive) return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
    >
      {/* Header with AI Brain Animation */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-3"
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          
          {/* Pulsing rings around the brain */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/30 rounded-xl"
          />
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 bg-purple-500/20 rounded-xl"
          />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">
          AI Evaluation in Progress
        </h3>
        <p className="text-sm text-cyan-300">
          Analyzing your exam paper with advanced AI technology
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-cyan-300">
            Overall Progress
          </span>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-white">{Math.round(progress)}%</span>
            {progress > 95 && elapsedTime > totalDuration && (
              <span className="text-orange-400 text-xs">(Taking longer than expected...)</span>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              progress > 95 && elapsedTime > totalDuration 
                ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                : 'bg-gradient-to-r from-cyan-500 to-purple-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        <AnimatePresence>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                milestone.status === 'completed' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : milestone.status === 'active'
                  ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-sm'
                  : 'bg-slate-800/50 border border-slate-700/50'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                milestone.status === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : milestone.status === 'active'
                  ? 'bg-cyan-500 text-white animate-pulse'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {milestone.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  milestone.icon
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium transition-colors ${
                    milestone.status === 'completed'
                      ? 'text-emerald-400'
                      : milestone.status === 'active'
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}>
                    {milestone.title}
                  </h4>
                  
                  {milestone.status === 'active' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4"
                    >
                      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </motion.div>
                  )}
                </div>
                
                <p className={`text-xs mt-1 transition-colors ${
                  milestone.status === 'completed'
                    ? 'text-emerald-300/80'
                    : milestone.status === 'active'
                    ? 'text-cyan-300'
                    : 'text-slate-500'
                }`}>
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dynamic Fun Facts Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
      >
        <p className="text-xs text-cyan-300 text-center">
          {progress < 25 && (
            <>💡 <strong>Did you know?</strong> Our AI processes over 1000 data points per answer to provide accurate and fair grading!</>
          )}
          {progress >= 25 && progress < 50 && (
            <>🔍 <strong>Processing:</strong> The AI is analyzing handwriting patterns and mathematical notation with 98% accuracy!</>
          )}
          {progress >= 50 && progress < 75 && (
            <>🎯 <strong>Smart Grading:</strong> Our AI cross-references multiple marking schemes to ensure consistent evaluation!</>
          )}
          {progress >= 75 && progress < 95 && (
            <>📝 <strong>Feedback Generation:</strong> Creating personalized improvement suggestions based on common learning patterns!</>
          )}
          {progress >= 95 && elapsedTime <= totalDuration && (
            <>✨ <strong>Almost Done:</strong> Finalizing your comprehensive evaluation report with detailed insights!</>
          )}
          {progress >= 95 && elapsedTime > totalDuration && (
            <>⏳ <strong>Complex Analysis:</strong> This exam requires extra attention - ensuring the highest quality evaluation!</>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
