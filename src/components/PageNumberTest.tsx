// Test component to verify page number calculation logic
export function PageNumberTest() {
  const testQuestions = [
    { heading: "Question 1(a)", pageNumber: undefined },
    { heading: "Question 2(b)", pageNumber: undefined },
    { heading: "Page 2 Question 3", pageNumber: undefined },
    { heading: "Q4", pageNumber: undefined },
    { heading: "Question 5", pageNumber: 3 }, // AI provided
    { heading: "Some question", pageNumber: undefined }
  ];

  const totalPages = 3;

  const calculatePageNumber = (question: any, index: number, questions: any[], totalPages: number) => {
    let pageNumber = 1;
    let pageSource = 'default';

    // 1. Prioritize the page number from the AI's response
    if (typeof question.pageNumber === 'number' && question.pageNumber > 0) {
      pageNumber = question.pageNumber;
      pageSource = 'AI provided';
    } 
    // 2. Try to extract page number from question heading
    else if (question.heading && typeof question.heading === 'string') {
      const pageMatch = question.heading.match(/(?:page|p\.?)\s*(\d+)/i);
      if (pageMatch) {
        pageNumber = parseInt(pageMatch[1], 10);
        pageSource = 'extracted from heading';
      }
      // 3. Use question number patterns to estimate page
      else {
        const questionMatch = question.heading.match(/(?:question|q\.?)\s*(\d+)/i);
        if (questionMatch && totalPages && totalPages > 1) {
          const questionNum = parseInt(questionMatch[1], 10);
          const questionsPerPage = Math.ceil(questions.length / totalPages);
          pageNumber = Math.min(totalPages, Math.max(1, Math.ceil(questionNum / questionsPerPage)));
          pageSource = 'estimated from question number';
        }
        // 4. Use sequential distribution fallback
        else if (totalPages && totalPages > 0 && questions.length > 0) {
          pageNumber = Math.min(
            totalPages,
            Math.max(1, Math.ceil((index + 1) * (totalPages / questions.length)))
          );
          pageSource = 'calculated distribution';
        }
      }
    }
    // 5. Last resort: sequential distribution
    else if (totalPages && totalPages > 0 && questions.length > 0) {
      pageNumber = Math.min(
        totalPages,
        Math.max(1, Math.ceil((index + 1) * (totalPages / questions.length)))
      );
      pageSource = 'calculated fallback';
    }

    return { pageNumber, pageSource };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Page Number Calculation Test</h2>
      <p className="mb-4 text-gray-600">Total Pages: {totalPages}</p>
      
      <div className="space-y-3">
        {testQuestions.map((question, index) => {
          const { pageNumber, pageSource } = calculatePageNumber(question, index, testQuestions, totalPages);
          
          return (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{question.heading}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    AI provided: {question.pageNumber || 'undefined'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">Page {pageNumber}</div>
                  <div className="text-xs text-gray-500">{pageSource}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Logic Summary:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Use AI-provided pageNumber if available</li>
          <li>2. Extract from question heading (e.g., "Page 2 Question 1")</li>
          <li>3. Estimate from question number pattern</li>
          <li>4. Use sequential distribution across total pages</li>
          <li>5. Fallback to page 1</li>
        </ol>
      </div>
    </div>
  );
}
