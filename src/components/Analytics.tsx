import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Award,
  Target,
  Clock
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
    if (['A*', 'A'].includes(grade)) return 'text-green-600';
    if (['B', 'C'].includes(grade)) return 'text-blue-600';
    if (['D', 'E'].includes(grade)) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No data available</h3>
        <p className="text-gray-600">Complete some evaluations to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into your exam evaluation performance</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </motion.div>

      {/* Key Metrics */}
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
              <p className="text-2xl font-bold text-gray-800">{analytics.totalEvaluations}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-indigo-500" />
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
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">{analytics.averageScore.toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
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
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className={`text-2xl font-bold ${getGradeColor(analytics.averageGrade)}`}>
                {analytics.averageGrade}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
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
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800">{analytics.completionRate.toFixed(1)}%</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
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
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <PieChart className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Grade Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
              const percentage = (count / analytics.totalEvaluations) * 100;
              return (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`font-semibold ${getGradeColor(grade)}`}>Grade {grade}</span>
                    <span className="text-sm text-gray-600">{count} evaluations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
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
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Monthly Trends</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{trend.count} evaluations</p>
                    <p className="text-xs text-gray-600">{trend.avgScore.toFixed(1)}% avg</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
        className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50/80 backdrop-blur-sm rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-800">Strong Performance</h4>
            <p className="text-sm text-green-700 mt-1">
              {analytics.averageScore >= 70 
                ? "Excellent average score above 70%" 
                : "Room for improvement in average scores"
              }
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-800">Processing Speed</h4>
            <p className="text-sm text-blue-700 mt-1">
              Average processing time: {analytics.averageProcessingTime}s
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50/80 backdrop-blur-sm rounded-lg">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-800">Reliability</h4>
            <p className="text-sm text-purple-700 mt-1">
              {analytics.completionRate.toFixed(1)}% completion rate
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}