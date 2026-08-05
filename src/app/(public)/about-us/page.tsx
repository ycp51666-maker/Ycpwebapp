import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import {
  Award,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  MapPin,
} from 'lucide-react';
import { getContentPage } from '@/lib/data';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';
import { WhyChooseUsDeck } from '@/components/public/WhyChooseUsDeck';
import { StatsSection } from '@/components/public/StatsSection';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('about-us');
}

export interface WhyChoiceItem {
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon?: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
}

export default async function AboutUsPage() {
  const contentRecord = await getContentPage('about');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (contentRecord?.content as Record<string, any>) || {};

  const defaultWhyItems: WhyChoiceItem[] = [
    {
      title: 'Prime Location',
      description: 'Projects in fast-growing areas with excellent connectivity and appreciation potential.',
    },
    {
      title: 'DTCP Approved',
      description: 'Legally approved plots and villas for secure property ownership.',
    },
    {
      title: 'Loan Assistance',
      description: 'End-to-end support for hassle-free home loan processing.',
    },
    {
      title: 'Clear Documentation',
      description: 'Transparent legal documentation with no hidden complications.',
    },
    {
      title: 'High Growth Potential',
      description: 'Carefully selected locations ideal for long-term investment.',
    },
    {
      title: 'Trusted Support',
      description: 'Personalized guidance from site visit to registration.',
    },
  ];

  const timelineMilestones: TimelineMilestone[] = [
    {
      year: '2011',
      title: 'Foundational Real Estate Mastery',
      subtitle: 'Land Acquisition & Legal Due Diligence',
      description:
        'Key leadership entered real estate development in Tamil Nadu, establishing rigorous 100% title clearance standards and sub-registrar document verification procedures.',
      badge: 'Foundation',
    },
    {
      year: '2018',
      title: 'Township Infrastructure Expansion',
      subtitle: 'Gated Layout & Blacktop Road Engineering',
      description:
        'Spearheaded major residential layout planning across Namakkal and Salem highway corridors, installing 40ft blacktop avenues, underground drainage, and street lighting.',
      badge: 'Growth Era',
    },
    {
      year: '2023',
      title: 'DTCP & RERA Sanctioned Projects',
      subtitle: 'Flagship Namakkal & Paramathi Velur Hubs',
      description:
        'Launched premier layout townships with statutory DTCP and RERA approvals, introducing custom 2BHK, 3BHK, and 4BHK villa construction capabilities for homebuyers.',
      badge: 'Approval Milestone',
    },
    {
      year: '2024',
      title: 'Establishment of Your Choice Properties',
      subtitle: 'Dedicated Customer-Centric Brand',
      description:
        'Formally established Your Choice Properties as a dedicated real-estate brand to deliver plot layouts (Rasi Garden, Kongu Nagar, Kongu Garden) with end-to-end customer support.',
      badge: 'Brand Establishment',
    },
    {
      year: 'Present & Future',
      title: 'Turnkey Luxury Villa & Township Ecosystems',
      subtitle: 'Continued Legacy & Regional Leadership',
      description:
        'Expanding sustainable gated layouts and turn-key custom villa communities across Tamil Nadu with complementary site-visit transport and bank loan assistance.',
      badge: 'Current Vision',
    },
  ];

  const whyItems: WhyChoiceItem[] = contentJson.why_choose_us_items || contentJson.why_choice_items || defaultWhyItems;
  const statsList: StatItem[] = Array.isArray(contentJson.stats_list) ? contentJson.stats_list : [];
  const isStatsVisible = contentJson.stats_visible !== false;
  const activeTimeline: TimelineMilestone[] = contentJson.timeline_milestones?.length > 0 ? contentJson.timeline_milestones : timelineMilestones;

  const labelToIcon: Record<string, string> = {
    'years of experience': 'Award',
    'successful projects': 'Building2',
    'happy customers': 'Users',
    'plots sold': 'Maximize',
    'villas sold': 'Home',
  };

  const statsWithIcons = statsList.map((stat) => ({
    ...stat,
    icon: stat.icon || labelToIcon[stat.label.toLowerCase()] || 'Award',
  }));

  const defaultFounderParagraphs = [
    'Your Choice Properties is led by Thennarasu Sambathkumar, who has more than 13 years of experience in land development, villa construction and residential property sales in Tamil Nadu.',
    'Before starting Your Choice Properties in 2024, he worked for six years as a Director at VIP Housing and Properties and another six years as a Director at MG Properties. This experience helped him understand land selection, layout planning, villa construction and the practical needs of property buyers.',
    'His approach is simple: “We do not just sell plots and houses. We help people find a property that matches their choice, budget and future.”',
  ];

  const founderParagraphs = contentJson.founder_content
    ? contentJson.founder_content.split('\n\n').filter(Boolean)
    : defaultFounderParagraphs;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      <div 
        className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden border border-slate-800 p-6 sm:p-8 shadow-2xl about-hero-card"
        style={contentJson.about_bg_image ? {
          backgroundImage: `url(${contentJson.about_bg_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)'
        }}
      >
        {contentJson.about_bg_image && (
          <div className="absolute inset-0 z-0 about-hero-bg-container hidden">
            <Image
              src={contentJson.about_bg_image}
              alt="About Background"
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

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Company Profile &amp; Integrity
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            {contentJson.about_h1 || 'Your Trusted Real Estate Partner in Namakkal and Paramathi Velur'}
          </h1>

          <div className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed space-y-3 pt-1">
            <p>
              Your Choice Properties was established with a clear commitment: to bring transparency, legal clarity, and structural excellence to residential land and villa development across Namakkal and Paramathi Velur.
            </p>
            <p>
              Every layout in our portfolio—including Rasi Garden, Kongu Nagar, and Kongu Garden—is planned with DTCP/RERA approvals, asphalt road infrastructure, potable water lines, and clear title documentation before being offered to home buyers.
            </p>
          </div>

          {/* Quick Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-900/40">
            <div className="p-3 bg-slate-950/60 border border-emerald-800/40 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-xs block">100% Title Cleared</span>
                <span className="text-[10px] text-slate-400 block">Verified Deed Search</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-emerald-800/40 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
              <Building2 className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-xs block">DTCP &amp; RERA Sanctioned</span>
                <span className="text-[10px] text-slate-400 block">Approved Layouts</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-emerald-800/40 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
              <MapPin className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-xs block">Prime Highway Corridors</span>
                <span className="text-[10px] text-slate-400 block">Namakkal &amp; Velur</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership & Vision Founder Section */}
      <section className="max-w-7xl mx-auto py-8 px-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Founder Image / Emblem Badge */}
          <div className="lg:col-span-4 flex justify-center">
            {contentJson.founder_image ? (
              <div className="relative w-56 h-72 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-xl">
                <Image src={contentJson.founder_image} alt={contentJson.founder_name || 'Thennarasu Sambathkumar'} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-56 h-72 rounded-xl bg-slate-950 border-2 border-amber-500/40 flex flex-col items-center justify-center p-5 text-center space-y-3 shadow-xl">
                {/* Logo with blue curved border ring */}
                <div className="relative w-16 h-16 rounded-full p-[3.5px] bg-gradient-to-br from-[#1da1f2] via-[#0e87d4] to-[#1da1f2] shadow-lg shadow-blue-500/30">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Image src="/logo.png" alt="Your Choice Properties Logo" width={44} height={44} className="w-11 h-11 object-contain" />
                  </div>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">{contentJson.founder_name || 'Thennarasu Sambathkumar'}</h4>
                  <span className="text-[11px] font-bold text-amber-400 block mt-0.5">{contentJson.founder_role || 'Managing Director'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Founder Bio */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" /> Leadership & Vision
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Our Founder</h2>
              <h3 className="text-lg font-semibold text-amber-400 mt-0.5">
                {contentJson.founder_name || 'Thennarasu Sambathkumar'}{' '}
                <span className="text-xs text-slate-400 font-normal">({contentJson.founder_role || 'Managing Director'})</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {founderParagraphs.map((p: string, idx: number) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Founder Quote Card */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 text-xs italic text-amber-300">
              <Quote className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                &ldquo;{contentJson.founder_quote || 'We do not just sell plots and houses. We help people find a property that matches their choice, budget and future.'}&rdquo;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Company Journey & History Timeline Section */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Milestones &amp; History
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Our Journey &amp; Growth Timeline
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Over a decade of hands-on real estate leadership, continuous layout delivery, and satisfied families across Tamil Nadu.
          </p>
        </div>

        <div className="relative border-l-2 border-emerald-800/60 ml-4 sm:ml-8 space-y-6 pl-6 sm:pl-8">
          {activeTimeline.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Connected Year Node Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-950 group-hover:bg-emerald-400 group-hover:scale-125 transition-all duration-300 shadow-md z-10" />

              {/* Timeline Card */}
              <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-2 hover:border-amber-500/40 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-serif font-extrabold text-amber-500 dark:text-amber-400 text-lg sm:text-xl tracking-tight">
                    {item.year}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-white text-base sm:text-lg">{item.title}</h3>
                <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{item.subtitle}</h4>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why We’re the Right Choice Section — Left & Right Visual Split */}
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">Core Advantages</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white mt-0.5">
            {contentJson.why_choice_heading || 'Why We’re the Right Choice'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Visual Highlight Card */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4 group hover:border-amber-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-white leading-snug">
                {contentJson.why_left_title || 'Your Preferred Real Estate Developer'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {contentJson.why_left_desc || 'We combine DTCP regulatory compliance, transparent sub-registrar documentation, and strategic layout locations to protect your capital and build genuine long-term value.'}
              </p>
            </div>

            <div className="relative z-10 space-y-2.5 pt-4 border-t border-slate-800/80">
              {(contentJson.why_left_checklist || [
                '100% Verified Legal Documents',
                'Zero Hidden Fees or Charges',
                'Guided Private Site Visit Transport'
              ]).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual 3D Stacked Card Deck */}
          <WhyChooseUsDeck whyItems={whyItems} />
        </div>
      </section>

      {/* Statistics Section (Only rendered if published/visible) */}
      {isStatsVisible && (
        <StatsSection stats={statsWithIcons} />
      )}

      {/* CTA Section */}
      <SiteVisitCTASection
        heading={contentJson.cta_heading || 'Let Us Help You Find the Right Property'}
        description={
          contentJson.cta_description ||
          'Talk to our team or schedule a visit to one of our projects in Namakkal or Paramathi Velur.'
        }
      />
    </div>
  );
}
