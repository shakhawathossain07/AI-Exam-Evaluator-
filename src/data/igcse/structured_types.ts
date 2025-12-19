export interface StructuredQuestionPart {
  text: string;
  marks?: number; // marks awarded for this line/part
  kind?: 'line' | 'diagram' | 'table' | 'graph';
  refId?: string; // diagram/table/graph identifier
}

export interface StructuredQuestion {
  number: string; // question number string
  parts: StructuredQuestionPart[];
  category?: 'Biology' | 'Chemistry' | 'Physics' | 'Practical Skills' | 'Planning' | 'Mixed' | 'Analysis & Evaluation';
}
