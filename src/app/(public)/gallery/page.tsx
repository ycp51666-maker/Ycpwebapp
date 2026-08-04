import React from 'react';
import { Metadata } from 'next';
import { Camera } from 'lucide-react';
import { getPublishedGalleryItems, getPublishedProjects, getPublishedLocations } from '@/lib/data';
import { GalleryClientView } from '@/components/public/GalleryClientView';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('gallery');
}

export default async function GalleryPage() {
  const [galleryItems, projects, locations] = await Promise.all([
    getPublishedGalleryItems(),
    getPublishedProjects(),
    getPublishedLocations(),
  ]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Page Header Banner */}
      <div className="max-w-7xl mx-auto border-b border-slate-800/80 pb-3.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 shadow-sm">
          <Camera className="w-3 h-3" /> Project Media Showcase
        </div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          Project Showcase &amp; Layout Gallery
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
          Explore real site photos, video walkthroughs, and Instagram reels across DTCP &amp; RERA approved layout projects in Namakkal &amp; Paramathy Velur.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <GalleryClientView
          galleryItems={galleryItems}
          projects={projects}
          locations={locations}
        />
      </div>
    </div>
  );
}