'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, PhoneCall } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';

export interface FAQItem {
  id: string;
  title: string;
  content: string;
}

export interface FAQSectionProps {
  faqs?: FAQItem[];
}

const DEFAULT_FAQS: FAQItem[] = [
  { id: 'faq-1', title: 'Are your plots DTCP approved?', content: 'Yes, our residential layouts — including Rasi Garden, Kongu Nagar, and Kongu Garden — are developed as DTCP-approved plots with clear documentation.' },
  { id: 'faq-2', title: 'Do you provide clear title and patta for plots?', content: 'Yes, every plot sold by Your Choice Properties comes with clear title documents and patta, along with full support during the registration process.' },
  { id: 'faq-3', title: 'What plot sizes are available?', content: 'Plot sizes vary by project and layout. Our team can share available dimensions and pricing for Rasi Garden, Kongu Nagar, and Kongu Garden during a site visit or consultation.' },
  { id: 'faq-4', title: 'Do villas come with basic amenities like roads, drainage, and lighting?', content: 'Yes, all our residential layouts include internal roads, underground drainage, and street lighting as part of the planned infrastructure.' },
  { id: 'faq-5', title: 'What villa configurations do you offer?', content: 'We offer 2BHK, 3BHK, and 4BHK villas and independent houses across our projects, so families of different sizes and budgets can find the right fit.' },
  { id: 'faq-6', title: 'Are the villas ready to move in?', content: 'Many of our villas are ready-to-occupy, while some are available at various stages of construction. Our team can confirm current availability for each project.' },
  { id: 'faq-7', title: 'Do you help with home loans or financing?', content: 'Yes, our team assists buyers with loan and financing guidance to make purchasing a plot or villa in Namakkal or Paramathy Velur more accessible.' },
  { id: 'faq-8', title: 'What is the process to book a plot or villa?', content: 'The process typically starts with a free site visit, followed by document verification, booking, and registration — our team guides you through each step personally.' },
  { id: 'faq-9', title: 'Can NRIs purchase property with Your Choice Properties?', content: 'Yes, we regularly assist NRI buyers looking to invest in plots and villas back home in Namakkal and Paramathy Velur, with remote consultation and documentation support available.' },
  { id: 'faq-10', title: 'Do you offer support after the property is registered?', content: 'Yes, our relationship doesn\'t end at registration — we provide after-sales support for documentation, queries, and any assistance you may need as a homeowner.' },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const list = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  // Ensure each item has a unique id for accordion
  const faqItems = list.map((item, idx) => ({
    id: item.id || `faq-${idx + 1}`,
    title: item.title,
    content: item.content,
  }));

  return (
    <section className="py-10 bg-slate-950 text-slate-100 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Have Questions? We Have Answers.
          </h2>
          <p className="text-sm text-slate-400">
            Clear insights regarding legal verification, layout approval, site visits, and registration.
          </p>
        </div>

        <Accordion items={faqItems} />

        {/* Footer Callout Below FAQ */}
        <div className="mt-12 text-center pt-8 border-t border-slate-900/80 space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white max-w-2xl mx-auto leading-relaxed">
            If you didn&apos;t find the answer you were looking for, our team is happy to help directly.
          </h2>
          <div>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
            >
              <PhoneCall className="w-4 h-4" /> Get Direct Help
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
