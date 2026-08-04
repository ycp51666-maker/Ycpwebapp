import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { getPublishedLocations } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('locations');
}

export default async function LocationsListingPage() {
  const [currentLocations, upcomingLocations] = await Promise.all([
    getPublishedLocations({ status: 'current' }),
    getPublishedLocations({ status: 'upcoming' }),
  ]);

  const fallbackImages: Record<string, string> = {
    namakkal: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    'paramathi-velur': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    salem: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    erode: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto border-b border-slate-800 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Layout Hubs</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white mt-1">
          Explore Our Locations
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
          View our current residential projects and the locations where new projects are planned.
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section 1: Current Locations */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-400" /> Current Locations
            </h2>
            <Badge variant="gold" className="font-mono">
              {currentLocations.length} Active Hubs
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentLocations.map((loc) => {
              const imageSrc =
                loc.hero_image_path ||
                fallbackImages[loc.slug] ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

              const projectNames = (loc.projects || [])
                .map((p) => p.name)
                .filter(Boolean)
                .join(', ');

              return (
                <Link
                  key={loc.id}
                  href={`/locations/${loc.slug}`}
                  className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between cursor-pointer hover:border-amber-500/50 hover:shadow-amber-500/10 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={loc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="image-overlay-content absolute bottom-4 left-6 right-6 z-10 pointer-events-none">
                      <h3 className="font-serif text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {loc.name}
                      </h3>
                      {projectNames && (
                        <p className="text-[11px] text-amber-300 font-mono line-clamp-1 mt-0.5">
                          Projects: {projectNames}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {loc.short_description || 'Active DTCP approved gated layouts and villa homes.'}
                    </p>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {loc.projectCount} Published Projects
                      </span>

                      {/* Visual indicator — whole card is the link */}
                      <span className="py-2 px-4 bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 border border-amber-500/30 text-xs font-bold rounded-xl inline-flex items-center gap-1 transition-all pointer-events-none">
                        View Projects <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Upcoming Locations (Only rendered if upcoming locations exist) */}
        {upcomingLocations.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" /> Upcoming Locations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingLocations.map((loc) => {
                const imageSrc =
                  loc.hero_image_path ||
                  fallbackImages[loc.slug] ||
                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={loc.id}
                    className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-xl flex flex-col justify-between opacity-90"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={loc.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge variant="gold" className="font-bold shadow-lg">
                          Coming Soon
                        </Badge>
                      </div>
                      <div className="image-overlay-content absolute bottom-4 left-6 right-6 z-10 pointer-events-none">
                        <h3 className="font-serif text-2xl font-bold text-white">{loc.name}</h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {loc.short_description || 'New residential land layout developments currently in planning phase.'}
                      </p>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Status: Acquisition & Planning</span>
                        <Link href="/contact-us" className="text-amber-400 font-bold hover:underline">
                          Register Interest →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
