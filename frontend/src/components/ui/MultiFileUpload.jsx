import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const MultiFileUpload = ({ 
  accept = 'image/*', 
  maxSize = 10 * 1024 * 1024, // 10MB per file
  maxFiles = 5,
  onFilesChange,
  label = "Upload Files",
  description = "Drag and drop or click to select multiple files",
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    
    // Check max files
    if (files.length + newFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    // Filter valid files
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length) {
       // Create preview URLs
       const filesWithPreviews = validFiles.map(file => Object.assign(file, {
         preview: URL.createObjectURL(file)
       }));
       const updatedFiles = [...files, ...filesWithPreviews];
       setFiles(updatedFiles);
       setError('');
       if (onFilesChange) onFilesChange(updatedFiles);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove, e) => {
    e.stopPropagation();
    const updatedFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(updatedFiles);
    if (onFilesChange) onFilesChange(updatedFiles);
    if (inputRef.current) inputRef.current.value = ''; // Reset input to allow re-upload if needed
  };

  return (
    <div className={cn("w-full", className)}>
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer group",
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
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
          multiple
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Upload className="w-8 h-8 text-primary" />
           </div>
           <p className="font-bold text-slate-900">{description}</p>
           <p className="text-xs text-slate-500 mt-2">
             Supported: {accept === '*' ? 'All files' : accept.replace(/\./g, '').toUpperCase()} (Max {maxFiles} files, {maxSize / (1024 * 1024)}MB each)
           </p>
        </div>
      </div>
      
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}

      {/* Previews */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-200 shadow-sm">
               {file.preview ? (
                 <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                   <ImageIcon className="w-8 h-8" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <button 
                  type="button"
                  onClick={(e) => removeFile(idx, e)} 
                  className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 shadow-lg transform hover:scale-110 transition-all"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
