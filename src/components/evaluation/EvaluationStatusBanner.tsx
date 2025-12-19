import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

interface EvaluationStatusBannerProps {
  isAdmin: boolean;
  canEvaluate: boolean;
  evaluationsRemaining: number;
  accessMessage: string;
  onRefreshAccess: () => void;
}

export function EvaluationStatusBanner({
  isAdmin,
  canEvaluate,
  evaluationsRemaining,
  accessMessage,
  onRefreshAccess
}: EvaluationStatusBannerProps) {
  const getStatusConfig = () => {
    if (isAdmin) {
      return {
        bgClass: 'bg-purple-500/10 border-purple-500/20',
        iconBg: 'bg-purple-500/20',
        icon: <Shield className="w-5 h-5 text-purple-400" />,
        titleClass: 'text-white',
        messageClass: 'text-purple-300',
        title: 'Admin Access - Unlimited Evaluations',
        message: 'You have unlimited access to all evaluation features as an administrator.'
      };
    }
    
    if (canEvaluate) {
      return {
        bgClass: 'bg-emerald-500/10 border-emerald-500/20',
        iconBg: 'bg-emerald-500/20',
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        titleClass: 'text-white',
        messageClass: 'text-emerald-300',
        title: `Evaluations Available: ${evaluationsRemaining}`,
        message: accessMessage
      };
    }
    
    return {
      bgClass: 'bg-red-500/10 border-red-500/20',
      iconBg: 'bg-red-500/20',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      titleClass: 'text-white',
      messageClass: 'text-red-300',
      title: 'Evaluation Limit Reached',
      message: accessMessage
    };
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 backdrop-blur-sm border rounded-2xl p-4 ${config.bgClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`font-semibold ${config.titleClass}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.messageClass}`}>
              {config.message}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <button
            onClick={onRefreshAccess}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700"
            title="Refresh evaluation status"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>
    </motion.div>
  );
}