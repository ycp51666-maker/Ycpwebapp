import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  BedDouble,
  Bath,
  Car,
  IndianRupee,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import {
  getConfigurationBySlug,
  getPublishedConfigurations,
  getProjectAmenities,
  getPublishedGalleryItems,
  getContactInfo,
  resolveContactInfo,
} from '@/lib/data';
import { siteConfig } from '@/config/site';
import { getSeoOverride, buildMetadataFromOverride, getConfigurationJsonLd, resolveJsonLd } from '@/lib/seo/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { PropertyMediaGallery } from '@/components/public/PropertyMediaGallery';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';

export interface PropertyDetailPageProps {
  params: Promise<{
    propertySlug: string;
  }>;
}

export async function generateStaticParams() {
  const configs = await getPublishedConfigurations();
  return configs.map((c) => ({
    propertySlug: c.slug,
  }));
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { propertySlug } = await params;
  const config = await getConfigurationBySlug(propertySlug);

  if (!config) {
    return { title: 'Property Not Found' };
  }

  const override = await getSeoOverride('configuration', config.id);

  return buildMetadataFromOverride(override, {
    title: `${config.name} | ${config.project?.name || 'Gated Layout'}`,
    description:
      config.short_description ||
      `Explore details for ${config.name} at ${config.project?.name} in ${config.project?.location?.name || 'Namakkal'}.`,
    canonicalUrl: `${siteConfig.domain}/properties/${config.slug}`,
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { propertySlug } = await params;
  const config = await getConfigurationBySlug(propertySlug);

  if (!config) {
    notFound();
  }

  // Fetch parallel relations + SEO override + live contact info
  const [projectAmenities, galleryItems, siblingConfigurations, seoOverride, contactInfo] = await Promise.all([
    config.project_id ? getProjectAmenities(config.project_id) : Promise.resolve([]),
    getPublishedGalleryItems({ propertyConfigurationId: config.id }),
    config.project_id ? getPublishedConfigurations({ projectId: config.project_id }) : Promise.resolve([]),
    getSeoOverride('configuration', config.id),
    getContactInfo(),
  ]);

  const resolvedContact = resolveContactInfo({
    globalContact: contactInfo,
    location: config.project?.location,
    project: config.project,
  });
  const phone = resolvedContact.phone || siteConfig.contact.phone;
  const whatsapp = resolvedContact.whatsapp || siteConfig.contact.whatsapp;

  if (seoOverride?.redirect_url) {
    if (seoOverride.redirect_type === 301) {
      permanentRedirect(seoOverride.redirect_url);
    } else {
      redirect(seoOverride.redirect_url);
    }
  }

  const jsonLd = resolveJsonLd(seoOverride, getConfigurationJsonLd(config));

  // Related properties (excluding current property, sorted: 4BHK -> 3BHK -> 2BHK -> Plots)
  const relatedProperties = siblingConfigurations
    .filter((c) => c.id !== config.id)
    .sort((a, b) => {
      const bhkA = a.bhk || 0;
      const bhkB = b.bhk || 0;
      return bhkB - bhkA;
    });

  const fallbackHero =
    config.hero_image_path ||
    config.project?.hero_image_path ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  const floorPlanItems = galleryItems.filter((i) => i.category === 'floor_plan');

  const formattedPrice = config.starting_price
    ? `₹${(config.starting_price / 100000).toFixed(2)} Lakhs*`
    : null;

  const featuresList = Array.isArray(config.feature_list)
    ? (config.feature_list as string[])
    : typeof config.feature_list === 'string'
    ? JSON.parse(config.feature_list || '[]')
    : [];

  return (
    <>
      {/* JSON-LD Structured Data (admin-overridable) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Breadcrumb Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/projects" className="hover:text-amber-400">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {config.project && (
            <>
              <Link href={`/projects/${config.project.slug}`} className="hover:text-amber-400">
                {config.project.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-amber-400">{config.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Required Desktop Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Side: Property Media Gallery (60% Width) */}
          <div className="lg:col-span-7 space-y-6">
            <PropertyMediaGallery
              propertyName={config.name}
              fallbackImage={fallbackHero}
              galleryItems={galleryItems}
            />
          </div>

          {/* Right Side: Sticky Property-Information Panel (40% Width) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="space-y-3 border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{config.property_type}</Badge>
                {config.bhk > 0 && <Badge variant="emerald">{config.bhk} BHK</Badge>}
                <Badge variant="slate">{config.availability_status || 'Available'}</Badge>
              </div>

              <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
                {config.name}
              </h1>

              {config.project && (
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Part of </span>
                  <Link href={`/projects/${config.project.slug}`} className="text-amber-400 font-bold hover:underline">
                    {config.project.name}
                  </Link>
                  <span> in {config.project.location?.name || 'Namakkal'}</span>
                </p>
              )}
            </div>

            {/* Fact Grid (Only non-empty values rendered!) */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
              {config.plot_area && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Plot Area</span>
                  <span className="font-bold text-amber-400">{config.plot_area}</span>
                </div>
              )}
              {config.built_up_area && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Built-up Area</span>
                  <span className="font-bold text-slate-200">{config.built_up_area}</span>
                </div>
              )}
              {config.bedrooms > 0 && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Bedrooms</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-amber-400" /> {config.bedrooms} BHK</span>
                </div>
              )}
              {config.bathrooms > 0 && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Bathrooms</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-emerald-400" /> {config.bathrooms}</span>
                </div>
              )}
              {config.parking && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Covered Parking</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1"><Car className="w-3.5 h-3.5 text-blue-400" /> {config.parking}</span>
                </div>
              )}
              {formattedPrice && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Starting Price</span>
                  <span className="font-bold text-amber-400 text-sm flex items-center"><IndianRupee className="w-3.5 h-3.5" /> {formattedPrice}</span>
                </div>
              )}
            </div>

            {/* Included Key Features Checklist */}
            {featuresList.length > 0 && (
              <div className="space-y-2.5 border-t border-slate-800 pt-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Key Highlights & Features
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {featuresList.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a href={`tel:${phone.replace(/[^0-[#\*\+0-9]/g, '')}`}>
                <Button variant="gold" size="lg" className="w-full font-bold shadow-lg">
                  <PhoneCall className="w-4 h-4 mr-2" /> Call Sales Advisor
                </Button>
              </a>

              <a
                href={buildWhatsAppUrl({
                  phone: whatsapp,
                  customMessage: `Hi! I'm interested in ${config.name} at ${config.project?.name || 'Your Choice Properties'}. Please share layout details & pricing.`,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="w-full font-bold border-emerald-600/60 text-emerald-400 bg-slate-950 hover:bg-emerald-950">
                  <WhatsAppIcon className="w-4 h-4 mr-2" /> Enquire Now on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Content Below Main Area */}
        <div className="mt-16 space-y-16 border-t border-slate-800 pt-16">
          {/* 1. Property Overview */}
          <section className="space-y-4 max-w-4xl">
            <h2 className="font-serif text-3xl font-bold text-white">Property Overview</h2>
            <p className="text-slate-300 text-base leading-relaxed">
              This {config.bhk > 0 ? `${config.bhk}BHK` : ''} {config.property_type.toLowerCase()} is part of {config.project?.name || 'our township'} in {config.project?.location?.name || 'Namakkal'}. It is planned for families who need comfortable living space and clear documentation. Contact our team to confirm current pricing, layout orientation, and site visit schedules.
            </p>
            {config.full_description && (
              <p className="text-slate-300 text-base leading-relaxed">{config.full_description}</p>
            )}
          </section>

          {/* 2. Included Features */}
          {featuresList.length > 0 && (
            <section className="space-y-4 border-t border-slate-800 pt-12">
              <h2 className="font-serif text-2xl font-bold text-white">Included Layout Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuresList.map((feat: string, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Floor Plan */}
          {floorPlanItems.length > 0 && (
            <section className="space-y-4 border-t border-slate-800 pt-12">
              <h2 className="font-serif text-2xl font-bold text-white">Floor Plan Drawing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {floorPlanItems.map((fp) => (
                  <div key={fp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
                      <Image src={fp.storage_path_or_url} alt={fp.title || 'Floor Plan'} fill className="object-contain" />
                    </div>
                    <h4 className="font-bold text-white text-sm">{fp.title || 'Architectural Layout Plan'}</h4>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Parent Project Amenities */}
          {projectAmenities.length > 0 && (
            <section className="space-y-4 border-t border-slate-800 pt-12">
              <h2 className="font-serif text-2xl font-bold text-white">
                Township Amenities ({config.project?.name})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {projectAmenities.map((pa) => (
                  <div key={pa.amenity_id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white">{pa.amenity?.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Related Properties from Same Project */}
          {relatedProperties.length > 0 && (
            <section className="space-y-6 border-t border-slate-800 pt-12">
              <h2 className="font-serif text-2xl font-bold text-white">
                More Available Configurations in {config.project?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProperties.map((rel) => (
                  <div key={rel.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <Badge variant="gold">{rel.property_type}</Badge>
                    <h3 className="font-serif font-bold text-white text-lg">{rel.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{rel.short_description || 'Gated community layout configuration.'}</p>
                    <Link href={`/properties/${rel.slug}`} className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full font-bold border-slate-700 text-slate-200">
                        View Specs →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 6. Site-Visit CTA */}
      <SiteVisitCTASection
        heading={`Schedule a Guided Inspection for ${config.name}`}
        description="Pick a date and time that works best for your family. We will arrange transport to inspect the layout."
        phone={phone}
        whatsapp={whatsapp}
      />
    </div>
    </>
  );
}
