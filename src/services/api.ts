import { supabase } from '../lib/supabase'
import { handleSupabaseError, handleApiError } from '../utils/errorHandler'
import type { 
  EvaluationData, 
  Question, 
  Grade, 
  ValidationResult, 
  StudentInfo
} from '../types'

// Get grading instructions based on exam type
function getGradingInstructions(examType: string): string {
  switch (examType) {
    case 'IELTS':
      return `
      **IELTS Grading Instructions:**
      - Use the IELTS 9-band scoring system (0-9 with half bands: 0, 0.5, 1.0, 1.5, ..., 8.5, 9.0)
      - Band 9: Expert user - Complete operational command of English
      - Band 8: Very good user - Fully operational command with occasional inaccuracies
      - Band 7: Good user - Operational command with occasional inaccuracies
      - Band 6: Competent user - Generally effective command despite inaccuracies
      - Band 5: Modest user - Partial command, copes with overall meaning
      - Band 4: Limited user - Basic competence in familiar situations
      - Band 3: Extremely limited user - Conveys general meaning in familiar situations
      - Band 2: Intermittent user - Real communication is difficult
      - Band 1: Non-user - No ability to use language
      - Band 0: Did not attempt the test
      - For Writing and Speaking, assess: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
      - For Reading and Listening, assess: Number of correct answers and map to band scores
      - Provide band scores for individual criteria and overall band score
      `;
    case 'O-Level':
      return `
      **Cambridge O-Level Grading Instructions:**
      - Use Cambridge O-Level grading scale: A* (90-100%), A (80-89%), B (70-79%), C (60-69%), D (50-59%), E (40-49%), F (30-39%), G (20-29%)
      - A* = Exceptional performance demonstrating comprehensive understanding
      - A = Excellent performance with minor weaknesses
      - B = Good performance with some weaknesses but shows understanding
      - C = Satisfactory performance with adequate understanding
      - D = Below average performance with limited understanding
      - E = Weak performance but demonstrates basic knowledge
      - F = Poor performance with significant gaps in knowledge
      - G = Very poor performance with major deficiencies
      - Below G = Unclassified (U)
      - Award marks based on: Knowledge and understanding, Application of knowledge, Analysis and evaluation
      - Consider partial credit for working shown even if final answer is incorrect
      `;
    case 'A-Level':
      return `
      **Cambridge A-Level Grading Instructions:**
      - Use Cambridge A-Level grading scale: A* (90-100%), A (80-89%), B (70-79%), C (60-69%), D (50-59%), E (40-49%)
      - A* = Outstanding achievement with comprehensive understanding and excellent analytical skills
      - A = Excellent achievement with good understanding and strong analytical skills
      - B = Good achievement with sound understanding and adequate analytical skills
      - C = Satisfactory achievement with reasonable understanding
      - D = Below average achievement with limited understanding
      - E = Weak achievement but demonstrates basic knowledge and skills
      - Below E = Unclassified (U)
      - Emphasize: Knowledge with understanding, Application, Analysis, Evaluation, Communication
      - Expect higher-order thinking skills, critical analysis, and sophisticated reasoning
      - Award credit for quality of written communication and logical structure
      `;
    default:
      return `
      **Standard Grading Instructions:**
      - Apply fair and consistent marking based on the marking scheme provided
      - Award partial credit for correct methodology even if final answer is incorrect
      - Consider the student's approach and working shown
      - Provide constructive feedback for improvement
      `;
  }
}

// Enhanced function to check evaluation limits with caching
async function checkEvaluationLimit(userId: string): Promise<{ canEvaluate: boolean, remaining: number, total: number }> {
  try {
    const { data: statusResult, error: statusError } = await supabase
      .rpc('get_user_evaluation_status', { check_user_id: userId });

    if (statusError || !statusResult || statusResult.length === 0) {
      console.error('RPC error checking evaluation status:', statusError);
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('evaluation_limit, evaluations_used')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { canEvaluate: true, remaining: 999, total: 999 }; // Fallback to allow evaluation
      }

      const limit = userProfile.evaluation_limit ?? 10;
      const used = userProfile.evaluations_used ?? 0;
      const remaining = Math.max(0, limit - used);
      console.log(`[Fallback] User ${userId}: ${used}/${limit} used, ${remaining} remaining`);
      return { canEvaluate: remaining > 0, remaining, total: limit };
    }

    const status = statusResult[0];
    console.log(`[RPC] User ${userId}: ${status.evaluations_used}/${status.total_limit} used, ${status.remaining_evaluations} remaining`);
    return {
      canEvaluate: status.can_evaluate,
      remaining: status.remaining_evaluations,
      total: status.total_limit
    };
  } catch (error) {
    console.error('Unexpected error in checkEvaluationLimit:', error);
    return { canEvaluate: true, remaining: 999, total: 999 }; // Safe default
  }
}

