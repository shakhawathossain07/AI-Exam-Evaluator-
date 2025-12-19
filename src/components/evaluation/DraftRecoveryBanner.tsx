import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DraftRecoveryBannerProps {
  hasDraft: boolean;
  showReview: boolean;
  onLoadDraft: () => void;
  onClearDraft: () => void;
}

export function DraftRecoveryBanner({
  hasDraft,
  showReview,
  onLoadDraft,
  onClearDraft
}: DraftRecoveryBannerProps) {
  if (!hasDraft || showReview) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Unsaved Evaluation Found</h3>
            <p className="text-sm text-blue-300">
              You have an unsaved evaluation that you can continue working on.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadDraft}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recover Draft</span>
          </button>
          <button
            onClick={onClearDraft}
            className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </motion.div>
  );
}