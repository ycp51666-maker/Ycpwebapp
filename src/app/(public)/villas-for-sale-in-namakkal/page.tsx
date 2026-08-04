import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Home, MapPin, ChevronRight, Compass, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getPublishedProjects, getPublishedConfigurations, getLocationBySlug } from '@/lib/data';
import { FeaturedProjectsSection } from '@/components/public/FeaturedProjectsSection';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { Badge } from '@/components/ui/badge';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('villas-for-sale-in-namakkal');
}

export default async function NamakkalVillasLandingPage() {
  const location = await getLocationBySlug('namakkal');
  const projects = await getPublishedProjects({ locationId: location?.id });
  const villaConfigs = await getPublishedConfigurations({ locationId: location?.id, type: 'Villa' });

  const landingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Villas & Houses for Sale in Namakkal',
    url: `${siteConfig.domain}/villas-for-sale-in-namakkal`,
    description: 'Custom 2BHK, 3BHK, and 4BHK independent villas for sale in Namakkal layouts.',
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
              <span className="text-amber-400 font-bold">Villas &amp; Houses</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Home className="w-4 h-4" /> 100% Vaastu Compliant Independent Homes
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              2BHK, 3BHK &amp; 4BHK Villas for Sale in Namakkal
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Find your dream family home in Namakkal across Rasi Garden and Kongu Nagar gated layouts. We offer turn-key custom architectural construction, premium teakwood fittings, covered car parking, and nationalized bank housing loan support.
            </p>
          </div>
        </section>

        {/* Featured Projects in Namakkal */}
        <FeaturedProjectsSection projects={projects} />

        {/* Available Villa Configurations Grid */}
        {villaConfigs.length > 0 && (
          <section className="py-12 bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Available Villa Configurations &amp; Floor Plans
                </h2>
                <Badge variant="gold">{villaConfigs.length} Villa Floor Plans</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {villaConfigs.map((config) => (
                  <div key={config.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span>{config.bhk ? `${config.bhk} BHK ${config.property_type}` : config.property_type}</span>
                      <Badge variant="emerald">{config.availability_status}</Badge>
                    </div>
                    <h3 className="font-serif font-bold text-white text-lg">{config.name}</h3>
                    <p className="text-xs text-slate-400">{config.short_description || 'Custom floor plan layout with covered car portico and modular kitchen.'}</p>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300">Built-Up: {config.built_up_area || 'Custom'}</span>
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
          heading="Talk to Our Architect for Custom Villa Floor Plans"
          description="Schedule a consultation with our planning team to customize your 2BHK, 3BHK, or 4BHK house layout in Namakkal."
        />
      </div>
    </>
  );
}