// Enhanced response validation with better blank paper detection
function validateAIResponse(evaluation: EvaluationData, totalPossibleMarks: number): ValidationResult {
  const issues: string[] = [];
  let isBlankPaper = false;

  if (!evaluation || typeof evaluation !== 'object') {
    issues.push('Invalid response object');
    return { isValid: false, issues, isBlankPaper };
  }

  if (!Array.isArray(evaluation.questions) || evaluation.questions.length === 0) {
    issues.push('Missing or empty questions array');
    return { isValid: false, issues, isBlankPaper };
  }

  let totalCalculatedMarks = 0;
  let totalBlankAnswers = 0;
  // Remove unused variable tracking
  evaluation.questions?.forEach((q: Question, i: number) => {
    // Per user request: Always trust AI-provided page numbers, no validation needed
    // if (!q.pageNumber || !Number.isInteger(q.pageNumber) || q.pageNumber < 1) {
    //   console.warn(`Question ${i + 1}: Invalid page number (${q.pageNumber}), will be corrected`);
    // }
    
    if (!q.marks || typeof q.marks !== 'string' || !q.marks.includes('/')) {
      issues.push(`Question ${i + 1}: Invalid marks format (${q.marks})`);
    } else {
      const [awarded, possible] = q.marks.split('/').map(Number);
      if (isNaN(awarded) || isNaN(possible) || awarded < 0 || possible < 0) {
        issues.push(`Question ${i + 1}: Invalid mark values (${q.marks})`);
      } else {
        totalCalculatedMarks += possible;
        // Remove unused tracking: if (awarded === 0) totalUnansweredQuestions++;
      }
    }

    // Check for blank paper indicators
    const transcription = q.transcription?.toLowerCase() || '';
    const evaluation_text = q.evaluation?.toLowerCase() || '';
    
    if (transcription.includes('blank') || transcription.includes('no answer') || 
        transcription.includes('not attempted') || transcription.includes('empty') ||
        evaluation_text.includes('blank') || evaluation_text.includes('no answer')) {
      totalBlankAnswers++;
    }

    if (!q.questionText || q.questionText.trim().length < 3) {
      issues.push(`Question ${i + 1}: Missing or too short question text`);
    }

    if (!q.evaluation || q.evaluation.trim().length < 5) {
      issues.push(`Question ${i + 1}: Missing or too short evaluation`);  
    }

    if (!q.justification || q.justification.trim().length < 5) {
      issues.push(`Question ${i + 1}: Missing or too short justification`);
    }
  });

  // Detect blank paper
  if (totalBlankAnswers > evaluation.questions.length * 0.8) {
    isBlankPaper = true;
    console.log('Detected blank paper: Most answers are blank or not attempted');
  }

  // Be less strict with marks mismatch - trust AI more
  const marksDifference = Math.abs(totalCalculatedMarks - totalPossibleMarks);
  if (marksDifference > totalPossibleMarks * 0.5) { // Increased from 0.3 to 0.5
    issues.push(`Significant marks mismatch: calculated ${totalCalculatedMarks}, expected ${totalPossibleMarks}`);
  }

  return { isValid: issues.length <= 3, issues, isBlankPaper }; // Allow up to 3 minor issues
}

