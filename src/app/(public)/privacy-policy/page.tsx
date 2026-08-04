import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { getContentPage, getContactInfo } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('privacy-policy');
}

export default async function PrivacyPolicyPage() {
  const [page, contactInfo] = await Promise.all([
    getContentPage('privacy'),
    getContactInfo(),
  ]);

  const phone = contactInfo?.phone || siteConfig.contact.phone;
  const email = contactInfo?.email || siteConfig.contact.email;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (page?.content as Record<string, any>) || {};
  const heading = contentJson.heading || page?.title || 'Privacy Policy';
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
            <span className="text-amber-400">Privacy Policy</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
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
                At <strong>{siteConfig.name}</strong>, we are committed to respecting and protecting the privacy of all visitors and prospective property buyers. This Privacy Policy describes how we collect, use, and safeguard your personal information when you browse our website or submit property inquiries.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">1. Information We Collect</h2>
              <p>We may collect personal details that you voluntarily submit through our contact forms, site visit booking modals, or direct WhatsApp click-to-chat triggers, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Full Name</li>
                <li>Mobile Phone Number &amp; WhatsApp Contact</li>
                <li>Email Address</li>
                <li>Preferred Property Location &amp; Layout Budget</li>
                <li>Preferred Site Visit Appointment Date and Time</li>
              </ul>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">2. How We Use Your Information</h2>
              <p>The information collected is used strictly for the following operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Coordinating chauffeured site visit pickups and property walkthrough appointments.</li>
                <li>Providing pricing sheets, master layout plans, and legal title clearance documents.</li>
                <li>Responding to direct telephone or WhatsApp queries regarding plot availability.</li>
                <li>Fulfilling statutory and bank housing loan documentation support.</li>
              </ul>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">3. Data Sharing &amp; Security Baseline</h2>
              <p>
                We enforce strict Row Level Security (RLS) on our databases. We do not sell, rent, or trade your personal contact details to unverified third-party telemarketers or external broker networks.
              </p>

              <h2 className="font-serif text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">4. Contact Information</h2>
              <p>
                If you have any questions regarding this policy or wish to update your contact preferences, please reach out to us at <strong>{email}</strong> or call <strong>{phone}</strong>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
