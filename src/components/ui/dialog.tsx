'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  bodyClassName,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="dialog-backdrop absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={cn(
          'dialog-modal relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-300',
          className
        )}
        style={{
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          transitionProperty: 'transform, opacity',
          transitionDuration: '380ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800/80">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-serif font-bold text-white leading-snug">{title}</h3>
              {description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn("p-6 max-h-[80vh] overflow-y-auto", bodyClassName)}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
