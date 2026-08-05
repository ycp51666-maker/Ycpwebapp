import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import {
  getProjectBySlug,
  getProjectAmenities,
  getProjectLandmarks,
  getPublishedConfigurations,
  getPublishedGalleryItems,
  getContactInfo,
  resolveContactInfo,
} from '@/lib/data';

import {
  ChevronRight,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { ProjectAccordionSections } from '@/components/public/ProjectAccordionSections';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { siteConfig } from '@/config/site';
import { getSeoOverride, buildMetadataFromOverride, getProjectJsonLd, resolveJsonLd } from '@/lib/seo/metadata';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';

export interface ProjectPageProps {
  params: Promise<{
    projectSlug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);

  if (!project) {
    return { title: 'Project Not Found | Your Choice Properties' };
  }

  const override = await getSeoOverride('project', project.id);

  return buildMetadataFromOverride(override, {
    title: `${project.name} | Gated Layout & Family Villas in ${project.location?.name || 'Namakkal'}`,
    description:
      project.short_description ||
      `${project.name} is a premier residential project offering DTCP approved villa plots and independent family homes in ${project.location?.name || 'Namakkal'}.`,
    canonicalUrl: `${siteConfig.domain}/projects/${project.slug}`,
    ogImage: project.hero_image_path ?? undefined,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);

  if (!project) {
    notFound();
  }

  const [amenities, landmarks, allConfigurations, galleryItems, seoOverride, contactInfo] = await Promise.all([
    getProjectAmenities(project.id),
    getProjectLandmarks(project.id),
    getPublishedConfigurations({ projectId: project.id }),
    getPublishedGalleryItems({ projectId: project.id }),
    getSeoOverride('project', project.id),
    getContactInfo(),
  ]);

  const resolvedContact = resolveContactInfo({
    globalContact: contactInfo,
    location: project.location,
    project,
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

  const jsonLd = resolveJsonLd(seoOverride, getProjectJsonLd(project));

  const villas = allConfigurations
    .filter((c) => c.property_type === 'Villa' || c.property_type === 'Apartment')
    .sort((a, b) => (b.bhk || 0) - (a.bhk || 0));

  const plots = allConfigurations.filter((c) => c.property_type === 'Plot');

  const DEFAULT_VIDEO_WALKTHROUGH = 'https://www.youtube.com/watch?v=668nUCeBHyY';

  const projectVideoUrl =
    project.hero_video_path ||
    galleryItems.find(
      (item) => item.category === 'project_video' || item.media_type === 'video' || item.video_url
    )?.video_url ||
    galleryItems.find(
      (item) => item.category === 'project_video' || item.media_type === 'video'
    )?.storage_path_or_url ||
    DEFAULT_VIDEO_WALKTHROUGH;

  const floorPlans = galleryItems.filter((item) => item.category === 'floor_plan');

  return (
    <>
      {/* JSON-LD Structured Data (admin-overridable) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* ─── 1. CINEMATIC GRADIENT HERO ─────────────────────────────────────── */}
      <section className="hero-gradient-banner relative py-5 sm:py-6 overflow-hidden border-b border-slate-800/80">
        {/* Glowing gradient ambient circles */}
        <div className="absolute -top-12 -left-12 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <Link href="/projects" className="hover:text-amber-400 transition-colors">Projects</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <span className="text-amber-400 font-bold">{project.name}</span>
          </div>

          <div className="max-w-3xl space-y-3">
            {/* Project Name */}
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {project.name}
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-0.5">
              <a href={`tel:${phone.replace(/[^0-[#\*\+0-9]/g, '')}`}>
                <Button variant="gold" size="sm" className="font-bold shadow-md text-xs">
                  <Phone className="w-3.5 h-3.5 mr-1.5 pointer-events-none" /> Call Now for Site Visit
                </Button>
              </a>
              <a
                href={buildWhatsAppUrl({
                  phone: whatsapp,
                  customMessage: `Hi! I'm interested in ${project.name}. Please share availability and pricing.`,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="font-bold border-emerald-500/60 text-emerald-400 bg-slate-900/60 backdrop-blur-sm hover:bg-emerald-950 text-xs">
                  <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5 pointer-events-none" /> WhatsApp Enquiry
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* ─── 3. MAIN ACCORDION DETAILS CONTAINER ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectAccordionSections
          project={project}
          villas={villas}
          plots={plots}
          amenities={amenities}
          landmarks={landmarks}
          galleryItems={galleryItems}
          floorPlans={floorPlans}
          projectVideoUrl={projectVideoUrl}
        />
      </div>

      {/* ─── SITE VISIT CTA ──────────────────────────────────────── */}
      <SiteVisitCTASection
        heading={`Schedule a Free Site Visit to ${project.name}`}
        description="Our team will pick you up and show you available plots and villas. No obligation, completely free."
        phone={phone}
        whatsapp={whatsapp}
      />
    </div>
    </>
  );
}
