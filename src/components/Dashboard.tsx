import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Award,
  Plus,
  BarChart3,
  History,
  Settings as SettingsIcon,
  User,
  Hash,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import { getEvaluationHistory } from '../services/api';
import type { NavigationTab } from '../App';

interface DashboardProps {
  onNavigate: (tab: NavigationTab) => void;
}

interface DashboardStats {
  totalEvaluations: number;
  averageGrade: string;
  recentEvaluations: number;
  completionRate: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvaluations: 0,
    averageGrade: 'N/A',
    recentEvaluations: 0,
    completionRate: 0
  });
  const [recentEvaluations, setRecentEvaluations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const evaluations = await getEvaluationHistory();
      
      // Calculate stats
      const total = evaluations.length;
      const completed = evaluations.filter(e => e.status === 'completed');
      const recent = evaluations.filter(e => {
        const createdAt = new Date(e.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt >= weekAgo;
      }).length;

      // Calculate average grade
      const gradesWithScores = completed
        .filter(e => e.evaluation_result?.summary?.percentage)
        .map(e => e.evaluation_result.summary.percentage);
      
      const avgPercentage = gradesWithScores.length > 0 
        ? gradesWithScores.reduce((a, b) => a + b, 0) / gradesWithScores.length
        : 0;

      const avgGrade = avgPercentage > 0 ? calculateGrade(avgPercentage) : 'N/A';

      setStats({
        totalEvaluations: total,
        averageGrade: avgGrade,
        recentEvaluations: recent,
        completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0
      });

      setRecentEvaluations(evaluations.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A*';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'U';
  };

  const quickActions = [
    {
      title: 'New Evaluation',
      description: 'Start evaluating a new exam paper',
      icon: Plus,
      gradient: 'from-cyan-500 to-blue-500',
      action: () => onNavigate('evaluate')
    },
    {
      title: 'IGCSE Generator',
      description: 'Generate Cambridge IGCSE papers',
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-500',
      action: () => onNavigate('igcse-generator')
    },
    {
      title: 'View Results',
      description: 'Browse your evaluation history',
      icon: History,
      gradient: 'from-emerald-500 to-teal-500',
      action: () => onNavigate('results')
    },
    {
      title: 'Analytics',
      description: 'View detailed performance analytics',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      action: () => onNavigate('analytics')
    },
    {
      title: 'Settings',
      description: 'Configure API keys and preferences',
      icon: SettingsIcon,
      gradient: 'from-orange-500 to-amber-500',
      action: () => onNavigate('settings')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
          <Zap className="w-4 h-4 mr-2" />
          AI-Powered Exam Evaluation
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Dashboard</span>
        </h1>
        <p className="text-slate-400 text-lg">Monitor your exam evaluation progress and insights</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Evaluations</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalEvaluations}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-sm font-medium text-slate-400">Average Grade</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.averageGrade}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-sm font-medium text-slate-400">This Week</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.recentEvaluations}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 hover:border-orange-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-sm font-medium text-slate-400">Success Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="group relative bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 text-left overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
                <ArrowRight className="w-4 h-4 text-slate-600 absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Evaluations */}
      {recentEvaluations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <History className="w-5 h-5 mr-2 text-cyan-400" />
              Recent Evaluations
            </h2>
            <button
              onClick={() => onNavigate('results')}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center group"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              {recentEvaluations.map((evaluation, index) => {
                const studentInfo = evaluation.evaluation_result?.summary?.studentInfo;
                
                return (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            evaluation.status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                            evaluation.status === 'processing' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse' :
                            evaluation.status === 'failed' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-slate-500'
                          }`} />
                          <span className="font-medium text-white">
                            Evaluation #{evaluation.id.slice(0, 8)}
                          </span>
                          {evaluation.evaluation_result?.summary?.grade && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              evaluation.evaluation_result.summary.grade.color === 'green' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              evaluation.evaluation_result.summary.grade.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              evaluation.evaluation_result.summary.grade.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              evaluation.evaluation_result.summary.grade.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              Grade {evaluation.evaluation_result.summary.grade.grade}
                            </span>
                          )}
                        </div>
                        
                        {/* Student Information */}
                        {studentInfo && (studentInfo.studentName || studentInfo.studentId || studentInfo.subject) && (
                          <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                            {studentInfo.studentName && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{studentInfo.studentName}</span>
                              </div>
                            )}
                            {studentInfo.studentId && (
                              <div className="flex items-center space-x-1">
                                <Hash className="w-3 h-3" />
                                <span>{studentInfo.studentId}</span>
                              </div>
                            )}
                            {studentInfo.subject && (
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{studentInfo.subject}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(evaluation.created_at).toLocaleDateString()} at{' '}
                          {new Date(evaluation.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {evaluation.evaluation_result?.summary && (
                          <p className="text-lg font-semibold text-white">
                            <span className="text-cyan-400">{evaluation.evaluation_result.summary.totalAwarded || 0}</span>
                            <span className="text-slate-500"> / </span>
                            <span>{evaluation.evaluation_result.summary.totalPossible || 0}</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500 capitalize mt-1">{evaluation.status}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}