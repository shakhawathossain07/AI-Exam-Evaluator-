import type { UploadedFile } from '../types';

/**
 * Converts base64 data to File object with error handling
 */
export function base64ToFile(
  base64Data: string, 
  fileName: string, 
  mimeType: string
): File {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], fileName, { type: mimeType });
  } catch (error) {
    console.error('Failed to convert base64 to file:', error);
    throw new Error(`Failed to process file: ${fileName}`);
  }
}

/**
 * Processes original student paper data for display
 */
export function processStudentPaperFiles(
  originalStudentPaperData: Record<string, unknown>[],
  fallbackFiles: UploadedFile[]
): UploadedFile[] {
  if (originalStudentPaperData.length === 0) {
    return fallbackFiles;
  }

  return originalStudentPaperData.map((fileData, index) => {
    try {
      const actualFile = base64ToFile(
        fileData.data as string,
        fileData.name as string,
        fileData.type as string
      );
      
      return {
        id: `original-${index}`,
        file: actualFile,
        preview: `data:${fileData.type};base64,${fileData.data}`
      };
    } catch (error) {
      console.error(`Failed to process file ${index}:`, error);
      // Return a placeholder file to prevent crashes
      return {
        id: `error-${index}`,
        file: new File([], 'error.txt', { type: 'text/plain' }),
        preview: ''
      };
    }
  });
}

/**
 * Validates file upload constraints
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  return { isValid: true };
}