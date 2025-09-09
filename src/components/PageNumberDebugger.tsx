import { useState } from 'react';

interface PageNumberDebuggerProps {
  questions: Array<{
    pageNumber?: number;
    heading: string;
    questionText: string;
  }>;
  totalPages: number;
}

export function PageNumberDebugger({ questions, totalPages }: PageNumberDebuggerProps) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <button
          onClick={() => setShowDebug(true)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          🔧 Show Page Number Debug Info
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">📊 Page Number Debug Information</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white p-3 rounded border">
          <p><strong>Document Info:</strong></p>
          <p>📄 Estimated Total Pages: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{totalPages}</span></p>
          <p>❓ Total Questions Found: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{questions.length}</span></p>
        </div>

        <div className="bg-white p-3 rounded border">
          <p className="font-semibold mb-2">🎯 Question → Page Mapping:</p>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                  Q{index + 1}
                </span>
                <span className="truncate flex-1 text-sm">
                  {question.heading || `Question ${index + 1}`}
                </span>
                <span className={`font-mono px-2 py-1 rounded text-sm ${
                  question.pageNumber && question.pageNumber > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  Page {question.pageNumber || 'MISSING'}
                </span>
                {question.pageNumber && question.pageNumber > totalPages && (
                  <span className="text-orange-600 text-sm">⚠️ Exceeds total</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-3 rounded border">
          <p className="font-semibold mb-2">📈 Page Distribution Analysis:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium">Questions per Page:</p>
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const questionsOnPage = questions.filter(q => q.pageNumber === pageNum).length;
                return (
                  <div key={pageNum} className="flex justify-between text-sm">
                    <span>Page {pageNum}:</span>
                    <span className={`font-mono ${questionsOnPage === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {questionsOnPage} question{questionsOnPage !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-medium">Issue Summary:</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>✅ Valid Pages:</span>
                  <span className="font-mono">
                    {questions.filter(q => q.pageNumber && q.pageNumber > 0 && q.pageNumber <= totalPages).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>❌ Missing Pages:</span>
                  <span className="font-mono text-red-600">
                    {questions.filter(q => !q.pageNumber || q.pageNumber <= 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>⚠️ Out of Range:</span>
                  <span className="font-mono text-orange-600">
                    {questions.filter(q => q.pageNumber && q.pageNumber > totalPages).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <p className="text-sm text-yellow-800">
            💡 <strong>Debug Tip:</strong> If many questions show "Page MISSING" or all questions are on Page 1, 
            the AI is not properly analyzing the PDF structure. Check the console logs for detailed AI response information.
          </p>
        </div>
      </div>
    </div>
  );
}
