// Utility to convert PDF files to images for AI analysis
// This helps the AI better understand page structure and provide accurate page numbers

export async function convertPDFToImages(file: File): Promise<{ data: string; pageNumber: number }[]> {
  try {
    // For now, return the PDF as base64 - we'll improve this later
    const base64 = await convertFileToBase64(file);
    
    // Return as single "page" until we implement proper PDF parsing
    return [{
      data: base64,
      pageNumber: 1
    }];
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    return [];
  }
}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function processFileForAI(file: File): Promise<{ data: string; pageNumber: number; mimeType: string }[]> {
  console.log('Processing file for AI:', file.name, file.type);
  
  if (file.type === 'application/pdf') {
    // Convert PDF to images
    const images = await convertPDFToImages(file);
    return images.map(img => ({
      data: img.data,
      pageNumber: img.pageNumber,
      mimeType: 'application/pdf' // For now, keep as PDF
    }));
  } else if (file.type.startsWith('image/')) {
    // Process image file
    const base64 = await convertFileToBase64(file);
    return [{
      data: base64,
      pageNumber: 1,
      mimeType: file.type
    }];
  } else {
    console.warn('Unsupported file type for AI processing:', file.type);
    return [];
  }
}
