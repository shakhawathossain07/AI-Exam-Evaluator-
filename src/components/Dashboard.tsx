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
  BookOpen
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
      color: 'bg-indigo-500',
      action: () => onNavigate('evaluate')
    },
    {
      title: 'IGCSE Generator',
      description: 'Generate Cambridge IGCSE papers',
      icon: BookOpen,
      color: 'bg-blue-500',
      action: () => onNavigate('igcse-generator')
    },
    {
      title: 'View Results',
      description: 'Browse your evaluation history',
      icon: History,
      color: 'bg-green-500',
      action: () => onNavigate('results')
    },
    {
      title: 'Analytics',
      description: 'View detailed performance analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
      action: () => onNavigate('analytics')
    },
    {
      title: 'Settings',
      description: 'Configure API keys and preferences',
      icon: SettingsIcon,
      color: 'bg-orange-500',
      action: () => onNavigate('settings')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Monitor your exam evaluation progress and insights</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEvaluations}</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-800">{stats.averageGrade}</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-800">{stats.recentEvaluations}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Evaluations */}
      {recentEvaluations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Evaluations</h2>
            <button
              onClick={() => onNavigate('results')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentEvaluations.map((evaluation, index) => {
                const studentInfo = evaluation.evaluation_result?.summary?.studentInfo;
                
                return (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            evaluation.status === 'completed' ? 'bg-green-500' :
                            evaluation.status === 'processing' ? 'bg-yellow-500' :
                            evaluation.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="font-medium text-gray-800">
                            Evaluation #{evaluation.id.slice(0, 8)}
                          </span>
                          {evaluation.evaluation_result?.summary?.grade && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              evaluation.evaluation_result.summary.grade.color === 'green' ? 'bg-green-100 text-green-800' :
                              evaluation.evaluation_result.summary.grade.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                              evaluation.evaluation_result.summary.grade.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              evaluation.evaluation_result.summary.grade.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Grade {evaluation.evaluation_result.summary.grade.grade}
                            </span>
                          )}
                        </div>
                        
                        {/* Student Information */}
                        {studentInfo && (studentInfo.studentName || studentInfo.studentId || studentInfo.subject) && (
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
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
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(evaluation.created_at).toLocaleDateString()} at{' '}
                          {new Date(evaluation.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {evaluation.evaluation_result?.summary && (
                          <p className="text-sm font-medium text-gray-800">
                            {evaluation.evaluation_result.summary.totalAwarded || 0} / {evaluation.evaluation_result.summary.totalPossible || 0}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 capitalize">{evaluation.status}</p>
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