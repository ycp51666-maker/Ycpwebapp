'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { Compass, GraduationCap, Hospital, Car, Bus, ShoppingBag, MapPin, Maximize2 } from 'lucide-react';
import { Landmark } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export interface ProjectLandmarksPopupProps {
  landmarks: Landmark[];
  projectName: string;
}

export const ProjectLandmarksPopup: React.FC<ProjectLandmarksPopupProps> = ({
  landmarks,
  projectName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!landmarks || landmarks.length === 0) return null;

  const getLandmarkIcon = (name?: string, category?: string | null) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'education') return <GraduationCap className="w-4 h-4 text-amber-400" />;
    if (cat === 'medical') return <Hospital className="w-4 h-4 text-emerald-400" />;
    if (cat === 'transit') return <Bus className="w-4 h-4 text-blue-400" />;
    if (cat === 'shopping') return <ShoppingBag className="w-4 h-4 text-purple-400" />;
    if (cat === 'transport') return <Car className="w-4 h-4 text-amber-500" />;

    const text = (name || '').toLowerCase();
    if (text.includes('school') || text.includes('college') || text.includes('university') || text.includes('education')) {
      return <GraduationCap className="w-4 h-4 text-amber-400" />;
    }
    if (text.includes('hospital') || text.includes('health') || text.includes('medical') || text.includes('clinic')) {
      return <Hospital className="w-4 h-4 text-emerald-400" />;
    }
    if (text.includes('bus') || text.includes('rail') || text.includes('station') || text.includes('transit')) {
      return <Bus className="w-4 h-4 text-blue-400" />;
    }
    if (text.includes('market') || text.includes('shop') || text.includes('mall')) {
      return <ShoppingBag className="w-4 h-4 text-purple-400" />;
    }
    return <MapPin className="w-4 h-4 text-amber-500" />;
  };

  return (
    <section id="landmarks" className="scroll-mt-36 space-y-6 border-b border-slate-800 pb-16 text-center">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider mx-auto">
          <Compass className="w-3.5 h-3.5" /> Prime Location Access
        </div>

        <h2 className="font-serif text-3xl font-bold text-white text-center">Nearby Schools & Highway Connections</h2>

        {/* Centered Closed Preview Card */}
        <div
          onClick={() => setIsOpen(true)}
          className="group p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl hover:border-emerald-500/50 cursor-pointer transition-all duration-300 space-y-5"
        >
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            Convenient access to major state highways, top-rated schools, colleges, multi-specialty hospitals, and bus terminals surrounding {projectName}.
          </p>

          {/* Quick Distance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {landmarks.slice(0, 3).map((lm) => (
              <span
                key={lm.id}
                className="px-3 py-1 bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-semibold rounded-full flex items-center gap-2"
              >
                {getLandmarkIcon(lm.name, lm.category)}
                <span>{lm.name}</span>
                <span className="text-[10px] text-amber-400 font-extrabold font-mono uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {lm.distance_label}
                </span>
              </span>
            ))}
            {landmarks.length > 3 && (
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                +{landmarks.length - 3} More
              </span>
            )}
          </div>

          <div className="pt-2">
            <Button variant="outline" size="md" className="font-bold border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:scale-105 transition-all">
              <Maximize2 className="w-4 h-4 mr-2" /> View All Nearby Highway & School Connections
            </Button>
          </div>
        </div>
      </div>

      {/* Full Landmarks Modal Dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${projectName} — Nearby Connections & Distance Chart`}
        description="Complete breakdown of surrounding schools, transit corridors, and public amenities."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
          {landmarks.map((lm) => (
            <div
              key={lm.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3.5 text-left shadow-lg hover:border-slate-700 transition-colors"
            >
              {lm.image_url ? (
                <img
                  src={lm.image_url}
                  alt={lm.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {getLandmarkIcon(lm.name, lm.category)}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-white text-sm leading-snug">{lm.name}</h4>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold rounded uppercase font-mono">
                    {lm.distance_label}
                  </span>
                  {lm.travel_time_label && (
                    <span className="text-[11px] text-slate-400 font-medium">({lm.travel_time_label})</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </section>
  );
};
