import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, ArrowRight, Film } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/ui/icons';
import { GalleryItem } from '@/types/database';
import { Button } from '@/components/ui/button';
import { getMediaThumb, isYouTubeItem, isInstagramItem, isVideoItem } from '@/lib/utils/gallery';


export interface GalleryPreviewSectionProps {
  galleryItems: GalleryItem[];
  heading?: string;
  description?: string;
  ctaLabel?: string;
}

export const GalleryPreviewSection: React.FC<GalleryPreviewSectionProps> = ({
  galleryItems,
  heading = 'Real Site Progress & Project Showcase',
  description = 'Browse actual photos of our premium gated communities, high-quality asphalt roads, independent villas, and layout infrastructure developments.',
  ctaLabel = 'View Gallery',
}) => {
  const displayItems = galleryItems.slice(0, 6);

  // Fallback old database content values to premium counterparts
  const displayHeading = heading === 'See Our Projects' ? 'Real Site Progress & Project Showcase' : heading;
  const displayDescription =
    description === 'View real site photos, villa designs, roads, layouts and construction updates from our projects.'
      ? 'Browse actual photos of our premium gated communities, high-quality asphalt roads, independent villas, and layout infrastructure developments.'
      : description;

  return (
    <section className="py-10 bg-slate-900/60 border-b border-slate-800 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Light */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-md">
              <Camera className="w-3.5 h-3.5" /> Project Photography & Media
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {displayHeading}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* 6 Grid Gallery Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const imgSrc = getMediaThumb(item);
            const isYouTube = isYouTubeItem(item);
            const isInstagram = isInstagramItem(item);
            const isVideo = isVideoItem(item);

            return (
              <Link
                key={item.id}
                href="/gallery"
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl cursor-pointer block"
              >
                <Image
                  src={imgSrc}
                  alt={item.alt_text || item.title || 'Project layout site view'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="image-overlay-content absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase font-mono">{item.category || 'Site Update'}</span>
                    {(isYouTube || isInstagram || isVideo) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 border border-slate-700 text-white flex items-center gap-1">
                        {isYouTube ? <YoutubeIcon className="w-3 h-3 text-red-500" /> : isInstagram ? <InstagramIcon className="w-3 h-3 text-pink-400" /> : <Film className="w-3 h-3 text-amber-400" />}
                        {isYouTube ? 'YouTube' : isInstagram ? 'Instagram' : 'Video'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-bold text-white mt-0.5">{item.title || 'Township Development'}</h3>
                  {item.caption && <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.caption}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View Gallery Link */}
        <div className="mt-12 text-center">
          <Link href="/gallery">
            <Button variant="gold" size="md" className="font-bold px-8 shadow-lg hover:-translate-y-0.5 transition-transform">
              {ctaLabel} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
