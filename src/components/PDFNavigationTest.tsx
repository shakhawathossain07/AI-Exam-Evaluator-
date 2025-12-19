import { useState } from 'react';
import { PDFQuestionViewer } from './PDFQuestionViewer';

interface PDFTestProps {
  file: File;
  totalPages?: number;
}

export function PDFNavigationTest({ file, totalPages = 5 }: PDFTestProps) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">PDF Page Navigation Test</h3>
        <p className="text-blue-700 mb-4">
          Use the controls below to test if the PDF auto-scrolls to the correct page when you click different page numbers.
        </p>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-700">Go to page:</span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
              }`}
            >
              Page {pageNum}
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-sm text-blue-600">
          Currently showing: <strong>Page {currentPage}</strong>
        </div>
      </div>

      <PDFQuestionViewer file={file} pageNumber={currentPage} />
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Expected Behavior:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• When you click a page button above, the PDF should automatically scroll to that page</li>
          <li>• The page indicator in the PDF viewer should update to show the correct page</li>
          <li>• The console should show debugging information about page navigation</li>
        </ul>
      </div>
    </div>
  );
}
