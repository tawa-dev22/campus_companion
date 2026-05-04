import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Film, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const FileUpload = ({ 
  accept = '*', 
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  label = "Upload File",
  description = "Drag and drop or click to browse",
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Size validation
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    // Type validation could be added here if needed beyond HTML 'accept' attribute

    setFile(selectedFile);
    setError('');
    if (onFileSelect) onFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (onFileSelect) onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn("w-full", className)}>
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer group",
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
          file && "border-success/50 bg-success/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {file ? (
            <>
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="font-bold text-slate-900 truncate max-w-xs">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button
                onClick={clearFile}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <X className="w-4 h-4" /> Remove File
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-slate-900">{description}</p>
              <p className="text-xs text-slate-500 mt-2">
                Supported: {accept === '*' ? 'All files' : accept.replace(/\./g, '').toUpperCase()} (Max {maxSize / (1024 * 1024)}MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
