import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Award,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import { getEvaluationHistory } from '../services/api';

interface AnalyticsData {
  totalEvaluations: number;
  averageScore: number;
  averageGrade: string;
  gradeDistribution: { [key: string]: number };
  monthlyTrends: { month: string; count: number; avgScore: number }[];
  completionRate: number;
  averageProcessingTime: number;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const evaluations = await getEvaluationHistory();
      
      // Filter by time range
      const now = new Date();
      const filteredEvaluations = evaluations.filter(evaluation => {
        if (timeRange === 'all') return true;
        
        const evalDate = new Date(evaluation.created_at);
        const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        return evalDate >= cutoffDate;
      });

      const completedEvaluations = filteredEvaluations.filter(e => e.status === 'completed');
      
      // Calculate analytics
      const totalEvaluations = filteredEvaluations.length;
      const completionRate = totalEvaluations > 0 ? (completedEvaluations.length / totalEvaluations) * 100 : 0;
      
      // Average score and grade
      const scoresWithPercentages = completedEvaluations
        .filter(e => e.evaluation_result?.summary?.percentage)
        .map(e => e.evaluation_result.summary.percentage);
      
      const averageScore = scoresWithPercentages.length > 0 
        ? scoresWithPercentages.reduce((a, b) => a + b, 0) / scoresWithPercentages.length
        : 0;

      const averageGrade = calculateGrade(averageScore);

      // Grade distribution
      const gradeDistribution: { [key: string]: number } = {};
      completedEvaluations.forEach(evaluation => {
        const grade = evaluation.evaluation_result?.summary?.grade?.grade;
        if (grade) {
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        }
      });

      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        
        const monthEvaluations = completedEvaluations.filter(evaluation => 
          evaluation.created_at.startsWith(monthKey)
        );
        
        const monthScores = monthEvaluations
          .filter(e => e.evaluation_result?.summary?.percentage)
          .map(e => e.evaluation_result.summary.percentage);
        
        const avgScore = monthScores.length > 0 
          ? monthScores.reduce((a, b) => a + b, 0) / monthScores.length
          : 0;

        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count: monthEvaluations.length,
          avgScore: avgScore
        });
      }

      // Average processing time (mock data for now)
      const averageProcessingTime = 45; // seconds

      setAnalytics({
        totalEvaluations,
        averageScore,
        averageGrade,
        gradeDistribution,
        monthlyTrends,
        completionRate,
        averageProcessingTime
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const getGradeColor = (grade: string) => {
    if (['A*', 'A'].includes(grade)) return 'text-emerald-400';
    if (['B', 'C'].includes(grade)) return 'text-blue-400';
    if (['D', 'E'].includes(grade)) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
          <BarChart3 className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No data available</h3>
        <p className="text-slate-400">Complete some evaluations to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Insights
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Insights into your exam evaluation performance</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white transition-all"
        >
          <option value="7d" className="bg-slate-900">Last 7 days</option>
          <option value="30d" className="bg-slate-900">Last 30 days</option>
          <option value="90d" className="bg-slate-900">Last 90 days</option>
          <option value="all" className="bg-slate-900">All time</option>
        </select>
      </motion.div>

      {/* Key Metrics */}
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
              <p className="text-3xl font-bold text-white mt-1">{analytics.totalEvaluations}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
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
              <p className="text-sm font-medium text-slate-400">Average Score</p>
              <p className="text-3xl font-bold text-white mt-1">{analytics.averageScore.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Target className="w-6 h-6 text-emerald-400" />
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
              <p className="text-sm font-medium text-slate-400">Average Grade</p>
              <p className={`text-3xl font-bold mt-1 ${getGradeColor(analytics.averageGrade)}`}>
                {analytics.averageGrade}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Award className="w-6 h-6 text-purple-400" />
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
              <p className="text-sm font-medium text-slate-400">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{analytics.completionRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <PieChart className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Grade Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
              const percentage = (count / analytics.totalEvaluations) * 100;
              return (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`font-semibold ${getGradeColor(grade)}`}>Grade {grade}</span>
                    <span className="text-sm text-slate-500">{count} evaluations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Monthly Trends</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{trend.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{trend.count} evaluations</p>
                    <p className="text-xs text-slate-500">{trend.avgScore.toFixed(1)}% avg</p>
                  </div>
                  <div className="w-20 bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(trend.avgScore, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl border border-emerald-500/20">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-white">Strong Performance</h4>
            <p className="text-sm text-slate-400 mt-1">
              {analytics.averageScore >= 70 
                ? "Excellent average score above 70%" 
                : "Room for improvement in average scores"
              }
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-xl border border-blue-500/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white">Processing Speed</h4>
            <p className="text-sm text-slate-400 mt-1">
              Average processing time: {analytics.averageProcessingTime}s
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl border border-purple-500/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white">Reliability</h4>
            <p className="text-sm text-slate-400 mt-1">
              {analytics.completionRate.toFixed(1)}% completion rate
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}