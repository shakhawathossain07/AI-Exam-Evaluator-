import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Download, AlertCircle } from 'lucide-react';

interface PDFQuestionViewerProps {
  file: File;
  pageNumber: number;
}

export function PDFQuestionViewer({ file, pageNumber }: PDFQuestionViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (file && file.size > 0) {
      // Basic validation for PDF type
      if (file.type !== 'application/pdf') {
        setError('Invalid file type. Please provide a PDF file.');
        setIsLoading(false);
        return;
      }
      
      try {
        const url = URL.createObjectURL(file);
        // Use multiple methods to ensure page navigation works
        const pageFragment = `#page=${pageNumber}&view=FitH&zoom=100`;
        setPdfUrl(`${url}${pageFragment}`);
        setError('');
        setIsLoading(true);
        
        console.log(`[PDFQuestionViewer] Loading PDF page ${pageNumber} with URL: ${url}${pageFragment}`);
        
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('Failed to load PDF file. The file may be corrupted or invalid.');
        setIsLoading(false);
      }
    } else {
      setPdfUrl('');
      setError('');
      setIsLoading(false);
    }
  }, [file, pageNumber]);

  // Force iframe reload when page number changes
  useEffect(() => {
    if (pdfUrl && iframeRef.current) {
      setIsLoading(true);
      // Small delay to ensure the iframe has loaded before forcing page navigation
      const timer = setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = pdfUrl;
          console.log(`[PDFQuestionViewer] Reloaded iframe to page ${pageNumber}`);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pdfUrl, pageNumber]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('PDF failed to load. Please try viewing the file in a new tab.');
  };

  const handleViewInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error) {
    return (
      <div className="border border-red-500/30 rounded-2xl bg-red-500/10 p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-semibold mb-2">⚠️ {error}</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleViewInNewTab}
                className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="border border-slate-700/50 rounded-2xl bg-slate-900/50 p-4 text-center">
        <p className="text-sm text-slate-400">Loading PDF preview...</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-700/50 rounded-2xl bg-slate-900/50 overflow-hidden w-full h-[600px]">
      {/* Page indicator and controls */}
      <div className="bg-cyan-500/10 px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-cyan-400 font-medium">
            📄 Page {pageNumber} - {file.name}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleViewInNewTab}
              className="flex items-center space-x-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>New Tab</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 transition-colors"
              title="Download PDF"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Loading PDF...</p>
          </div>
        </div>
      )}
      
      {/* PDF iframe */}
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        title={`Student Answer PDF - Page ${pageNumber}`}
        width="100%"
        height="100%"
        className="border-none"
        style={{ height: 'calc(100% - 40px)' }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
}
