// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const existing = this.metrics.get(label)!;
      existing.push(duration);
      
      // Keep only last 10 measurements
      if (existing.length > 10) {
        existing.shift();
      }
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [label, times] of this.metrics.entries()) {
      if (times.length > 0) {
        result[label] = {
          average: this.getAverageTime(label),
          count: times.length,
          latest: times[times.length - 1]
        };
      }
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// React hook for performance monitoring
export function usePerformance(label: string, dependencies: any[] = []) {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    const stopTiming = monitor.startTiming(label);
    return stopTiming;
  }, dependencies);
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
}

// Log memory usage in development
export function logMemoryUsage(label?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const memory = getMemoryUsage();
    if (memory) {
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100;
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100;
      
      console.log(`Memory${label ? ` (${label})` : ''}: ${used}MB / ${total}MB (limit: ${limit}MB)`);
    }
  }
}

// React import fix
import React from 'react';
