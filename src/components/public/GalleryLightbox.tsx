'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { GalleryItem } from '@/types/database';
import {
  GalleryMediaKind, getMediaThumb, getMediaKind, getYoutubeEmbedUrl,
  isYouTubeItem, isInstagramItem, isVideoItem, getInstagramEmbedUrl,
} from '@/lib/utils/gallery';
import { getMediaUrl } from '@/lib/utils/media';
import { Dialog } from '@/components/ui/dialog';

export interface GalleryLightboxProps {
  items: GalleryItem[];
  activeKind?: GalleryMediaKind;
  /** legacy compat — ignored in new design */
  formatFilter?: string;
}

// ─── Photo Lightbox (Matching Image 2 Frame Design) ───────────────────────────
function PhotoLightbox({
  items,
  startIndex,
  onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];
  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : items.length - 1)), [items.length]);
  const next = useCallback(() => setIdx((i) => (i < items.length - 1 ? i + 1 : 0)), [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  if (!item) return null;

  const categoryLabel = item.category
    ? `${item.category.toUpperCase()} SHOWCASE`
    : 'PHOTO SHOWCASE';

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      className="max-w-5xl w-full bg-black border border-slate-900 p-0 overflow-hidden hero-dark-overlay rounded-3xl shadow-2xl"
      bodyClassName="p-0 max-h-none overflow-hidden"
    >
      <div className="relative w-full aspect-video sm:aspect-[16/10] bg-black text-white overflow-hidden flex items-center justify-center">
        {/* Full Image */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
          <img
            src={getMediaUrl(item.storage_path_or_url)}
            alt={item.alt_text || item.title || 'Gallery photo'}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Top Header Overlay (Matches Image 2 design) */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10 flex justify-between items-start gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] uppercase font-bold rounded-full mb-1 shadow-sm">
              {categoryLabel}
            </span>
            <h3 className="text-sm sm:text-base font-serif font-bold text-white leading-snug drop-shadow-md">
              {item.title || 'Photo Showcase'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-slate-950 rounded-full bg-black/60 hover:bg-amber-500 border border-white/10 transition-all cursor-pointer flex-shrink-0 shadow-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Bottom Control Overlay (Matches Image 2 design) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 space-y-2">
          {item.caption && (
            <p className="text-xs text-slate-300 text-center font-medium drop-shadow mb-1 line-clamp-1">
              {item.caption}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
            <button
              onClick={prev}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black/60 border border-white/10 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all cursor-pointer font-bold shadow-md"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="font-mono font-bold text-white drop-shadow text-xs sm:text-sm">
              {idx + 1} <span className="text-slate-400">/</span> {items.length}
            </span>
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black/60 border border-white/10 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all cursor-pointer font-bold shadow-md"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ─── Video/YouTube/Instagram Embed Modal (Matching Image 1 Testimonials Video Frame Design) ───
function EmbedModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const url = item.video_url || item.storage_path_or_url || '';

  const isYT = isYouTubeItem(item);
  const isIG = isInstagramItem(item);
  const isVid = isVideoItem(item);

  const ytEmbed = isYT ? getYoutubeEmbedUrl(url) : null;
  const igEmbed = isIG ? getInstagramEmbedUrl(url) : null;

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      className={
        isIG
          ? 'max-w-md w-full bg-black border border-slate-800 p-0 overflow-hidden rounded-3xl shadow-2xl hero-dark-overlay'
          : 'max-w-4xl w-full bg-black border border-slate-800 p-0 overflow-hidden rounded-3xl shadow-2xl hero-dark-overlay'
      }
      bodyClassName="p-0 max-h-none overflow-hidden"
    >
      <div className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden min-h-[40vh]">
        {/* Top-Right Circular Close Button (Matches Image 1 design) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-black/70 text-white rounded-full hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shadow-lg border border-white/10"
          aria-label="Close video"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        {isYT && ytEmbed ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center">
            <iframe
              src={ytEmbed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
              title={item.title || 'YouTube Video'}
            />
          </div>
        ) : isIG ? (
          <div className="w-full bg-black flex flex-col items-center justify-center">
            {igEmbed ? (
              <div className="w-full aspect-[9/16] max-h-[72vh] bg-black relative">
                <iframe
                  src={igEmbed}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={item.title || 'Instagram Reel'}
                />
              </div>
            ) : item.thumbnail_path ? (
              <img
                src={getMediaUrl(item.thumbnail_path)}
                alt={item.title || 'Instagram'}
                className="w-full max-h-[70vh] object-cover"
              />
            ) : null}
            <div className="w-full p-4 bg-slate-950 border-t border-slate-900 text-center space-y-2">
              <p className="text-white font-serif font-bold text-sm sm:text-base truncate px-2">
                {item.title || 'Instagram Reel'}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-lg cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Watch Reel on Instagram
              </a>
            </div>
          </div>
        ) : isVid ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center">
            <video
              src={getMediaUrl(url)}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-300">
            <p className="mb-4 text-sm font-semibold">{item.title || 'External Media Link'}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 hover:bg-amber-400 transition-colors"
            >
              Open Media Link <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </Dialog>
  );
}

// ─── Media Card ────────────────────────────────────────────────────────────────
function MediaCard({
  item,
  activeKind,
  onClick,
}: {
  item: GalleryItem;
  activeKind: GalleryMediaKind;
  onClick: () => void;
}) {
  const thumb = getMediaThumb(item);
  const isEmbed = activeKind !== 'photo';
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-slate-600 shadow-xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-amber-500/10"
    >
      <div className="aspect-video relative bg-slate-900 overflow-hidden">
        {!imgFailed ? (
          <img
            src={thumb}
            alt={item.alt_text || item.title || 'media'}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-rose-950 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-2xl mb-1">📱</span>
            <span className="text-xs font-serif font-bold text-white tracking-wide truncate max-w-full px-2">{item.title || 'Instagram Reel'}</span>
            <span className="text-[10px] text-pink-400 font-mono mt-1">Tap to Play Reel</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play icon for embeds */}
        {isEmbed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:scale-110 transition-all shadow-xl text-white">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Kind badge */}
        {activeKind === 'youtube' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600/90 text-white text-[10px] font-bold rounded-full shadow">
            YT
          </span>
        )}
        {activeKind === 'instagram' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-pink-600/90 text-white text-[10px] font-bold rounded-full shadow">
            IG
          </span>
        )}
        {activeKind === 'video' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/90 text-slate-950 text-[10px] font-bold rounded-full shadow">
            MP4
          </span>
        )}
      </div>

      {/* Title bar */}
      {item.title && (
        <div className="px-3 py-2">
          <p className="text-xs font-bold text-white truncate">{item.title}</p>
          {item.caption && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Lightbox Component ───────────────────────────────────────────────────
export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ items }) => {
  const [photoLightbox, setPhotoLightbox] = useState<number | null>(null);
  const [embedItem, setEmbedItem] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return <div className="py-8 text-center text-slate-600 text-sm">No items found.</div>;
  }

  // Filter photo items for photo lightbox slider navigation
  const photoItems = items.filter((item) => getMediaKind(item) === 'photo');

  const handleClick = (item: GalleryItem) => {
    const kind = getMediaKind(item);
    if (kind === 'photo') {
      const pIdx = photoItems.findIndex((p) => p.id === item.id);
      setPhotoLightbox(pIdx >= 0 ? pIdx : 0);
    } else {
      setEmbedItem(item);
    }
  };

  return (
    <>
      {/* Compact Continuous Responsive Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const kind = getMediaKind(item);
          return (
            <MediaCard
              key={item.id}
              item={item}
              activeKind={kind}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>

      {/* Photo fullscreen lightbox (Matching Image 2 design) */}
      {photoLightbox !== null && photoItems.length > 0 && (
        <PhotoLightbox
          items={photoItems}
          startIndex={photoLightbox}
          onClose={() => setPhotoLightbox(null)}
        />
      )}

      {/* Video / Shorts / Embed modal (Matching Image 1 design) */}
      {embedItem && (
        <EmbedModal item={embedItem} onClose={() => setEmbedItem(null)} />
      )}
    </>
  );
};
