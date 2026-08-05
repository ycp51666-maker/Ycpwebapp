'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Calendar, ChevronLeft, GripVertical } from 'lucide-react';
import { trackConversionEvent } from '@/lib/utils/analytics';
import { Dialog } from '@/components/ui/dialog';
import { SiteVisitForm } from '@/components/forms/SiteVisitForm';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

export const StickyActionBar: React.FC = () => {
  const siteSettings = useSiteSettings();
  const whatsappUrl = siteSettings.getWhatsAppUrl('Hi Your Choice Properties team, I am interested in property details.');
  const callUrl = siteSettings.getCallUrl();
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState(false);
  const [posY, setPosY] = useState<number | null>(null);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const initialPosY = useRef(0);

  // Set position asynchronously post-mount to comply with React compiler rules and match SSR HTML
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const animId = requestAnimationFrame(() => {
        setPosY(Math.max(100, Math.floor(window.innerHeight * 0.35)));
      });
      return () => cancelAnimationFrame(animId);
    }
  }, []);

  // Handle Dragging
  const handleDragStart = (clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    initialPosY.current = posY ?? 200;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging.current) return;
    const deltaY = clientY - startY.current;
    const newY = initialPosY.current + deltaY;
    // Constrain Y position within safe vertical viewport bounds (80px top to innerHeight - 220px)
    const maxY = (typeof window !== 'undefined' ? window.innerHeight : 800) - 220;
    setPosY(Math.min(Math.max(80, newY), maxY));
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleDragMove(e.touches[0].clientY);
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [posY]);

  return (
    <>
      {/* ── Desktop Right-Side Vertical Draggable Sticky Floating Action Dock ────── */}
      <aside
        aria-label="Re-positionable Quick Action Toolbar"
        style={{ top: posY !== null ? `${posY}px` : '35%' }}
        className="hidden md:flex fixed right-0 z-50 flex-col items-end pr-0 select-none transition-shadow duration-300"
      >
        <div className="bg-slate-900/90 border border-r-0 border-slate-700/80 rounded-l-2xl p-1.5 shadow-2xl backdrop-blur-xl flex flex-col items-end gap-2 group">
          {/* Drag Handle Bar (Icon Symbol Only) */}
          <div
            onMouseDown={(e) => handleDragStart(e.clientY)}
            onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientY)}
            className="w-full flex items-center justify-center py-1.5 bg-slate-950/70 hover:bg-slate-950 rounded-xl border border-slate-800 cursor-grab active:cursor-grabbing text-slate-400 hover:text-amber-400 transition-colors"
            title="Drag vertically to position anywhere on right side"
          >
            <GripVertical className="w-4 h-4 text-amber-400 opacity-80 hover:opacity-100" />
          </div>

          {/* 1. WhatsApp Button (Right Dock - Original WhatsApp SVG Icon & Color) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackConversionEvent('whatsapp_clicked', { source: 'desktop_sticky_dock' })}
            className="w-full flex items-center justify-end bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-3 rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:pl-4 cursor-pointer"
            title="Chat on WhatsApp"
          >
            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 mr-1 transition-opacity hidden group-hover:inline-block text-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:mr-2 transition-all duration-300 text-xs font-bold tracking-wide text-white">
              WhatsApp Us
            </span>
            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.127-1.333c1.464.795 3.11 1.217 4.881 1.217h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062A9.921 9.921 0 0 0 12.012 2zm5.834 14.164c-.244.686-1.42 1.309-1.959 1.391-.497.075-1.144.108-1.85-.118-.429-.137-.98-.318-1.688-.624-2.973-1.288-4.912-4.305-5.06-4.503-.148-.198-1.21-1.61-1.21-3.072 0-1.461.766-2.181 1.038-2.479.272-.298.594-.372.793-.372.199 0 .397.002.57.01.185.009.431-.07.674.513.248.595.842 2.054.917 2.203.074.149.123.323.025.521-.099.198-.148.322-.297.496-.149.174-.313.389-.447.522-.148.148-.303.31-.13.608.173.297.768 1.267 1.648 2.049 1.132 1.008 2.086 1.32 2.384 1.468.298.149.471.124.645-.074.174-.198.744-.868.942-1.166.198-.298.397-.248.669-.149.273.099 1.734.818 2.032.967.298.149.496.223.57.347.075.124.075.72-.169 1.406z"/>
            </svg>
          </a>

          {/* 2. Contact / Call Button (Right Dock) */}
          <a
            href={callUrl}
            onClick={() => trackConversionEvent('call_clicked', { source: 'desktop_sticky_dock' })}
            className="w-full flex items-center justify-end bg-slate-950 hover:bg-slate-900 text-white py-2.5 px-3 rounded-xl shadow-lg border border-slate-800 hover:border-amber-400/60 transition-all duration-300 hover:pl-4"
            title="Call Sales Advisor"
          >
            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 mr-1 transition-opacity hidden group-hover:inline-block text-amber-400" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:mr-2 transition-all duration-300 text-xs font-bold tracking-wide text-slate-100">
              Call Advisor
            </span>
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
          </a>

          {/* 3. Book Appointment / Site Visit (Right Dock) */}
          <button
            onClick={() => {
              trackConversionEvent('call_clicked', { source: 'desktop_sticky_dock' });
              setIsSiteVisitOpen(true);
            }}
            className="w-full flex items-center justify-end bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 px-3 rounded-xl shadow-lg shadow-amber-500/30 border border-amber-300 transition-all duration-300 hover:pl-4 cursor-pointer font-extrabold"
            title="Contact Us"
          >
            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 mr-1 transition-opacity hidden group-hover:inline-block" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:mr-2 transition-all duration-300 text-xs font-extrabold tracking-wide">
              Book Appointment
            </span>
            <Calendar className="w-4 h-4 text-slate-950 shrink-0 font-extrabold" />
          </button>
        </div>
      </aside>

      {/* ── Mobile Right-Bottom Corner Floating Action Buttons ────── */}
      <div className="md:hidden fixed bottom-6 right-4 z-50 flex flex-col gap-3 select-none">
        {/* 1. Mobile WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackConversionEvent('whatsapp_clicked', { source: 'mobile_sticky_float' })}
          className="w-12 h-12 flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-xl border border-white/20 transition-transform active:scale-95 cursor-pointer"
          title="Chat on WhatsApp"
        >
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.127-1.333c1.464.795 3.11 1.217 4.881 1.217h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062A9.921 9.921 0 0 0 12.012 2zm5.834 14.164c-.244.686-1.42 1.309-1.959 1.391-.497.075-1.144.108-1.85-.118-.429-.137-.98-.318-1.688-.624-2.973-1.288-4.912-4.305-5.06-4.503-.148-.198-1.21-1.61-1.21-3.072 0-1.461.766-2.181 1.038-2.479.272-.298.594-.372.793-.372.199 0 .397.002.57.01.185.009.431-.07.674.513.248.595.842 2.054.917 2.203.074.149.123.323.025.521-.099.198-.148.322-.297.496-.149.174-.313.389-.447.522-.148.148-.303.31-.13.608.173.297.768 1.267 1.648 2.049 1.132 1.008 2.086 1.32 2.384 1.468.298.149.471.124.645-.074.174-.198.744-.868.942-1.166.198-.298.397-.248.669-.149.273.099 1.734.818 2.032.967.298.149.496.223.57.347.075.124.075.72-.169 1.406z"/>
          </svg>
        </a>

        {/* 2. Mobile Contact Button */}
        <a
          href={callUrl}
          onClick={() => trackConversionEvent('call_clicked', { source: 'mobile_sticky_float' })}
          className="w-12 h-12 flex items-center justify-center bg-slate-900 border border-slate-800 text-amber-400 rounded-full shadow-xl hover:border-amber-400/60 transition-transform active:scale-95 cursor-pointer"
          title="Call Sales Advisor"
        >
          <Phone className="w-5 h-5 text-amber-400" />
        </a>
      </div>

      {/* Quick Site Visit Dialog */}
      <Dialog
        isOpen={isSiteVisitOpen}
        onClose={() => setIsSiteVisitOpen(false)}
        title="Request a Guided Site Visit"
        description="Schedule a layout tour or site walkthrough with our Sales Advisor."
      >
        <SiteVisitForm onSuccess={() => setIsSiteVisitOpen(false)} />
      </Dialog>
    </>
  );
};
