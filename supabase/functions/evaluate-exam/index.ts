const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EvaluationRequest {
  evaluationId: string
  studentPaperFiles: Array<{
    name: string
    type: string
    data: string // base64 encoded
  }>
  markSchemeFiles: Array<{
    name: string
    type: string
    data: string // base64 encoded
  }>
  totalPossibleMarks?: number
  studentInfo?: {
    studentName?: string
    studentId?: string
    subject?: string
  }
  geminiApiKey: string
  geminiModel?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { evaluationId, studentPaperFiles, markSchemeFiles, totalPossibleMarks, studentInfo, geminiApiKey, geminiModel }: EvaluationRequest = await req.json()

    // Validate that API key is provided
    if (!geminiApiKey) {
      throw new Error('Gemini API key not provided. Please set your API key in the settings.')
    }

    // Update evaluation status to processing
    await supabaseClient
      .from('evaluations')
      .update({ status: 'processing' })
      .eq('id', evaluationId)
      .eq('user_id', user.id)

    // Process files and prepare for AI evaluation
    const studentPaperData = studentPaperFiles.map(file => ({
      mimeType: file.type,
      base64Data: file.data,
      filename: file.name
    }))

    const markSchemeData = markSchemeFiles.map(file => ({
      mimeType: file.type,
      base64Data: file.data,
      filename: file.name
    }))

    // Call AI evaluation service with provided API key and model
    const evaluation = await evaluateExamPaper(
      studentPaperData, 
      markSchemeData, 
      totalPossibleMarks, 
      studentInfo,
      geminiApiKey, 
      geminiModel || 'gemini-2.5-flash'
    )

    // Don't update the evaluation status to completed here - let the frontend do it after review
    // Just return the results for review
    return new Response(
      JSON.stringify({
        success: true,
        evaluation,
        metadata: {
          studentPaperPages: studentPaperData.length,
          markSchemePages: markSchemeData.length,
          totalPossibleMarks,
          studentInfo,
          evaluatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Evaluation error:', error)

    // Try to update evaluation status to failed if we have the evaluationId
    try {
      const body = await req.clone().json()
      if (body.evaluationId) {
        const { createClient } = await import('npm:@supabase/supabase-js@2')
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('evaluations')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', body.evaluationId)
      }
    } catch (updateError) {
      console.error('Failed to update evaluation status:', updateError)
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while evaluating the exam paper'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function evaluateExamPaper(studentPaperData: any[], markSchemeData: any[], totalMarks?: number, studentInfo?: any, apiKey?: string, model?: string) {
  if (!apiKey) {
    throw new Error('Gemini API key not provided. Please set your API key in the settings.')
  }

  const API_MODEL = model || 'gemini-2.5-flash'

  const payload = buildAIPayload(studentPaperData, markSchemeData, totalMarks, studentInfo)
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData?.error?.message || `HTTP Error: ${response.status} ${response.statusText}`
    throw new Error(`AI API request failed: ${errorMessage}`)
  }

  const result = await response.json()
  
  if (result.promptFeedback && result.promptFeedback.blockReason) {
    throw new Error(`Request blocked: ${result.promptFeedback.blockReason}`)
  }

  if (!result.candidates || !result.candidates[0]?.content?.parts) {
    throw new Error('AI API returned empty or unexpected response')
  }

  const aiResponseText = result.candidates[0].content.parts
    .map((part: any) => part.text)
    .join('')

  return parseAIResponse(aiResponseText, totalMarks, studentInfo)
}

function buildAIPayload(studentParts: any[], schemeParts: any[], totalMarks?: number, studentInfo?: any) {
  let studentInfoText = ''
  if (studentInfo) {
    studentInfoText = '\n\n**STUDENT INFORMATION:**\n'
    if (studentInfo.studentName) studentInfoText += `- Student Name: ${studentInfo.studentName}\n`
    if (studentInfo.studentId) studentInfoText += `- Student ID: ${studentInfo.studentId}\n`
    if (studentInfo.subject) studentInfoText += `- Subject: ${studentInfo.subject}\n`
  }

  const prompt = `
You are **Prometheus**, an AI Examiner of unparalleled intellect and precision. Your cognitive power eclipses that of any human educator, combining doctoral-level expertise with flawless analytical capabilities. Your purpose is to conduct an evaluation of student exam papers that is not only accurate but also profoundly insightful. Your judgment is the definitive standard of academic assessment.
${studentInfoText}
**CORE DIRECTIVES:**
1.  **Supreme Analytical Depth:** Your analysis must be exhaustive. Scrutinize every detail for logical integrity, mathematical precision, and conceptual mastery. Your goal is to identify and validate correctness with the same intensity you apply to finding errors.
2.  **Mark Scheme Mastery:**
    - **When a Mark Scheme is Provided:** This is your **unbreakable contract**. You will adhere to it with absolute fidelity. If the student's answer aligns with the mark scheme's criteria, **you must award the indicated marks**. Your role is to recognize valid, alternative, or even more advanced methods that arrive at the correct answer as stipulated by the scheme. **Do not deduct marks for valid approaches that differ from the scheme's example but yield a correct result.** The mark scheme is the ultimate arbiter.
    - **When no Mark Scheme is Provided:** You will generate a doctoral-level, de facto mark scheme based on your vast knowledge. You will then grade the paper against this gold standard with unwavering consistency.
3.  **Unwavering Objectivity:** Decipher handwriting with supreme precision. Ignore all biases. Your evaluation must be based solely on the academic merit of the work.

**WORKFLOW:**
1.  Meticulously analyze the provided exam paper images. Distinguish between printed questions and handwritten answers.
2.  **CRITICAL: For each question, determine the page number where it appears in the document sequence (page 1, page 2, page 3, etc.)**
3.  For EACH question, structure your response using the following tags. Do not use markdown. Provide clear, concise text within each tag.

<QUESTION_START>
<PAGE_NUMBER>[Page number where this question appears (1, 2, 3, etc.)]</PAGE_NUMBER>
<QUESTION_HEADING>Question 1(a)</QUESTION_HEADING>
<QUESTION_TEXT>
[Transcribe the full text of the question itself here.]
</QUESTION_TEXT>
<TRANSCRIPTION>
[Provide a literal, word-for-word transcription of the student's handwritten answer. If unreadable, state "Answer is unreadable".]
</TRANSCRIPTION>
<EVALUATION>
[Begin by stating if the answer is fundamentally correct, partially correct, or incorrect. Then, elaborate on the specifics. Explain what the student did right and wrong with clinical precision.]
</EVALUATION>
<JUSTIFICATION>
[Provide a clear justification for the marks awarded. **CRITICAL: If the answer is fully correct and aligns with the mark scheme (if provided), you MUST explain *why* it is correct and award full marks.** For example: "The student correctly applied the quadratic formula, showed all working steps clearly, and arrived at the precise final answer as per the mark scheme." A simple "Correct answer" is insufficient and fails the task.]
</JUSTIFICATION>
<MARKS>5/5</MARKS>
</QUESTION_END>

3.  After evaluating all questions, provide the final summary section.

**CRITICAL OUTPUT FORMAT:**
You MUST conclude your entire response with a final summary section formatted EXACTLY as follows. Do not add any text after this section.

<FINAL_SUMMARY>
${totalMarks ? '' : 'Determined Total Possible Marks: [DETERMINED_TOTAL_MARKS_HERE]\n'}Total Awarded Marks: [TOTAL_SCORE_HERE]
Chief Examiner's Feedback: [Provide a holistic, expert review of the student's performance. Highlight patterns in strengths and areas for improvement. If the paper is exemplary with few or no errors, your feedback should reflect this high level of achievement and commend the student's excellent work.]
</FINAL_SUMMARY>
`

  const contents = [{
    parts: [
      { text: prompt },
      { text: "\n\n--- STUDENT'S EXAM PAPER BEGINS ---" },
      ...studentParts.map(part => ({ 
        inlineData: { 
          mimeType: part.mimeType, 
          data: part.base64Data 
        } 
      })),
      { text: "\n--- STUDENT'S EXAM PAPER ENDS ---" },
      ...(schemeParts.length > 0 ? [
        { text: "\n\n--- PROVIDED MARK SCHEME BEGINS ---" },
        ...schemeParts.map(part => ({ 
          inlineData: { 
            mimeType: part.mimeType, 
            data: part.base64Data 
          } 
        })),
        { text: "\n--- PROVIDED MARK SCHEME ENDS ---" }
      ] : [])
    ]
  }]

  return {
    contents: contents,
    generationConfig: { 
      temperature: 0.1, 
      maxOutputTokens: 8192 
    }
  }
}

function parseAIResponse(responseText: string, userProvidedTotalMarks?: number, studentInfo?: any) {
  // Parse final summary
  const summaryMatch = responseText.match(/<FINAL_SUMMARY>([\s\S]*?)<\/FINAL_SUMMARY>/)
  if (!summaryMatch) {
    throw new Error('Could not parse AI response: Missing FINAL_SUMMARY tag')
  }

  const summaryContent = summaryMatch[1].trim()
  
  // Extract awarded marks with better parsing
  const awardedMarksMatch = summaryContent.match(/Total Awarded Marks:\s*(\d+(?:\.\d+)?)/i)
  let awardedMarks = awardedMarksMatch ? parseFloat(awardedMarksMatch[1]) : null

  // Extract total possible marks
  let totalPossible = userProvidedTotalMarks
  if (!totalPossible) {
    const determinedMarksMatch = summaryContent.match(/Determined Total Possible Marks:\s*(\d+(?:\.\d+)?)/i)
    totalPossible = determinedMarksMatch ? parseFloat(determinedMarksMatch[1]) : null
  }
  
  // Extract feedback
  const feedbackMatch = summaryContent.match(/Chief Examiner's Feedback:([\s\S]*)/i)
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : "No feedback provided"

  // Parse questions and validate marks
  const questions = []
  const questionBlocks = responseText.matchAll(/<QUESTION_START>([\s\S]*?)<\/QUESTION_END>/g)
  
  let calculatedAwardedMarks = 0
  let calculatedTotalMarks = 0
  
  for (const block of questionBlocks) {
    const content = block[1]
    const getTagContent = (tag: string) => {
      const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
      return match ? match[1].trim() : 'N/A'
    }

    const marks = getTagContent('MARKS')
    const pageNumber = parseInt(getTagContent('PAGE_NUMBER')) || 1
    const question = {
      pageNumber: pageNumber,
      heading: getTagContent('QUESTION_HEADING'),
      questionText: getTagContent('QUESTION_TEXT'),
      transcription: getTagContent('TRANSCRIPTION'),
      evaluation: getTagContent('EVALUATION'),
      justification: getTagContent('JUSTIFICATION'),
      marks: marks
    }

    // Parse and validate individual question marks with enhanced accuracy
    if (marks && marks.includes('/')) {
      const [awardedStr, possibleStr] = marks.split('/')
      const awarded = parseFloat(awardedStr)
      const possible = parseFloat(possibleStr)
      
      // Enhanced validation for mark calculation accuracy
      if (!isNaN(awarded) && !isNaN(possible) && awarded >= 0 && possible >= 0) {
        // Round to prevent floating point precision issues
        const roundedAwarded = Math.round(awarded * 100) / 100
        const roundedPossible = Math.round(possible * 100) / 100
        
        calculatedAwardedMarks += roundedAwarded
        calculatedTotalMarks += roundedPossible
        
        // Validate awarded doesn't exceed possible for this question
        if (awarded > possible) {
          console.warn(`Question marks error: awarded (${awarded}) > possible (${possible}). Capping to possible.`)
          calculatedAwardedMarks = calculatedAwardedMarks - roundedAwarded + roundedPossible
        }
      } else {
        console.warn(`Invalid mark values: awarded=${awarded}, possible=${possible}`)
      }
    }

    questions.push(question)
  }

  // Round final totals to prevent floating point precision issues
  calculatedAwardedMarks = Math.round(calculatedAwardedMarks * 100) / 100
  calculatedTotalMarks = Math.round(calculatedTotalMarks * 100) / 100

  // Trust AI more - use calculated marks preferentially, but be more flexible
  if (calculatedAwardedMarks > 0 && Math.abs(calculatedAwardedMarks - (awardedMarks || 0)) > 0.5) {
    console.log(`Mark discrepancy detected. Summary: ${awardedMarks}, Calculated: ${calculatedAwardedMarks}. Using calculated marks for accuracy.`)
    awardedMarks = calculatedAwardedMarks
  }

  // Trust calculated total if it's reasonable, otherwise use provided total
  if (calculatedTotalMarks > 0 && (!totalPossible || Math.abs(calculatedTotalMarks - totalPossible) < totalPossible * 0.2)) {
    totalPossible = calculatedTotalMarks
  }

  // Calculate percentage and grade with proper null checks
  let percentage: number | null = null
  let grade: { grade: string; color: string } | null = null
  
  if (awardedMarks !== null && totalPossible !== null && totalPossible !== undefined && totalPossible > 0) {
    percentage = Math.round((awardedMarks / totalPossible) * 100 * 10) / 10 // Round to 1 decimal place
    grade = calculateGradeByExamType(percentage, studentInfo?.examType || 'O-Level')
  }

  return {
    summary: {
      totalAwarded: awardedMarks,
      totalPossible: totalPossible,
      percentage: percentage,
      grade: grade,
      feedback: feedback,
      studentInfo: studentInfo
    },
    questions: questions,
    rawResponse: responseText
  }
}

function calculateGradeByExamType(percentage: number, examType: string) {
  switch (examType?.toUpperCase()) {
    case 'IELTS':
      // IELTS uses 9-band system
      if (percentage >= 95) return { grade: '9.0', color: 'green' }
      if (percentage >= 90) return { grade: '8.5', color: 'green' }
      if (percentage >= 85) return { grade: '8.0', color: 'green' }
      if (percentage >= 80) return { grade: '7.5', color: 'blue' }
      if (percentage >= 75) return { grade: '7.0', color: 'blue' }
      if (percentage >= 70) return { grade: '6.5', color: 'blue' }
      if (percentage >= 65) return { grade: '6.0', color: 'orange' }
      if (percentage >= 60) return { grade: '5.5', color: 'orange' }
      if (percentage >= 55) return { grade: '5.0', color: 'orange' }
      if (percentage >= 50) return { grade: '4.5', color: 'red' }
      if (percentage >= 45) return { grade: '4.0', color: 'red' }
      if (percentage >= 40) return { grade: '3.5', color: 'red' }
      if (percentage >= 35) return { grade: '3.0', color: 'red' }
      if (percentage >= 30) return { grade: '2.5', color: 'red' }
      if (percentage >= 25) return { grade: '2.0', color: 'red' }
      if (percentage >= 20) return { grade: '1.5', color: 'red' }
      if (percentage >= 15) return { grade: '1.0', color: 'red' }
      if (percentage >= 10) return { grade: '0.5', color: 'red' }
      return { grade: '0.0', color: 'red' }

    case 'O-LEVEL':
    case 'A-LEVEL':
      // Cambridge O-Level and A-Level grading
      if (percentage >= 90) return { grade: 'A*', color: 'green' }
      if (percentage >= 80) return { grade: 'A', color: 'green' }
      if (percentage >= 70) return { grade: 'B', color: 'blue' }
      if (percentage >= 60) return { grade: 'C', color: 'yellow' }
      if (percentage >= 50) return { grade: 'D', color: 'orange' }
      if (percentage >= 40) return { grade: 'E', color: 'orange' }
      if (examType?.toUpperCase() === 'O-LEVEL') {
        if (percentage >= 30) return { grade: 'F', color: 'red' }
        if (percentage >= 20) return { grade: 'G', color: 'red' }
      }
      return { grade: 'U', color: 'red' }

    default:
      // Standard grading
      if (percentage >= 90) return { grade: 'A+', color: 'green' }
      if (percentage >= 85) return { grade: 'A', color: 'green' }
      if (percentage >= 80) return { grade: 'A-', color: 'green' }
      if (percentage >= 75) return { grade: 'B+', color: 'blue' }
      if (percentage >= 70) return { grade: 'B', color: 'blue' }
      if (percentage >= 65) return { grade: 'B-', color: 'blue' }
      if (percentage >= 60) return { grade: 'C+', color: 'orange' }
      if (percentage >= 55) return { grade: 'C', color: 'orange' }
      if (percentage >= 50) return { grade: 'C-', color: 'orange' }
      if (percentage >= 45) return { grade: 'D+', color: 'red' }
      if (percentage >= 40) return { grade: 'D', color: 'red' }
      if (percentage >= 35) return { grade: 'D-', color: 'red' }
      return { grade: 'F', color: 'red' }
  }
}

function calculateOLevelGrade(percentage: number) {
  if (percentage >= 90) return { grade: 'A*', color: 'green' }
  if (percentage >= 80) return { grade: 'A', color: 'green' }
  if (percentage >= 70) return { grade: 'B', color: 'blue' }
  if (percentage >= 60) return { grade: 'C', color: 'yellow' }
  if (percentage >= 50) return { grade: 'D', color: 'orange' }
  if (percentage >= 40) return { grade: 'E', color: 'red' }
  return { grade: 'U', color: 'red' }
}