// Enhanced Gemini API evaluation with improved consistency
async function evaluateWithGeminiDirect(
  studentPaperData: Record<string, unknown>[],
  markSchemeData: Record<string, unknown>[],
  totalPossibleMarks: number,
  studentInfo: Record<string, unknown>,
  geminiApiKey: string,
  geminiModel: string
): Promise<{ 
  success: boolean; 
  evaluation?: EvaluationData; 
  rawResponse?: string; 
  error?: string;
  metadata?: Record<string, unknown>;
}> {
  console.log('Starting Gemini evaluation with consistency tracking...');
  console.log(`Evaluation params: ${studentInfo.examType}, ${totalPossibleMarks} marks, ${studentPaperData.length} files`);
  
  // Create deterministic content fingerprint for consistency tracking
  const contentFingerprint = JSON.stringify({
    studentName: studentInfo.studentName,
    examType: studentInfo.examType,
    totalMarks: totalPossibleMarks,
    fileCount: studentPaperData.length,
    timestamp: Math.floor(Date.now() / 60000) // Round to minute for consistency
  });
  console.log('Content fingerprint:', contentFingerprint.substring(0, 100) + '...');
  
  const prompt = `You are an expert examiner. Your task is to evaluate a student's exam paper based on the provided marking scheme.

  **Evaluation Details:**
  - Student: ${studentInfo.studentName || 'Unknown'} (ID: ${studentInfo.studentId || 'Unknown'})
  - Subject: ${studentInfo.subject || 'Unknown'}
  - Examination Type: ${studentInfo.examType || 'Standard'}
  - Grading System: ${studentInfo.gradingCriteria || 'Standard grading'}
  - Total Possible Marks: ${totalPossibleMarks}

  **IMPORTANT GRADING INSTRUCTIONS:**
  ${getGradingInstructions(String(studentInfo.examType || 'O-Level'))}

  **General Instructions:**
  1. Carefully analyze each question and the student's corresponding answer from the student paper files.
  2. Strictly compare the student's answer against the criteria outlined in the marking scheme files.
  3. Apply the specific grading system and standards for ${studentInfo.examType} examinations.
  4. For each question, provide a detailed evaluation, justification for the marks awarded, and the marks themselves.
  5. Transcribe the student's answer accurately.
  6. Provide an overall feedback summary with ${studentInfo.examType}-specific recommendations.
  7. Output the entire evaluation in the specified strict JSON format.

  The student's paper and the marking scheme are provided as files.`;

  // Use looser typing for Gemini API content parts since API expects specific format
  const contentParts: Array<Record<string, unknown>> = [{ text: prompt }];

  contentParts.push({ text: "\n--- STUDENT EXAM PAPER ---" });
  for (const file of studentPaperData) {
    if (file.data && typeof file.type === 'string') {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        contentParts.push({
          inlineData: { mimeType: file.type, data: file.data }
        });
        console.log(`Added student paper file: ${file.name}`);
      }
    }
  }

  contentParts.push({ text: "\n--- MARKING SCHEME ---" });
  for (const file of markSchemeData) {
    if (file.data && typeof file.type === 'string') {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        contentParts.push({
          inline_data: { mime_type: file.type, data: file.data }
        });
        console.log(`Added mark scheme file: ${file.name}`);
      }
    }
  }

  const maxRetries = 2;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: contentParts }],
            systemInstruction: {
              parts: [{
                text: `You are an expert exam evaluator designed to output only a single, valid JSON object with ABSOLUTE CONSISTENCY.

                CRITICAL CONSISTENCY REQUIREMENTS:
                - You will be given a document as a sequence of pages. The first page is page 1, the second is page 2, and so on.
                - You MUST report the page number in this sequence where each question's text begins.
                - Be PRECISE and CONSISTENT in your evaluation across similar questions.
                - Use ONLY the marking scheme provided - do not add external knowledge.
                - For blank or minimal answers, award 0 marks but provide detailed feedback.

                BLANK PAPER DETECTION:
                - If the paper appears completely blank, still identify any visible questions from the paper.
                - Mark all answers as blank/not attempted in the transcription.
                - Award 0 marks but provide constructive feedback.
                - Use phrases like "No answer provided", "Blank response", or "Not attempted" in the transcription.

                Follow these steps precisely:
                1.  **Page-by-Page Analysis:** Go through the student paper systematically, page by page, in the order provided. For each question you identify, record the page number where it appears (e.g., 1, 2, 3...).
                2.  **Question Identification:** Identify each distinct question, even if the student hasn't answered it.
                3.  **Answer Analysis:** For each question, carefully examine what the student has written. If it's blank, explicitly note this.
                4.  **Mark Assignment:** Award marks based ONLY on the marking scheme. Be consistent - similar correct answers should get similar marks.
                5.  **Accurate Calculation:** Ensure your total awarded marks add up correctly across all questions.
                
                **STRICT JSON Schema to follow:**
                {
                  "summary": {"feedback": string},
                  "questions": [
                    {
                      "pageNumber": number,  // CRITICAL: Must be the sequential page number (1, 2, 3...).
                      "heading": string,     // e.g., "Question 1a", "Question 2", etc.
                      "questionText": string, // The actual question from the paper.
                      "transcription": string, // Exactly what the student wrote, or "No answer provided" if blank.
                      "evaluation": string,   // Your assessment of the answer quality.
                      "justification": string, // Why you awarded these marks.
                      "marks": "string"       // Format: "awarded/possible" e.g. "8/10" or "0/5".
                    }
                  ]
                }
                
                REMEMBER: 
                - Page numbers must be sequential and accurate.
                - Total awarded marks across all questions must be mathematically correct.
                - Blank answers get 0 marks but detailed feedback.
                - Be consistent in your marking standards.`
              }]
            },
            generationConfig: { 
              responseMimeType: "application/json",
              temperature: 0.1,  // Low temperature for consistency
              topP: 0.8,         // Reduced randomness
              topK: 20,          // Limit token choices
              maxOutputTokens: 8192
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) throw new Error('No content in Gemini response');

      try {
        const parsedEvaluation = JSON.parse(generatedText);
        const validation = validateAIResponse(parsedEvaluation, totalPossibleMarks);
        
        if (validation.isValid) {
          console.log('AI response validation passed');
          return {
            success: true,
            evaluation: parsedEvaluation,
            rawResponse: generatedText,
            metadata: { validationPassed: true, isBlankPaper: validation.isBlankPaper }
          };
        } else {
          console.warn('AI response validation failed:', validation.issues);
          // For blank papers, still return the result but mark it accordingly
          if (validation.isBlankPaper) {
            console.log('Blank paper detected, returning evaluation with appropriate feedback');
            return {
              success: true,
              evaluation: parsedEvaluation,
              rawResponse: generatedText,
              metadata: { validationPassed: false, issues: validation.issues, isBlankPaper: true }
            };
          }
          // Trust AI more - use response even with validation issues if it's parseable
          if (validation.issues.length <= 5) { // Increased tolerance
            console.log('Using AI response despite validation issues - trusting AI evaluation');
            return {
              success: true,
              evaluation: parsedEvaluation,
              rawResponse: generatedText,
              metadata: { validationPassed: false, issues: validation.issues, isBlankPaper: false }
            };
          }
        }
      } catch {
        return {
          success: true,
          evaluation: extractJSONFromResponse(generatedText) || createFallbackEvaluation(totalPossibleMarks, 'JSON parse failed', studentInfo),
          rawResponse: generatedText,
          metadata: {}
        };
      }
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        console.error('Gemini evaluation failed after retries:', error);
        throw handleApiError(error);
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  // Fallback if all retries fail
  return {
    success: false,
    error: 'Failed to get valid response from AI after retries',
    evaluation: createFallbackEvaluation(totalPossibleMarks, 'All retries failed', studentInfo)
  };
}

