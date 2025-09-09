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
      className="mb-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-800">Unsaved Evaluation Found</h3>
            <p className="text-sm text-blue-700">
              You have an unsaved evaluation that you can continue working on.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadDraft}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recover Draft</span>
          </button>
          <button
            onClick={onClearDraft}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </motion.div>
  );
}