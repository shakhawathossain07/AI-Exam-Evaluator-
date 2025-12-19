export interface UploadedFile {
  file: File;
  preview: string | null;
  id: string;
}

export interface Question {
  pageNumber?: number; // Page in the original PDF where this answer appears
  heading: string;
  questionText: string;
  transcription: string;
  evaluation: string;
  justification: string;
  marks: string;
}

export interface Grade {
  grade: string;
  color: string;
}

export interface EvaluationSummary {
  totalAwarded: number | null;
  totalPossible: number | null;
  percentage: number | null;
  grade: Grade | null;
  feedback: string;
  studentInfo?: StudentInfo;
}

export interface EvaluationData {
  summary: EvaluationSummary;
  questions: Question[];
  rawResponse: string;
}

export interface EvaluationResult {
  success: boolean;
  evaluation: EvaluationData;
  metadata: EvaluationMetadata;
  error?: EvaluationError;
}

export interface FileData {
  name: string;
  type: string;
  data: string;
}

export interface StudentInfo {
  studentName?: string;
  studentId?: string;
  subject?: string;
  examType?: string;
  gradingCriteria?: string;
}

// Enhanced evaluation interfaces
export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  isBlankPaper: boolean;
}

export interface EvaluationError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface EvaluationMetadata {
  studentPaperPages: number;
  markSchemePages: number;
  totalPossibleMarks: number | null;
  evaluatedAt: string;
  studentInfo?: StudentInfo;
  processingTime?: number;
  aiModel?: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  metadata?: Record<string, unknown>;
}

// File and upload interfaces
export interface ProcessedFile {
  mimeType: string;
  base64Data: string;
  filename: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface EvaluationLimitStatus {
  canEvaluate: boolean;
  remaining: number;
  total: number;
}

export interface EvaluationAccessStatus {
  canEvaluate: boolean;
  evaluationsRemaining: number;
  isAdmin: boolean;
  message: string;
}

export interface GlobalSettings {
  geminiApiKey: string;
  geminiModel: string;
}

export interface GeminiContentPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface GeminiResponse {
  success: boolean;
  evaluation: EvaluationData;
  rawResponse: string;
  metadata: Record<string, unknown>;
}

export interface PDFLibrary {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  version: string;
  getDocument: (options: { data: Uint8Array }) => {
    promise: Promise<{ numPages: number }>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PDFLibrary;
  }
}