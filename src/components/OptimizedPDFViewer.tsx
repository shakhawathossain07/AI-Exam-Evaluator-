import { useState, useEffect, useRef, useMemo } from 'react';
import { ExternalLink, Download, AlertCircle, Loader2, FileText } from 'lucide-react';

interface OptimizedPDFViewerProps {
  file: File;
  pageNumber: number;
  className?: string;
}

// PDF URL cache to reuse blob URLs across components
const pdfUrlCache = new Map<string, string>();

// Create a unique key for the file
const createFileKey = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

export function OptimizedPDFViewer({ file, pageNumber, className = '' }: OptimizedPDFViewerProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the PDF URL to avoid recreating it
  const pdfUrl = useMemo(() => {
    if (!file || file.size === 0) return '';
    
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please provide a PDF file.');
      setIsLoading(false);
      return '';
    }

    const fileKey = createFileKey(file);
    
    // Check cache first
    if (pdfUrlCache.has(fileKey)) {
      const cachedUrl = pdfUrlCache.get(fileKey)!;
      const pageFragment = `#page=${pageNumber}&view=FitH&zoom=100`;
      return `${cachedUrl}${pageFragment}`;
    }

    try {
      const url = URL.createObjectURL(file);
      pdfUrlCache.set(fileKey, url);
      
      // Cleanup function for cache
      const cleanup = () => {
        URL.revokeObjectURL(url);
        pdfUrlCache.delete(fileKey);
      };
      
      // Set a timeout to clean up after 5 minutes of inactivity
      setTimeout(cleanup, 5 * 60 * 1000);
      
      const pageFragment = `#page=${pageNumber}&view=FitH&zoom=100`;
      return `${url}${pageFragment}`;
    } catch (err) {
      console.error('Error creating PDF URL:', err);
      setError('Failed to load PDF file.');
      setIsLoading(false);
      return '';
    }
  }, [file, pageNumber]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before the element is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF content.');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className={`border border-red-500/30 rounded-2xl p-6 bg-red-500/10 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-red-300">
            <p className="font-medium">PDF Loading Error</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/50 ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <div className="flex items-center space-x-2 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
            <span className="text-sm">Loading PDF...</span>
          </div>
        </div>
      )}
      
      {/* PDF iframe - only load when visible */}
      {isVisible && pdfUrl && (
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-[600px] border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`PDF Page ${pageNumber}`}
          loading="lazy"
        />
      )}
      
      {/* Fallback when not visible yet */}
      {!isVisible && (
        <div className="w-full h-[600px] flex items-center justify-center bg-slate-900/50">
          <div className="text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">PDF will load when visible</p>
          </div>
        </div>
      )}
      
      {/* PDF controls */}
      {!isLoading && !error && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={() => window.open(pdfUrl.split('#')[0], '_blank')}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 rounded-lg shadow-sm border border-slate-700 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-slate-300" />
          </button>
          <a
            href={pdfUrl.split('#')[0]}
            download={file.name}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 rounded-lg shadow-sm border border-slate-700 transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-slate-300" />
          </a>
        </div>
      )}
    </div>
  );
}
