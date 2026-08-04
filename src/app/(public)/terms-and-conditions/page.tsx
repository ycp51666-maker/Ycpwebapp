import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { getContentPage } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('terms-and-conditions');
}

export default async function TermsAndConditionsPage() {
  const page = await getContentPage('terms');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (page?.content as Record<string, any>) || {};
  const heading = contentJson.heading || page?.title || 'Terms and Conditions';
  const dbBody = contentJson.body || '';

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400">Terms &amp; Conditions</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-amber-400" />
            {heading}
          </h1>
          <p className="text-xs text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
          {dbBody ? (
            <div className="whitespace-pre-line space-y-4">
              {dbBody}
            </div>
          ) : (
            <>
              <p>
                Welcome to <strong>{siteConfig.name}</strong>. By accessing our portal, booking layout site visits, or submitting property inquiries, you agree to comply with the terms and conditions outlined below.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">1. Property Listings &amp; Pricing Disclaimer</h2>
              <p>
                All plot dimensions, villa floor plans, starting prices, and statutory approvals (DTCP/RERA) displayed on this website are subject to real-time availability and legal verification. Prices quoted on promotional materials exclude statutory government stamp duty, sub-registrar deed registration fees, and local utility connection charges unless specified in writing.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">2. Plot Allotment &amp; Advance Bookings</h2>
              <p>
                Selection of a specific plot number or villa configuration from layout maps is formalized only upon execution of a written advance token agreement and payment receipt issued by an authorized company officer. Submission of an online form does not automatically reserve plot ownership.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">3. Free Site Visit Transport Service</h2>
              <p>
                Our chauffeured pickup and drop facility is provided complimentary for genuine prospective property buyers. Pickup schedules must be confirmed at least 12 hours in advance.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">4. Applicable Jurisdiction</h2>
              <p>
                All transactions and dispute resolution shall be governed exclusively by the courts having legal jurisdiction over Namakkal District, Tamil Nadu.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
