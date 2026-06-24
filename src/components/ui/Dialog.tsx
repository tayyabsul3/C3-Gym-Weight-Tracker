import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 className="font-display text-lg font-bold text-textPrimary uppercase tracking-wide">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary text-xl font-bold cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-surface2 rounded-full active:scale-95 transition-all duration-200"
          >
            ✕
          </button>
        </div>
        <div className="text-sm font-body text-textSecondary">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