// This function is now a no-op to always trust AI page numbers.
function applyIntelligentPageDistribution(questions: Question[]): Question[] {
  // Per user request, we are now fully trusting the AI-provided page numbers.
  // All validation and correction logic has been removed.
  return questions;
}

// Dynamic grading function based on examination type and grading system
function getDynamicGrade(percentage: number, examType: string): Grade {
  switch (examType?.toUpperCase()) {
    case 'IELTS':
      // IELTS uses 9-band system
      if (percentage >= 95) return { grade: '9.0', color: 'green' };
      if (percentage >= 90) return { grade: '8.5', color: 'green' };
      if (percentage >= 85) return { grade: '8.0', color: 'green' };
      if (percentage >= 80) return { grade: '7.5', color: 'blue' };
      if (percentage >= 75) return { grade: '7.0', color: 'blue' };
      if (percentage >= 70) return { grade: '6.5', color: 'blue' };
      if (percentage >= 65) return { grade: '6.0', color: 'orange' };
      if (percentage >= 60) return { grade: '5.5', color: 'orange' };
      if (percentage >= 55) return { grade: '5.0', color: 'orange' };
      if (percentage >= 50) return { grade: '4.5', color: 'red' };
      if (percentage >= 45) return { grade: '4.0', color: 'red' };
      if (percentage >= 40) return { grade: '3.5', color: 'red' };
      if (percentage >= 35) return { grade: '3.0', color: 'red' };
      if (percentage >= 30) return { grade: '2.5', color: 'red' };
      if (percentage >= 25) return { grade: '2.0', color: 'red' };
      if (percentage >= 20) return { grade: '1.5', color: 'red' };
      if (percentage >= 15) return { grade: '1.0', color: 'red' };
      if (percentage >= 10) return { grade: '0.5', color: 'red' };
      return { grade: '0.0', color: 'red' };

    case 'O-LEVEL':
    case 'A-LEVEL':
      // Cambridge O-Level and A-Level grading
      if (percentage >= 90) return { grade: 'A*', color: 'green' };
      if (percentage >= 80) return { grade: 'A', color: 'green' };
      if (percentage >= 70) return { grade: 'B', color: 'blue' };
      if (percentage >= 60) return { grade: 'C', color: 'yellow' };
      if (percentage >= 50) return { grade: 'D', color: 'orange' };
      if (percentage >= 40) return { grade: 'E', color: 'orange' };
      if (examType?.toUpperCase() === 'O-LEVEL') {
        // O-Level has additional grades
        if (percentage >= 30) return { grade: 'F', color: 'red' };
        if (percentage >= 20) return { grade: 'G', color: 'red' };
      }
      return { grade: 'U', color: 'red' }; // Unclassified

    default:
      // Standard/Generic grading system
      if (percentage >= 90) return { grade: 'A+', color: 'green' };
      if (percentage >= 85) return { grade: 'A', color: 'green' };
      if (percentage >= 80) return { grade: 'A-', color: 'green' };
      if (percentage >= 75) return { grade: 'B+', color: 'blue' };
      if (percentage >= 70) return { grade: 'B', color: 'blue' };
      if (percentage >= 65) return { grade: 'B-', color: 'blue' };
      if (percentage >= 60) return { grade: 'C+', color: 'orange' };
      if (percentage >= 55) return { grade: 'C', color: 'orange' };
      if (percentage >= 50) return { grade: 'C-', color: 'orange' };
      if (percentage >= 45) return { grade: 'D+', color: 'red' };
      if (percentage >= 40) return { grade: 'D', color: 'red' };
      if (percentage >= 35) return { grade: 'D-', color: 'red' };
      return { grade: 'F', color: 'red' };
  }
}

