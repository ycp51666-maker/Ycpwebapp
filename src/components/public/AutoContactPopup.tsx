'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { SiteVisitForm } from '@/components/forms/SiteVisitForm';
import { trackConversionEvent } from '@/lib/utils/analytics';

export const AutoContactPopup: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controls CSS animation
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for exit animation to finish then unmount
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem('auto_contact_popup_dismissed', 'true');
    }, 350);
  }, []);

  // Hydration-safe mount
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Auto-trigger after 10 seconds (once per session)
  useEffect(() => {
    if (!mounted) return;
    const alreadyShown = sessionStorage.getItem('auto_contact_popup_dismissed');
    if (alreadyShown) return;

    timerRef.current = setTimeout(() => {
      setIsOpen(true);
      trackConversionEvent('call_clicked', { source: 'auto_contact_popup_arisen' });
      // Small delay so portal mounts before CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop — clean dimming overlay without heavy blur */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-500 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel — ultra-smooth slide & scale entrance */}
      <div
        className="dialog-modal relative w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-500 ease-out"
        style={{
          transform: isVisible
            ? 'translateY(0) scale(1)'
            : 'translateY(36px) scale(0.92)',
          opacity: isVisible ? 1 : 0,
          transitionProperty: 'transform, opacity',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Amber accent line on top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-0">
          <div className="space-y-1 flex-1 pr-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Contact Us
            </div>
            <h3 className="font-serif text-xl font-extrabold text-slate-100 dark:text-white leading-tight">
              Contact Us
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with our sales team · Quick response guaranteed
            </p>
          </div>
          <button
            onClick={handleClose}
            className="mt-0.5 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 my-4 h-px bg-slate-800/80 dialog-divider" />

        {/* Form */}
        <div className="px-6 pb-6 max-h-[75vh] overflow-y-auto">
          <SiteVisitForm
            onSuccess={() => {
              // Keep success state visible for a moment then close
              setTimeout(handleClose, 2200);
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
