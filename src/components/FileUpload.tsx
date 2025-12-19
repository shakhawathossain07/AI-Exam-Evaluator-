import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, UploadCloud } from 'lucide-react';
import type { UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  description: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  accept: string;
  required?: boolean;
}

export function FileUpload({
  label,
  description,
  files,
  onFilesChange,
  required = false
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
        <p className="text-sm text-slate-500 mb-3">{description}</p>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive 
            ? 'border-cyan-500 bg-cyan-500/10' 
            : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isDragActive 
            ? 'bg-cyan-500/20 border border-cyan-500/30' 
            : 'bg-slate-800 border border-slate-700 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10'
        }`}>
          <UploadCloud className={`w-7 h-7 transition-colors ${isDragActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
        </div>
        {isDragActive ? (
          <p className="text-cyan-400 font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-slate-300 font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              Images (PNG, JPG, GIF) or PDF files up to 10MB
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-cyan-500/30 transition-colors">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 mt-2 truncate" title={file.file.name}>
                  {file.file.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}