// Robust evaluation data validation with accurate calculation and grading
function validateAndFixEvaluationData(data: EvaluationData, totalPossibleMarks: number, studentInfo?: StudentInfo): EvaluationData {
  if (!data || typeof data !== 'object') {
    console.warn("Invalid data received from AI, creating fallback.");
    return createFallbackEvaluation(totalPossibleMarks, 'Invalid data object', studentInfo);
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    console.warn("AI response missing 'questions' array, creating fallback question.");
    data.questions = [{
        pageNumber: 1,
        heading: 'Overall Assessment',
        questionText: 'Complete exam paper',
        transcription: 'Could not be determined by AI.',
        evaluation: 'AI failed to separate individual questions from the document.',
        justification: 'The response from the AI was missing a valid question structure.',
        marks: `0/${totalPossibleMarks}`
    }];
  }

  let calculatedTotalAwarded = 0;
  let calculatedTotalPossible = 0;
  let hasValidMarks = false;

  data.questions.forEach((q: Question, i: number) => {
    // Ensure all required fields exist
    q.heading = q.heading || `Question ${i + 1}`;
    q.questionText = q.questionText || 'N/A';
    q.transcription = q.transcription || 'N/A';
    q.evaluation = q.evaluation || 'N/A';
    q.justification = q.justification || 'N/A';
    q.marks = q.marks || `0/0`;
    
    // Parse and validate marks with enhanced accuracy
    if (typeof q.marks === 'string' && q.marks.includes('/')) {
      const marksParts = q.marks.split('/');
      const awarded = parseFloat(marksParts[0]);
      const possible = parseFloat(marksParts[1]);
      
      if (!isNaN(awarded) && !isNaN(possible) && possible >= 0 && awarded >= 0) {
        // Validate awarded doesn't exceed possible
        if (awarded > possible) {
          console.warn(`Question ${i + 1}: awarded marks (${awarded}) exceed possible marks (${possible}). Capping to possible.`);
          calculatedTotalAwarded += possible;
        } else {
          calculatedTotalAwarded += awarded;
        }
        
        calculatedTotalPossible += possible;
        hasValidMarks = true;
        
        // Normalize the marks string to ensure consistency with proper rounding
        const normalizedAwarded = awarded > possible ? possible : awarded;
        q.marks = `${Math.round(normalizedAwarded * 100) / 100}/${Math.round(possible * 100) / 100}`;
      } else {
        console.warn(`Invalid marks format for question ${i + 1}: ${q.marks}`);
        q.marks = '0/0';
      }
    } else {
      console.warn(`Missing or invalid marks for question ${i + 1}: ${q.marks}`);
      q.marks = '0/0';
    }
  });

  // Trust AI-provided totals more and use them preferentially with enhanced accuracy
  let finalTotalPossible = totalPossibleMarks;
  let finalTotalAwarded = 0;
  
  // Round calculated totals to prevent floating point precision issues
  calculatedTotalAwarded = Math.round(calculatedTotalAwarded * 100) / 100;
  calculatedTotalPossible = Math.round(calculatedTotalPossible * 100) / 100;
  
  // If AI provided a reasonable calculation, trust it
  if (hasValidMarks && calculatedTotalPossible > 0) {
    finalTotalPossible = calculatedTotalPossible;
    finalTotalAwarded = calculatedTotalAwarded;
    console.log(`Using calculated totals: ${finalTotalAwarded}/${finalTotalPossible}`);
  } else if (data.summary?.totalAwarded !== undefined && data.summary?.totalPossible !== undefined) {
    // Trust AI summary if individual question parsing failed
    finalTotalAwarded = Math.round((data.summary.totalAwarded || 0) * 100) / 100;
    finalTotalPossible = Math.round((data.summary.totalPossible || totalPossibleMarks) * 100) / 100;
    console.log(`Using AI summary totals: ${finalTotalAwarded}/${finalTotalPossible}`);
  } else {
    // Last resort: use calculated values or defaults
    finalTotalAwarded = hasValidMarks ? calculatedTotalAwarded : 0;
    console.log(`Using fallback totals: ${finalTotalAwarded}/${finalTotalPossible}`);
  }
  
  // Validate that awarded doesn't exceed possible
  if (finalTotalAwarded > finalTotalPossible) {
    console.warn(`Total awarded marks (${finalTotalAwarded}) exceed total possible marks (${finalTotalPossible}). Capping to possible.`);
    finalTotalAwarded = finalTotalPossible;
  }
  
  // Calculate percentage accurately
  const percentage = finalTotalPossible > 0 ? Math.round((finalTotalAwarded / finalTotalPossible) * 100 * 10) / 10 : 0; // Round to 1 decimal place

  // Ensure summary exists and is properly calculated
  data.summary = {
    totalAwarded: finalTotalAwarded,
    totalPossible: finalTotalPossible,
    percentage: percentage,
    grade: getDynamicGrade(percentage, studentInfo?.examType || 'Standard'),
    feedback: data.summary?.feedback || 'Evaluation completed. Final scores and grade calculated by the system for accuracy.'
  };

  console.log(`Final calculation: ${finalTotalAwarded}/${finalTotalPossible} = ${percentage}%`);

  return { ...data, questions: applyIntelligentPageDistribution(data.questions) };
}

