import { useState, useCallback, useEffect } from 'react';
import type { EvaluationResult, UploadedFile } from '../types';

interface DraftData {
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
  timestamp: string;
}

const DRAFT_KEY = 'evaluation_draft';

export function useDraftManager() {
  const [hasDraft, setHasDraft] = useState(false);

  // Check for existing drafts on mount
  useEffect(() => {
    checkForDrafts();
  }, []);

  const checkForDrafts = useCallback(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    setHasDraft(!!draft);
  }, []);

  const saveDraft = useCallback((
    results: EvaluationResult,
    evaluationId: string,
    studentInfo: DraftData['studentInfo'],
    studentPaperFiles: UploadedFile[]
  ) => {
    if (!results || !evaluationId) return;
    
    try {
      const draftData: DraftData = {
        results,
        evaluationId,
        studentInfo,
        studentPaperFiles: studentPaperFiles.map(file => ({
          id: file.id,
          name: file.file.name,
          type: file.file.type,
          size: file.file.size
        })),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setHasDraft(true);
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    const draft = localStorage.getItem(DRAFT_KEY);
    
    if (!draft) return null;
    
    try {
      const draftData = JSON.parse(draft);
      setHasDraft(false);
      return draftData;
    } catch (error) {
      console.error('Failed to load draft:', error);
      clearDraft();
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }, []);

  return {
    hasDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    checkForDrafts
  };
}