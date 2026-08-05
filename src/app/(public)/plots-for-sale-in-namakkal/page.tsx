import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Compass, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getPublishedProjects, getPublishedConfigurations, getLocationBySlug } from '@/lib/data';
import { FeaturedProjectsSection } from '@/components/public/FeaturedProjectsSection';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { Badge } from '@/components/ui/badge';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('plots-for-sale-in-namakkal');
}

export default async function NamakkalPlotsLandingPage() {
  const location = await getLocationBySlug('namakkal');
  const projects = await getPublishedProjects({ locationId: location?.id });
  const plotConfigs = await getPublishedConfigurations({ locationId: location?.id, type: 'Plot' });

  const landingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'DTCP Approved Plots for Sale in Namakkal',
    url: `${siteConfig.domain}/plots-for-sale-in-namakkal`,
    description: 'Browse verified residential plots for sale across Rasi Garden and Kongu Nagar layouts in Namakkal.',
    provider: {
      '@type': 'RealEstateAgent',
      name: siteConfig.name,
      url: siteConfig.domain,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Keyword-Targeted Hero Banner */}
        <section className="relative py-12 bg-slate-900 border-b border-slate-800 hero-dark-overlay overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/locations/namakkal" className="hover:text-amber-400 transition-colors">Namakkal</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-amber-400 font-bold">Plots for Sale</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 100% DTCP Approved &amp; Legal Title Clear
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              DTCP Approved Residential Plots for Sale in Namakkal
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Explore premier residential plot layouts across Rasi Garden and Kongu Nagar in Namakkal. Equipped with 30ft/40ft wide blacktop roads, street lights, underground drainage, and individual water tap connections.
            </p>
          </div>
        </section>

        {/* Featured Projects in Namakkal */}
        <FeaturedProjectsSection projects={projects} />

        {/* Available Plot Configurations Grid */}
        {plotConfigs.length > 0 && (
          <section className="py-12 bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Available Residential Plot Sizes in Namakkal
                </h2>
                <Badge variant="gold">{plotConfigs.length} Available Layouts</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plotConfigs.map((config) => (
                  <div key={config.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span>{config.property_type}</span>
                      <Badge variant="emerald">{config.availability_status}</Badge>
                    </div>
                    <h3 className="font-serif font-bold text-white text-lg">{config.name}</h3>
                    <p className="text-xs text-slate-400">{config.short_description || 'DTCP approved plot with immediate patta registration support.'}</p>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300">Dimension: {config.plot_area || 'Standard Size'}</span>
                      <Link href={`/properties/${config.slug}`} className="text-amber-400 hover:underline flex items-center gap-1">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <SiteVisitCTASection
          heading="Book a Chauffeured Site Visit to Namakkal Layouts"
          description="Schedule a free site visit to inspect Rasi Garden or Kongu Nagar plots with our property guidance team."
        />
      </div>
    </>
  );
}
