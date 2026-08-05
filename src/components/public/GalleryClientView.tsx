'use client';

import React, { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { GalleryItem, Project, Location } from '@/types/database';
import { WhatsAppIcon } from '@/components/ui/icons';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { Badge } from '@/components/ui/badge';
import { GalleryLightbox } from '@/components/public/GalleryLightbox';

export interface GalleryClientViewProps {
  galleryItems: GalleryItem[];
  projects: Project[];
  locations: Location[];
}

// ─── Per-project section ───────────────────────────────────────────────────────
function ProjectGallerySection({
  project,
  items,
  locationName,
}: {
  project: Project & { location_phone?: string; location_whatsapp?: string };
  items: GalleryItem[];
  locationName: string;
}) {
  const siteSettings = useSiteSettings();
  const effectivePhone = project.phone || project.location_phone || undefined;
  const effectiveWhatsapp = project.whatsapp || project.location_whatsapp || undefined;
  const whatsappUrl = siteSettings.getWhatsAppUrl(`Hello, I am interested in ${project.name}, ${locationName}. Please share availability.`, effectiveWhatsapp);
  const callUrl = siteSettings.getCallUrl(effectivePhone);

  return (
    <section className="bg-slate-900/50 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xl relative overflow-hidden">
      {/* Ambient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 relative z-10">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold leading-none mb-0.5">
            <MapPin className="w-3 h-3" /> {locationName}
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {project.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="gold" className="text-[10px] px-2.5 py-0.5 font-bold">
            {project.project_status || 'Ongoing'}
          </Badge>
          <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold rounded-full">
            {items.length} Assets
          </span>
        </div>
      </div>

      {/* Single Continuous Grid Flow */}
      <div className="relative z-10">
        <GalleryLightbox items={items} activeKind="photo" />
      </div>

      {/* CTA Buttons */}
      <div className="pt-2.5 flex flex-wrap items-center justify-center gap-2.5 border-t border-slate-800/60 relative z-10">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp Enquiry — {project.name}</span>
        </a>
        <a
          href={callUrl}
          className="py-1.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call Us</span>
        </a>
      </div>
    </section>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export const GalleryClientView: React.FC<GalleryClientViewProps> = ({
  galleryItems,
  projects,
  locations,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const siteSettings = useSiteSettings();

  // Build lookup maps
  const locationNames: Record<string, string> = {};
  locations.forEach((loc) => { locationNames[loc.id] = loc.name; });

  // Group items by project
  const projectItemMap = new Map<string, GalleryItem[]>();
  const generalItems: GalleryItem[] = [];

  galleryItems.forEach((item) => {
    if (item.project_id) {
      if (!projectItemMap.has(item.project_id)) projectItemMap.set(item.project_id, []);
      projectItemMap.get(item.project_id)!.push(item);
    } else {
      generalItems.push(item);
    }
  });

  // Projects that have items
  const activeProjects = projects.filter((p) => projectItemMap.has(p.id));

  // Projects to render based on dropdown filter
  const displayedProjects = selectedProjectId === 'all'
    ? activeProjects
    : activeProjects.filter((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Dynamic Project Filter dropdown */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Filter Showcase</h3>
          <p className="text-sm font-bold text-white mt-0.5">Select Layout or Project</p>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs rounded-xl px-4 py-2.5 focus:ring-amber-500 cursor-pointer max-w-xs"
        >
          <option value="all">🌟 All Projects ({activeProjects.length})</option>
          {activeProjects.map((p) => (
            <option key={p.id} value={p.id}>
              📍 {p.name} ({projectItemMap.get(p.id)?.length || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Render Project Sections */}
      {displayedProjects.map((project) => (
        <ProjectGallerySection
          key={project.id}
          project={project}
          items={projectItemMap.get(project.id) || []}
          locationName={locationNames[project.location_id || ''] || 'Namakkal & Paramathi Velur'}
        />
      ))}

      {/* General Showcase Items */}
      {selectedProjectId === 'all' && generalItems.length > 0 && (
        <section className="bg-slate-900/50 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Company Highlights</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">General Media &amp; Completed Layouts</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold rounded-full">
              {generalItems.length} Assets
            </span>
          </div>

          <GalleryLightbox items={generalItems} activeKind="photo" />
          <div className="pt-2.5 flex flex-wrap items-center justify-center gap-2.5 border-t border-slate-800/60">
            <a
              href={siteSettings.getWhatsAppUrl('Hello, I would like to inquire about your property developments.')}
              target="_blank" rel="noopener noreferrer"
              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp Enquiry
            </a>
            <a
              href={siteSettings.getCallUrl()}
              className="py-2.5 px-5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" /> Call Us
            </a>
          </div>
        </section>
      )}
    </div>
  );
};
