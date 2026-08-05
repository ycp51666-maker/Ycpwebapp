import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ChevronRight, Compass, ShieldCheck } from 'lucide-react';
import { getLocationBySlug, getPublishedProjects, getPublishedConfigurations, getPublishedLocations, getLocationLandmarks } from '@/lib/data';
import { getActiveAmenities } from '@/lib/data/amenities';
import { siteConfig } from '@/config/site';
import { getSeoOverride, buildMetadataFromOverride, getLocationJsonLd, resolveJsonLd } from '@/lib/seo/metadata';
import { Badge } from '@/components/ui/badge';
import { FeaturedProjectsSection } from '@/components/public/FeaturedProjectsSection';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { LocationAmenities } from '@/components/public/LocationAmenities';
import { ProjectLandmarksPopup } from '@/components/public/ProjectLandmarksPopup';

export interface LocationDetailPageProps {
  params: Promise<{
    locationSlug: string;
  }>;
}

export async function generateStaticParams() {
  const locations = await getPublishedLocations();
  return locations.map((loc) => ({
    locationSlug: loc.slug,
  }));
}

export async function generateMetadata({ params }: LocationDetailPageProps): Promise<Metadata> {
  const { locationSlug } = await params;
  const location = await getLocationBySlug(locationSlug);

  if (!location) {
    return {
      title: 'Location Not Found',
    };
  }

  const override = await getSeoOverride('location', location.id);

  return buildMetadataFromOverride(override, {
    title: `${location.name} Real Estate & Villa Plots`,
    description: location.short_description || `Explore DTCP approved plots and villas in ${location.name}.`,
    canonicalUrl: `${siteConfig.domain}/locations/${location.slug}`,
    ogImage: location.hero_image_path ?? undefined,
  });
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { locationSlug } = await params;
  const location = await getLocationBySlug(locationSlug);

  if (!location) {
    notFound();
  }

  const projects = await getPublishedProjects({ locationId: location.id });
  const projectIds = projects.map((p) => p.id);

  // Fetch projects, configurations, amenities, landmarks, and SEO override for this location
  const [configurations, seoOverride, allAmenities, landmarks] = await Promise.all([
    getPublishedConfigurations({ locationId: location.id }),
    getSeoOverride('location', location.id),
    getActiveAmenities(),
    getLocationLandmarks(projectIds),
  ]);

  if (seoOverride?.redirect_url) {
    if (seoOverride.redirect_type === 301) {
      permanentRedirect(seoOverride.redirect_url);
    } else {
      redirect(seoOverride.redirect_url);
    }
  }

  const jsonLd = resolveJsonLd(seoOverride, getLocationJsonLd(location));

  return (
    <>
      {/* JSON-LD Structured Data (admin-overridable) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Compact Gradient Location Hero Header */}
        <section className="hero-gradient-banner relative py-6 sm:py-8 overflow-hidden border-b border-slate-800/80">
          {/* Glowing gradient ambient circles */}
          <div className="absolute -top-12 -left-12 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <Link href="/locations" className="hover:text-amber-400 transition-colors">
                  Locations
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-amber-400 font-bold">{location.name}</span>
              </div>

              {/* Address Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider w-fit">
                <MapPin className="w-3 h-3 text-amber-400" /> {location.address || 'Tamil Nadu'}
              </div>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Properties &amp; Townships in {location.name}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              {location.full_description || location.short_description ||
                `${location.name} offers rapid infrastructure growth, high resale appreciation, and strategic access to schools, hospitals, and national highways.`}
            </p>
          </div>
        </section>

        {/* Location Projects Section */}
        <FeaturedProjectsSection projects={projects} />

        {/* Township & Villa Amenities Section */}
        <LocationAmenities amenities={allAmenities} />

        {/* Landmarks Section */}
        {landmarks.length > 0 && (
          <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectLandmarksPopup landmarks={landmarks} projectName={location.name} />
          </div>
        )}

        {/* Configurations Breakdown */}
        {configurations.length > 0 && (
          <section className="py-10 bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Available Property Configurations in {location.name}
                </h2>
                <Badge variant="gold">{configurations.length} Options</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {configurations.map((config) => (
                  <div key={config.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span>{config.property_type}</span>
                      <Badge variant="emerald">{config.availability_status}</Badge>
                    </div>
                    <h3 className="font-serif font-bold text-white text-lg">{config.name}</h3>
                    <p className="text-xs text-slate-400">{config.short_description || 'DTCP approved setup with road clearance.'}</p>
                    <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Area: {config.plot_area || config.built_up_area || 'Standard Plot'}</span>
                      <Link href={`/properties/${config.slug}`} className="text-amber-400 hover:underline">
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Map Embed Section if Map URL exists */}
        {location.map_url && (
          <section className="py-10 bg-slate-900/60 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Location &amp; Map Accessibility
              </h2>
              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <iframe
                  src={location.map_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        )}

        <SiteVisitCTASection whatsapp={location.whatsapp || undefined} phone={location.phone || undefined} />
      </div>
    </>
  );
}
