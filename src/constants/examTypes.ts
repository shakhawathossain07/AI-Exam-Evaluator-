export interface ExamTypeConfig {
  gradingScale: string;
  description: string;
  subjects: string[];
  gradingCriteria: string;
  maxScore: number;
  passScore: number;
}

export type ExamType = 'IELTS' | 'O-Level' | 'A-Level';

export const EXAM_TYPE_CONFIGS: Record<ExamType, ExamTypeConfig> = {
  'IELTS': {
    gradingScale: 'Band 0-9',
    description: 'International English Language Testing System',
    subjects: ['Listening', 'Reading', 'Writing', 'Speaking'],
    gradingCriteria: 'IELTS band scoring (0-9 scale with half bands)',
    maxScore: 9,
    passScore: 6.0
  },
  'O-Level': {
    gradingScale: 'A*-G',
    description: 'Cambridge Ordinary Level',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Geography', 'History'],
    gradingCriteria: 'Cambridge O-Level grading (A*, A, B, C, D, E, F, G)',
    maxScore: 100,
    passScore: 40
  },
  'A-Level': {
    gradingScale: 'A*-E',
    description: 'Cambridge Advanced Level',
    subjects: ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'Economics'],
    gradingCriteria: 'Cambridge A-Level grading (A*, A, B, C, D, E)',
    maxScore: 100,
    passScore: 40
  }
} as const;

export const getExamTypeConfig = (examType: ExamType): ExamTypeConfig => {
  return EXAM_TYPE_CONFIGS[examType];
};

export const getAvailableExamTypes = (): ExamType[] => {
  return Object.keys(EXAM_TYPE_CONFIGS) as ExamType[];
};