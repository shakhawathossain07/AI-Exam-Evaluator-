import { useState, useCallback } from 'react';

interface TransitionOptions {
  duration?: number;
  onComplete?: () => void;
}

export function useTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const executeTransition = useCallback(async (
    action: () => void | Promise<void>,
    options: TransitionOptions = {}
  ) => {
    const { duration = 200, onComplete } = options;
    
    setIsTransitioning(true);
    
    try {
      // Execute the action
      await Promise.resolve(action());
      
      // Wait for transition duration
      await new Promise(resolve => setTimeout(resolve, duration));
      
      onComplete?.();
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const smoothTransition = useCallback((
    stateUpdates: () => void,
    options: TransitionOptions = {}
  ) => {
    return executeTransition(() => {
      // Use requestAnimationFrame for smooth state updates
      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          stateUpdates();
          resolve();
        });
      });
    }, options);
  }, [executeTransition]);

  return {
    isTransitioning,
    executeTransition,
    smoothTransition
  };
}