import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-cyan-500/30 border-t-cyan-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p 
          className="mt-2 text-sm text-slate-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ isVisible, text = 'Loading...', children }: LoadingOverlayProps) {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <motion.div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LoadingSpinner size="lg" text={text} />
      </motion.div>
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingText?: string;
  errorComponent?: React.ReactNode;
}

export function LoadingState({ 
  isLoading, 
  error, 
  children, 
  loadingText = 'Loading...', 
  errorComponent 
}: LoadingStateProps) {
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-slate-400 max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  return <>{children}</>;
}
