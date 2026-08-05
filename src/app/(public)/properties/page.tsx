import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Sliders, MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import { getPublishedConfigurations, getPublishedLocations, getPublishedProjects } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('properties');
}

export interface PropertiesListingPageProps {
  searchParams: Promise<{
    location?: string;
    project?: string;
    type?: string;
    bhk?: string;
    status?: string;
  }>;
}

export default async function PropertiesListingPage({ searchParams }: PropertiesListingPageProps) {
  const { location, project, type, bhk, status } = await searchParams;

  const parsedBhk = bhk ? parseInt(bhk, 10) : undefined;

  const [configurations, locations, projects] = await Promise.all([
    getPublishedConfigurations({
      locationId: location,
      projectId: project,
      type: type,
      bhk: isNaN(parsedBhk!) ? undefined : parsedBhk,
      status: status,
    }),
    getPublishedLocations(),
    getPublishedProjects(),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.domain,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: `${siteConfig.domain}/properties`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="space-y-4 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-amber-400">Properties</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Property Configurations
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Filter by location, BHK bedrooms, plot dimensions, and availability status.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <form method="GET" action="/properties" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <select
                  name="location"
                  defaultValue={location || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Project</label>
                <select
                  name="project"
                  defaultValue={project || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                <select
                  name="type"
                  defaultValue={type || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="Plot">Villa Plot</option>
                  <option value="Villa">Independent Villa</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">BHK</label>
                <select
                  name="bhk"
                  defaultValue={bhk || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="">Any BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={status || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="">All Availability</option>
                  <option value="Available">Available</option>
                  <option value="Fast Filling">Fast Filling</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" /> Filter
                </button>
                {(location || project || type || bhk || status) && (
                  <Link
                    href="/properties"
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center"
                  >
                    Reset
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Properties Grid */}
          {configurations.length === 0 ? (
            <EmptyState
              title="No Configurations Found"
              description="No active property configurations match your chosen filters."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-amber-400">{config.property_type}</span>
                      <Badge variant="emerald">{config.availability_status}</Badge>
                    </div>

                    <h2 className="font-serif font-bold text-white text-lg">{config.name}</h2>

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{config.project?.name} ({config.project?.location?.name})</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {config.short_description || 'DTCP Vasthu compliant plot / villa unit.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Dimensions</span>
                        <span className="font-semibold text-slate-200">{config.plot_area || config.built_up_area || 'Standard'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Price</span>
                        <span className="font-bold text-amber-400">
                          {config.starting_price ? `₹${(config.starting_price / 100000).toFixed(2)} Lakhs*` : 'On Request'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <Link
                      href={`/properties/${config.slug}`}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 transition-colors"
                    >
                      <span>Full Specifications</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
