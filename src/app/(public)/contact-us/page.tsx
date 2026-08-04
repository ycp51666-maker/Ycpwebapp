import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageSquare, ChevronRight, ExternalLink, Share2 } from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/icons';
import { siteConfig } from '@/config/site';
import { getFAQs, getContentPage, getSocialLinks, getContactInfo } from '@/lib/data';
import { ContactForm } from '@/components/forms/ContactForm';
import { FAQSection } from '@/components/public/FAQSection';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('contact-us');
}

export default async function ContactUsPage() {
  const [faqs, socialLinks, dbContactInfo] = await Promise.all([
    getFAQs(),
    getSocialLinks(),
    getContactInfo(),
  ]);

  const contactInfo = dbContactInfo || {};
  const phone = contactInfo.phone || siteConfig.contact.phone;
  const whatsapp = contactInfo.whatsapp || siteConfig.contact.whatsapp;
  const email = contactInfo.email || siteConfig.contact.email;
  const address = contactInfo.address || siteConfig.contact.address;
  const workingHours = contactInfo.working_hours || 'Mon - Sun: 9:00 AM - 8:00 PM';
  const mapUrl = contactInfo.map_url || null;

  const fbUrl = socialLinks?.facebook || 'https://facebook.com/yourchoiceproperties';
  const instaUrl = socialLinks?.instagram || 'https://instagram.com/yourchoiceproperties';
  const ytUrl = socialLinks?.youtube || 'https://youtube.com/@yourchoiceproperties';

  // Load dynamic contact page content from DB
  const contentRecord = await getContentPage('contact');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (contentRecord?.content as Record<string, any>) || {};
  const contactBgImage = contentJson.contact_bg_image || null;
  const bannerHeading = contentJson.heading || contentJson.title || 'Contact Your Choice Properties';
  const bannerSubtitle = contentJson.subtitle || 'Looking for your dream home or the perfect investment?';
  const bannerBody = contentJson.body || 'Our property experts are here to guide you through every step—from selecting the right plot or villa to documentation and loan assistance. Schedule your site visit today and explore our premium projects.';

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    image: `${siteConfig.domain}/logo.png`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Main Road',
      addressLocality: 'Namakkal',
      addressRegion: 'Tamil Nadu',
      postalCode: '637001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.2189,
      longitude: 78.1674,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00',
    },
    priceRange: '₹₹₹',
  };

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
        name: 'Contact Us',
        item: `${siteConfig.domain}/contact-us`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Banner Header */}
        <section 
          className="relative py-5 sm:py-6 overflow-hidden contact-banner"
          style={contactBgImage ? {
            backgroundImage: `url(${contactBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          {contactBgImage && (
            <div className="absolute inset-0 z-0 contact-banner-bg-container hidden">
              <Image
                src={contactBgImage}
                alt="Contact Background"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              {/* Cinematic Gradient overlays identical to project page */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
            </div>
          )}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pb-1">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-amber-400">Contact Us</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {bannerHeading}
            </h1>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-400 pt-1">
              {bannerSubtitle}
            </h2>

            <h3 className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed font-normal">
              {bannerBody}
            </h3>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-white">Headquarters & Office</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visit our office or call us to schedule an exclusive guided layout site visit.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm">Office Address</h3>
                    <p className="text-sm sm:text-base text-slate-200 mt-1">{address}</p>
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block group"
                        aria-label="Open office location in Google Maps"
                      >
                        <div className="w-full bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700 group-hover:border-amber-400 group-hover:bg-slate-700 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                            View on Google Maps
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <Phone className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Phone Hotline</h3>
                    <a href={`tel:${phone.replace(/[^0-[#\*\+0-9]/g, '')}`} className="text-sm sm:text-base font-bold text-amber-400 hover:underline mt-1 block">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white text-sm">WhatsApp Assistance</h3>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-bold text-emerald-400 hover:underline mt-1 block"
                    >
                      Chat on WhatsApp ({whatsapp})
                    </a>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <Mail className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Email Inbox</h3>
                    <a href={`mailto:${email}`} className="text-sm sm:text-base text-slate-200 hover:underline mt-1 block">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Working Hours</h3>
                    <p className="text-sm sm:text-base text-slate-200 mt-1">{workingHours}</p>
                  </div>
                </div>

                {/* Social Media Channels */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
                  <Share2 className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">Official Social Media</h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">Follow us for project walkthrough videos and new layout announcements.</p>
                    <div className="flex items-center gap-4">
                      {instaUrl && (
                        <a
                          href={instaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E4405F] text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <InstagramIcon className="w-5 h-5" /> Instagram
                        </a>
                      )}
                      {fbUrl && (
                        <a
                          href={fbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1877F2] text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <FacebookIcon className="w-5 h-5" /> Facebook
                        </a>
                      )}
                      {ytUrl && (
                        <a
                          href={ytUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF0000] text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <YoutubeIcon className="w-5 h-5" /> YouTube
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs ?? undefined} />
      </div>
    </>
  );
}
