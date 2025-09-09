import { evaluateExamPaper, saveEvaluation } from './api';
import type { EvaluationResult, UploadedFile } from '../types';

export interface EvaluationFormData {
  studentPaperFiles: UploadedFile[];
  markSchemeFiles: UploadedFile[];
  totalPossibleMarks: string;
  studentName: string;
  studentId: string;
  subject: string;
  examType: 'IELTS' | 'O-Level' | 'A-Level';
  gradingCriteria: string;
}

export class EvaluationService {
  private static readonly DRAFT_KEY = 'evaluation_draft';

  static async processEvaluation(formData: EvaluationFormData): Promise<EvaluationResult> {
    const apiFormData = this.buildFormData(formData);
    return await evaluateExamPaper(apiFormData);
  }

  static async saveEvaluationResult(evaluationId: string, results: EvaluationResult): Promise<void> {
    await saveEvaluation(evaluationId, results.evaluation);
  }

  static saveDraft(draftData: {
    results: EvaluationResult;
    evaluationId: string;
    studentInfo: {
      name: string;
      id: string;
      subject: string;
      examType: string;
    };
    studentPaperFiles: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
    }>;
  }): void {
    try {
      const dataToSave = {
        ...draftData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  }

  static loadDraft(): any | null {
    try {
      const draft = localStorage.getItem(this.DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      this.clearDraft();
      return null;
    }
  }

  static clearDraft(): void {
    localStorage.removeItem(this.DRAFT_KEY);
  }

  static hasDraft(): boolean {
    return !!localStorage.getItem(this.DRAFT_KEY);
  }

  static validateFormData(formData: EvaluationFormData): string | null {
    if (formData.studentPaperFiles.length === 0) {
      return "Please upload the student's exam paper before evaluating.";
    }
    return null;
  }

  static base64ToFile(base64Data: string, fileName: string, mimeType: string): File {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], fileName, { type: mimeType });
  }

  private static buildFormData(formData: EvaluationFormData): FormData {
    const apiFormData = new FormData();

    // Add student paper files
    formData.studentPaperFiles.forEach(file => {
      apiFormData.append('studentPaper', file.file);
    });

    // Add mark scheme files
    formData.markSchemeFiles.forEach(file => {
      apiFormData.append('markScheme', file.file);
    });

    // Add optional fields
    if (formData.totalPossibleMarks.trim()) {
      apiFormData.append('totalPossibleMarks', formData.totalPossibleMarks.trim());
    }
    if (formData.studentName.trim()) {
      apiFormData.append('studentName', formData.studentName.trim());
    }
    if (formData.studentId.trim()) {
      apiFormData.append('studentId', formData.studentId.trim());
    }
    if (formData.subject.trim()) {
      apiFormData.append('subject', formData.subject.trim());
    }

    apiFormData.append('examType', formData.examType);
    apiFormData.append('gradingCriteria', formData.gradingCriteria);

    return apiFormData;
  }
}