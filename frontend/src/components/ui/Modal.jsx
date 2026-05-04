import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Modal = ({ isOpen, onClose, title, children, className, maxWidth = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-white rounded-[32px] shadow-2xl overflow-hidden w-full transform transition-all",
          maxWidths[maxWidth] || 'max-w-md',
          className
        )}
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