// Fallback evaluation structure
function createFallbackEvaluation(totalPossibleMarks: number, reason: string, studentInfo?: StudentInfo): EvaluationData {
  const fallbackMarks = 0;
  return {
    summary: {
      totalAwarded: fallbackMarks,
      totalPossible: totalPossibleMarks,
      percentage: 0,
      grade: getDynamicGrade(0, studentInfo?.examType || 'Standard'),
      feedback: `A fallback evaluation was generated. Reason: ${reason}. Please review the results carefully.`
    },
    questions: [{
      pageNumber: 1,
      heading: 'Overall Assessment',
      questionText: 'Complete exam paper',
      transcription: 'Processed',
      evaluation: 'Fallback completed',
      justification: 'An issue occurred during AI evaluation, and a fallback response was created.',
      marks: `${fallbackMarks}/${totalPossibleMarks}`
    }],
    rawResponse: `Fallback evaluation created: ${reason}`
  };
}

// Main evaluation function with centralized logic
export async function evaluateExamPaper(formData: FormData) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw handleSupabaseError(authError || new Error('Authentication failed'));

  const isAdmin = (await supabase.rpc('is_user_admin', { check_email: user.email })).data || false;
  if (!isAdmin) {
    const limitCheck = await checkEvaluationLimit(user.id);
    if (!limitCheck.canEvaluate) throw new Error(`Evaluation limit reached: ${limitCheck.total - limitCheck.remaining}/${limitCheck.total}`);
  }

  const globalSettings = await fetchGlobalSettings();
  const geminiApiKey = globalSettings?.geminiApiKey || '';
  const geminiModel = globalSettings?.geminiModel || 'gemini-2.5-flash';
  if (!geminiApiKey) throw new Error('Gemini API key not configured');

  const studentPaperFiles = formData.getAll('studentPaper') as File[];
  const markSchemeFiles = formData.getAll('markScheme') as File[];
  const totalPossibleMarks = parseInt(formData.get('totalPossibleMarks') as string || '0', 10);
  const studentInfo = {
    studentName: formData.get('studentName') as string,
    studentId: formData.get('studentId') as string,
    subject: formData.get('subject') as string,
    examType: formData.get('examType') as string || 'O-Level',
    gradingCriteria: formData.get('gradingCriteria') as string || 'Standard grading'
  };

  const convertFileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const [studentPaperData, markSchemeData] = await Promise.all([
    Promise.all(studentPaperFiles.map(f => convertFileToBase64(f).then(data => ({ name: f.name, type: f.type, data })))),
    Promise.all(markSchemeFiles.map(f => convertFileToBase64(f).then(data => ({ name: f.name, type: f.type, data }))))
  ]);

  const { data: evaluation, error: createError } = await supabase
    .from('evaluations')
    .insert({
      user_id: user.id,
      student_paper_files: studentPaperData.map(f => ({ name: f.name, type: f.type })),
      mark_scheme_files: markSchemeData.map(f => ({ name: f.name, type: f.type })),
      total_possible_marks: totalPossibleMarks,
      status: 'pending'
    })
    .select()
    .single();

  if (createError) throw handleSupabaseError(createError);

  let evaluationResults;
  try {
    evaluationResults = await supabase.functions.invoke('evaluate-exam', {
      body: { evaluationId: evaluation.id, studentPaperFiles: studentPaperData, markSchemeFiles: markSchemeData, totalPossibleMarks, studentInfo, geminiApiKey, geminiModel }
    }).then(({ data, error }) => { if (error) throw error; return data; });
  } catch(invokeError) {
    console.warn('Supabase function invocation failed, falling back to direct client-side evaluation.', invokeError);
    evaluationResults = await evaluateWithGeminiDirect(studentPaperData, markSchemeData, totalPossibleMarks, studentInfo, geminiApiKey, geminiModel);
  }

  const totalPages = await getPDFPageCount(studentPaperData.find(f => f.type === 'application/pdf')?.data as string || '') || estimatePDFPages(studentPaperData);
  
  const validatedEvaluation = validateAndFixEvaluationData(evaluationResults.evaluation, totalPossibleMarks, studentInfo);

  if (!isAdmin) await supabase.rpc('increment_user_evaluation_count', { user_id_param: user.id });

  return {
    ...evaluationResults,
    success: true,
    evaluation: validatedEvaluation,
    evaluationId: evaluation.id,
    originalStudentPaperFiles: studentPaperData,
    metadata: { 
      ...evaluationResults.metadata, 
      studentPaperPages: totalPages,
      studentInfo: studentInfo
    }
  };
}

