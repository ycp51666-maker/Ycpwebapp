import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Layers,
  Maximize,
  Building2,
  Car,
  FileCheck,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { getContentPage } from '@/lib/data';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('services');
}

export interface ServiceItem {
  id: string;
  title: string;
  image_url?: string;
  content: string;
}

export default async function ServicesPage() {
  const contentRecord = await getContentPage('services');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (contentRecord?.content as Record<string, any>) || {};

  const defaultServices: ServiceItem[] = [
    {
      id: 'srv-1',
      title: 'Residential Plot Sales',
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      content:
        'We offer DTCP-approved residential plots in Namakkal and Paramathi Velur for buyers who want to build a home or invest in land. Our team explains the location, available plot sizes, documents and current price before you decide.',
    },
    {
      id: 'srv-2',
      title: 'Villa and House Sales — 2BHK, 3BHK and 4BHK',
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      content:
        'We help families explore 2BHK, 3BHK and 4BHK villas and independent houses across Rasi Garden, Kongu Nagar and Kongu Garden. Available choices depend on the project and current construction status.',
    },
    {
      id: 'srv-3',
      title: 'Site Visits and Consultation',
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      content:
        'Our local team arranges guided site visits so you can compare the location, roads, layout, villa design and nearby facilities before making a decision.',
    },
    {
      id: 'srv-4',
      title: 'Documentation and Registration Support',
      image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      content:
        'We guide buyers through available title documents, patta-related information, booking paperwork and registration. Buyers should independently verify all legal documents before purchase.',
    },
    {
      id: 'srv-5',
      title: 'Home-Loan Assistance',
      image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      content:
        'We guide eligible buyers in understanding available loan and financing options. Final approval, interest rates and terms are decided by the bank or financial institution.',
    },
  ];

  const servicesList: ServiceItem[] = contentJson.services_list || defaultServices;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" /> End-to-End Real Estate Support
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          {contentJson.services_h1 || 'Our Real Estate Services in Namakkal and Paramathi Velur'}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-3 leading-relaxed">
          {contentJson.services_intro ||
            'Our team helps you choose the right plot or villa and supports you from your first enquiry through site visit, documentation and registration.'}
        </p>
      </div>

      {/* Service Cards Grid with Images */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesList.map((srv, idx) => {
          const cardImage =
            srv.image_url ||
            defaultServices[idx % defaultServices.length].image_url ||
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={srv.id || idx}
              className="group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <Image
                    src={cardImage}
                    alt={srv.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                </div>

                <div className="p-6 space-y-3">
                  <h2 className="font-serif text-xl font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
                    {srv.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {srv.content}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 mt-2">
                <div className="pt-4 border-t border-slate-800/80">
                  <Link
                    href="/contact-us"
                    className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center justify-between group-hover:translate-x-1 transition-transform"
                  >
                    <span>Enquire About Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final CTA Section */}
      <SiteVisitCTASection
        heading={contentJson.cta_heading || 'Need Help Choosing the Right Plot or Villa?'}
        description={
          contentJson.cta_description ||
          'Talk to our team and explore suitable property options in Namakkal and Paramathi Velur.'
        }
      />
    </div>
  );
}
