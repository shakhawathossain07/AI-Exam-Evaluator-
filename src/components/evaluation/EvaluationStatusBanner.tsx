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
        bgClass: 'bg-purple-50/80 border-purple-200',
        icon: <Shield className="w-5 h-5 text-purple-600" />,
        titleClass: 'text-purple-800',
        messageClass: 'text-purple-700',
        title: 'Admin Access - Unlimited Evaluations',
        message: 'You have unlimited access to all evaluation features as an administrator.'
      };
    }
    
    if (canEvaluate) {
      return {
        bgClass: 'bg-green-50/80 border-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        titleClass: 'text-green-800',
        messageClass: 'text-green-700',
        title: `Evaluations Available: ${evaluationsRemaining}`,
        message: accessMessage
      };
    }
    
    return {
      bgClass: 'bg-red-50/80 border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      titleClass: 'text-red-800',
      messageClass: 'text-red-700',
      title: 'Evaluation Limit Reached',
      message: accessMessage
    };
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 backdrop-blur-sm border rounded-xl p-4 ${config.bgClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {config.icon}
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
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            title="Refresh evaluation status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}