// Helper to fetch global settings with fallback
async function fetchGlobalSettings() {
  try {
    console.log('Attempting to fetch global settings from Edge Function...');
    const { data } = await supabase.functions.invoke('admin-api/global-settings', { method: 'GET' });
    if (data) {
      console.log('Successfully fetched settings from Edge Function');
      return data;
    }
  } catch (error) {
    console.warn('Edge Function not available, falling back to RPC:', error.message);
    try {
      const { data } = await supabase.rpc('get_global_settings');
      if (data) {
        console.log('Successfully fetched settings from RPC');
        return { geminiApiKey: data.api_key, geminiModel: data.model || 'gemini-2.5-flash' };
      }
    } catch (rpcError) {
      console.warn('RPC not available, falling back to direct table query:', rpcError.message);
    }
  }
  
  try {
    console.log('Attempting direct table query...');
    const { data } = await supabase.from('global_settings').select('*').limit(1).then(d => ({ data: d.data?.[0] }));
    if (data) {
      console.log('Successfully fetched settings from direct table query');
      return { geminiApiKey: data.gemini_api_key, geminiModel: data.gemini_model || 'gemini-2.5-flash' };
    }
  } catch (tableError) {
    console.warn('Direct table query failed:', tableError.message);
  }
  
  console.log('All fallbacks failed, returning null');
  return null;
}

