import { StructuredQuestion } from './structured_types';

export interface PaperBlueprintCategory {
  name: string;
  minMarks: number; // minimum marks to allocate from this category
}
export interface PaperBlueprint {
  paper: string; // paper number as string
  totalMarks: number;
  categories: PaperBlueprintCategory[];
}

// Approximate distribution blueprint (can be tuned)
export const PAPER_BLUEPRINTS: Record<string, PaperBlueprint> = {
  '2': { paper: '2', totalMarks: 80, categories: [
    { name: 'Biology', minMarks: 26 },
    { name: 'Chemistry', minMarks: 26 },
    { name: 'Physics', minMarks: 26 }
  ]},
  '3': { paper: '3', totalMarks: 80, categories: [
    { name: 'Biology', minMarks: 26 },
    { name: 'Chemistry', minMarks: 26 },
    { name: 'Physics', minMarks: 26 }
  ]},
  '4': { paper: '4', totalMarks: 120, categories: [
    { name: 'Planning', minMarks: 40 },
    { name: 'Practical Skills', minMarks: 40 },
    { name: 'Analysis & Evaluation', minMarks: 30 }
  ]},
  '5': { paper: '5', totalMarks: 60, categories: [
    { name: 'Practical Skills', minMarks: 60 }
  ]},
  '6': { paper: '6', totalMarks: 60, categories: [
    { name: 'Practical Skills', minMarks: 60 }
  ]}
};

export function computeQuestionMarks(q: StructuredQuestion): number {
  return q.parts.reduce((sum,p)=> sum + (p.marks||0), 0);
}
