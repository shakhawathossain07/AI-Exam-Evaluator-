import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Download } from 'lucide-react';
import type { UploadedFile } from '../types';

interface StudentPaperPreviewProps {
  files: UploadedFile[];
}

export function StudentPaperPreview({ files }: StudentPaperPreviewProps) {
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const urls: Record<string, string> = {};
    
    files.forEach((file) => {
      if (file.file.type === 'application/pdf') {
        urls[file.id] = URL.createObjectURL(file.file);
      }
    });
    
    setPdfUrls(urls);
    
    // Cleanup URLs when component unmounts
    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400">No student paper uploaded</p>
      </div>
    );
  }

  const handleDownload = (file: UploadedFile) => {
    if (file.file.type === 'application/pdf' && pdfUrls[file.id]) {
      const link = document.createElement('a');
      link.href = pdfUrls[file.id];
      link.download = file.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewInNewTab = (file: UploadedFile) => {
    if (file.file.type === 'application/pdf' && pdfUrls[file.id]) {
      window.open(pdfUrls[file.id], '_blank');
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-4 max-h-[600px] overflow-y-auto">
      <div className="grid grid-cols-1 gap-4">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="border border-slate-700/50 rounded-xl overflow-hidden"
          >
            {file.file.type === 'application/pdf' ? (
              <div className="space-y-3">
                {/* PDF Header with Actions */}
                <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{file.file.name}</p>
                        <p className="text-sm text-slate-400">PDF Document ({(file.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewInNewTab(file)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm border border-blue-500/20"
                        title="Open in new tab"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm border border-slate-600"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Iframe Viewer */}
                {pdfUrls[file.id] && (
                  <div className="px-4 pb-4">
                    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/50">
                      <iframe
                        src={`${pdfUrls[file.id]}#view=FitH&zoom=85`}
                        title={`Student Paper: ${file.file.name}`}
                        width="100%"
                        height="500"
                        className="border-none"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      📄 {file.file.name} - Use the controls above to view full document or download
                    </p>
                  </div>
                )}
              </div>
            ) : file.preview ? (
              <img
                src={file.preview}
                alt={file.file.name}
                className="w-full h-auto"
              />
            ) : (
              <div className="p-8 text-center bg-slate-800/50">
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-white font-medium">{file.file.name}</p>
                <p className="text-sm text-slate-400">Document</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}