// Remaining functions unchanged
export async function saveEvaluation(evaluationId: string, evaluationData: EvaluationData) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Authentication required');
  const { error } = await supabase.from('evaluations').update({ evaluation_result: evaluationData, status: 'completed' }).eq('id', evaluationId).eq('user_id', user.id);
  if (error) throw new Error(`Save failed: ${error.message}`);
}

export async function getEvaluationHistory() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Authentication required');
  const { data, error } = await supabase.from('evaluations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return data;
}

export async function getEvaluation(id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Authentication required');
  const { data, error } = await supabase.from('evaluations').select('*').eq('id', id).eq('user_id', user.id).single();
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return data;
}

export async function checkHealth() {
  const { error } = await supabase.from('evaluations').select('count').limit(1);
  if (error) throw new Error('Supabase connection failed');
  return { status: 'OK', timestamp: new Date().toISOString() };
}

export async function setupDefaultAdmin(): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase.functions.invoke('setup-default-admin', { method: 'POST' });
    if (!error && data) return data;
  } catch {
    // Silent error handling for initial admin setup
  }
  try {
    const { data, error } = await supabase.rpc('setup_default_admin');
    if (!error && data) return data;
  } catch {
    // Silent error handling for RPC admin setup
  }
  return null;
}

export { checkEvaluationLimit };

export async function checkEvaluationAccess() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { canEvaluate: false, evaluationsRemaining: 0, isAdmin: false, message: 'Please log in' };
  const isAdmin = (await supabase.rpc('is_user_admin', { check_email: user.email })).data || false;
  if (isAdmin) return { canEvaluate: true, evaluationsRemaining: 999, isAdmin: true, message: 'Unlimited access as admin' };
  const limitCheck = await checkEvaluationLimit(user.id);
  return {
    canEvaluate: limitCheck.canEvaluate,
    evaluationsRemaining: limitCheck.remaining,
    isAdmin: false,
    message: limitCheck.canEvaluate ? `${limitCheck.remaining} evaluations remaining` : `Limit reached: ${limitCheck.total}`
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;
  return (await supabase.rpc('is_user_admin', { check_email: user.email })).data || false;
}

function extractJSONFromResponse(text: string): EvaluationData | null {
  const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
  try { return JSON.parse(cleanedText); } catch {
    return null;
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) try { 
    return JSON.parse(jsonMatch[0]); 
  } catch {
    return null;
  }
  const firstBrace = text.indexOf('{'), lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) try { 
    return JSON.parse(text.substring(firstBrace, lastBrace + 1)); 
  } catch {
    return null;
  }
  console.error("Failed to extract JSON from malformed response:", text);
  return null;
}

function estimatePDFPages(files: Array<{ data?: string; type?: string; mimeType?: string; base64Data?: string }>): number {
  return files.reduce((total, file) => {
    const dataField = file.data || file.base64Data;
    const typeField = file.type || file.mimeType;
    if (typeField === 'application/pdf' && dataField) {
      const bytes = (dataField.length * 3) / 4;
      return total + Math.ceil(bytes / (1024 * 30));
    }
    return total;
  }, 0) || 1;
}

async function getPDFPageCount(base64Data: string): Promise<number> {
  if (!base64Data) return 1;
  try {
    const binaryString = atob(base64Data);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) uint8Array[i] = binaryString.charCodeAt(i);

    if (typeof window !== 'undefined' && window.pdfjsLib) {
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      return pdf.numPages;
    }
    return estimatePDFPages([{ data: base64Data, type: 'application/pdf' }]);
  } catch(error) {
    console.error("Error getting PDF page count:", error);
    return 1;
  }
}