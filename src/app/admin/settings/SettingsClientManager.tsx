'use client';

import React, { useState } from 'react';
import {
  Settings,
  Phone,
  Share2,
  Megaphone,
  Save,
  Star,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveSiteSettingAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';
import { MediaUploader } from '@/components/admin/MediaUploader';

export interface SiteSettingRecord {
  key: string;
  value: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Sub-types for each setting panel
// ─────────────────────────────────────────────
interface TestimonialItem { name: string; location: string; rating?: number; comment?: string; video_url?: string; thumbnail_url?: string }
interface FAQItem { id: string; title: string; content: string }

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Dr. K. Senthil Nathan',
    location: 'Rasi Garden, Namakkal',
    rating: 5,
    comment: 'Purchased a 1,500 Sq.Ft villa plot at Rasi Garden. Clear title documents, instant registration, and top-tier blacktop roads. Highly recommend Your Choice Properties for hassle-free buying.',
  },
  {
    name: 'Mr. P. Subramaniam',
    location: 'Kongu Nagar, Namakkal',
    rating: 5,
    comment: 'Constructed a 3BHK independent villa through their construction team. Excellent floor plan customization, transparent pricing, and finished 15 days ahead of schedule!',
  },
  {
    name: 'Mrs. Jayanthi Viswanathan',
    location: 'Kongu Garden, Paramathi Velur',
    rating: 5,
    comment: 'The free pickup and drop facility for site visits was extremely helpful for our family. Bank housing loan process was completed within 7 working days thanks to their staff.',
  },
];

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

// ─────────────────────────────────────────────
// Helper: parse array from setting record
// ─────────────────────────────────────────────
function parseArray<T>(settings: SiteSettingRecord[], key: string, defaults: T[]): T[] {
  const rec = settings.find((s) => s.key === key)?.value;
  if (Array.isArray(rec) && rec.length > 0) return rec as T[];
  return defaults;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export const SettingsClientManager: React.FC<{ initialSettings: SiteSettingRecord[] }> = ({
  initialSettings,
}) => {
  const { toast } = useToast();

  // ── Contact & Social & Announcement ──────────────────────────────────────
  const contactRec = initialSettings.find((s) => s.key === 'contact_info')?.value || {};
  const socialRec = initialSettings.find((s) => s.key === 'social_links')?.value || {};
  const announcementRec = initialSettings.find((s) => s.key === 'global_announcement')?.value || {};

  const [contactData, setContactData] = useState({
    company_name: String(contactRec.company_name || 'Your Choice Properties'),
    phone: String(contactRec.phone || '+91 98427 22123'),
    whatsapp: String(contactRec.whatsapp || '+919842722123'),
    email: String(contactRec.email || 'info@yourchoiceproperties.in'),
    address: String(contactRec.address || 'Main Road, Namakkal, Tamil Nadu - 637001'),
    map_url: String(contactRec.map_url || ''),
    working_hours: String(contactRec.working_hours || 'Mon - Sun: 9:00 AM - 8:00 PM'),
  });

  const [socialData, setSocialData] = useState({
    facebook: String(socialRec.facebook || 'https://facebook.com/yourchoiceproperties'),
    instagram: String(socialRec.instagram || 'https://instagram.com/yourchoiceproperties'),
    youtube: String(socialRec.youtube || 'https://youtube.com/@yourchoiceproperties'),
  });

  const [announcementData, setAnnouncementData] = useState({
    enabled: announcementRec.enabled !== false,
    running: announcementRec.running !== false,
    message: String(
      announcementRec.message ||
        '✨ DTCP & RERA Approved Residential Plots & Luxury Villas in Namakkal & Paramathi Velur'
    ),
  });

  // ── Save handlers ─────────────────────────────────────────────────────────
  const save = async (key: string, value: unknown, label: string) => {
    const res = await saveSiteSettingAction(key, value as Record<string, unknown>);
    if (res.success) {
      toast({ type: 'success', title: `${label} Saved` });
    } else {
      toast({ type: 'error', title: 'Save Failed', message: res.error });
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => { e.preventDefault(); await save('contact_info', contactData, 'Contact Settings'); };
  const handleSaveSocial = async (e: React.FormEvent) => { e.preventDefault(); await save('social_links', socialData, 'Social Media Links'); };
  const handleSaveAnnouncement = async (e: React.FormEvent) => { e.preventDefault(); await save('global_announcement', announcementData, 'Announcement Bar'); };

  // ─────────────────────────────────────────────────────────────────────────
  // Shared panel header style
  const panelClass = 'p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl';
  const panelTitleClass = 'flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-3';

  return (
    <div className="space-y-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> Global Website Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage contact info, announcement bar, social handles, homepage stats, testimonials, and FAQ.
        </p>
      </div>

      {/* ── Section 1: Contact & Social & Announcement ──────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">Contact & Navigation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact */}
          <form onSubmit={handleSaveContact} className={panelClass}>
            <div className={panelTitleClass}>
              <Phone className="w-4 h-4 text-amber-400" /> Corporate Contact Info
            </div>
            <div>
              <Label required>Company Name</Label>
              <Input value={contactData.company_name} onChange={(e) => setContactData({ ...contactData, company_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Phone Number</Label>
                <Input value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} />
              </div>
              <div>
                <Label required>WhatsApp Number</Label>
                <Input value={contactData.whatsapp} onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })} />
              </div>
            </div>
            <div>
              <Label required>Official Email</Label>
              <Input value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} />
            </div>
            <div>
              <Label required>Office Address</Label>
              <Textarea rows={2} value={contactData.address} onChange={(e) => setContactData({ ...contactData, address: e.target.value })} />
            </div>
            <div>
              <Label>Google Maps URL</Label>
              <Input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={contactData.map_url}
                onChange={(e) => setContactData({ ...contactData, map_url: e.target.value })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Paste the Google Maps link for your office. Visitors will be taken there when clicking the map on the Contact page.</p>
            </div>
            <div>
              <Label required>Working Hours</Label>
              <Input value={contactData.working_hours} onChange={(e) => setContactData({ ...contactData, working_hours: e.target.value })} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gold" size="sm" className="font-bold">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Contact Info
              </Button>
            </div>
          </form>

          <div className="space-y-8">
            {/* Announcement */}
            <form onSubmit={handleSaveAnnouncement} className={panelClass}>
              <div className={panelTitleClass}>
                <Megaphone className="w-4 h-4 text-emerald-400" /> Header Announcement Banner
              </div>
              <div>
                <Label>Banner Enabled</Label>
                <select
                  value={announcementData.enabled ? 'true' : 'false'}
                  onChange={(e) => setAnnouncementData({ ...announcementData, enabled: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="true">Enabled (Visible in top bar)</option>
                  <option value="false">Disabled (Hidden)</option>
                </select>
              </div>
              <div>
                <Label>Scrolling (Running) Text</Label>
                <select
                  value={announcementData.running ? 'true' : 'false'}
                  onChange={(e) => setAnnouncementData({ ...announcementData, running: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="true">Scrolling (Running News Ticker)</option>
                  <option value="false">Static Text (No Scrolling)</option>
                </select>
              </div>
              <div>
                <Label required>Banner Announcement Message</Label>
                <Textarea rows={3} value={announcementData.message} onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="gold" size="sm" className="font-bold">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Announcement Bar
                </Button>
              </div>
            </form>

            {/* Social */}
            <form onSubmit={handleSaveSocial} className={panelClass}>
              <div className={panelTitleClass}>
                <Share2 className="w-4 h-4 text-blue-400" /> Social Media Links
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={socialData.facebook} onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })} />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={socialData.instagram} onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })} />
              </div>
              <div>
                <Label>YouTube Channel URL</Label>
                <Input value={socialData.youtube} onChange={(e) => setSocialData({ ...socialData, youtube: e.target.value })} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="gold" size="sm" className="font-bold">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Social Links
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Testimonials Client Manager
// ─────────────────────────────────────────────
export const TestimonialsClientManager: React.FC<{ initialSettings: SiteSettingRecord[] }> = ({
  initialSettings,
}) => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    parseArray<TestimonialItem>(initialSettings, 'testimonials', DEFAULT_TESTIMONIALS)
  );

  const updateTestimonial = (idx: number, field: keyof TestimonialItem, val: string | number) => {
    setTestimonials((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };
  const addTestimonial = () =>
    setTestimonials((prev) => [...prev, { name: '', location: '', rating: 5, comment: '' }]);
  const removeTestimonial = (idx: number) =>
    setTestimonials((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveSiteSettingAction('testimonials', testimonials);
    if (res.success) {
      toast({ type: 'success', title: 'Testimonials Saved' });
    } else {
      toast({ type: 'error', title: 'Save Failed', message: res.error });
    }
  };

  const panelClass = 'p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl';
  const panelTitleClass = 'flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-3';

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400" /> Client Testimonials
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage testimonials shown in the &quot;Hear From Our Homeowners&quot; section.
        </p>
      </div>

      <form onSubmit={handleSave} className={panelClass}>
        <div className={panelTitleClass}>
          <Star className="w-4 h-4 text-amber-400" /> Testimonials List
        </div>
        <p className="text-xs text-slate-400">Add up to 6 testimonials. Each will appear as a card on the testimonials section.</p>

        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Review #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestimonial(idx)}
                  className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove testimonial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Customer Name</Label>
                  <Input value={t.name} onChange={(e) => updateTestimonial(idx, 'name', e.target.value)} placeholder="Dr. K. Senthil Nathan" />
                </div>
                <div>
                  <Label required>Location / Project</Label>
                  <Input value={t.location} onChange={(e) => updateTestimonial(idx, 'location', e.target.value)} placeholder="Rasi Garden, Namakkal" />
                </div>
              </div>
              <div>
                <Label>Star Rating (1–5)</Label>
                <select
                  value={t.rating}
                  onChange={(e) => updateTestimonial(idx, 'rating', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Video URL (YouTube or MP4 Video Link)</Label>
                <Input
                  value={t.video_url || ''}
                  onChange={(e) => updateTestimonial(idx, 'video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or MP4 link"
                />
              </div>
              <div>
                <MediaUploader
                  label="Testimonial Video Cover / Thumbnail Image"
                  value={t.thumbnail_url || ''}
                  folder="testimonials"
                  onChange={(url) => updateTestimonial(idx, 'thumbnail_url', url)}
                />
              </div>
              <div>
                <Label>Testimonial Text / Caption</Label>
                <Textarea
                  rows={2}
                  value={t.comment || ''}
                  onChange={(e) => updateTestimonial(idx, 'comment', e.target.value)}
                  placeholder="Brief highlight or quote..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={addTestimonial} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </button>
          <Button type="submit" variant="gold" size="sm" className="font-bold">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Testimonials
          </Button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────
// FAQs Client Manager
// ─────────────────────────────────────────────
export const FaqsClientManager: React.FC<{ initialSettings: SiteSettingRecord[] }> = ({
  initialSettings,
}) => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>(
    parseArray<FAQItem>(initialSettings, 'faqs', DEFAULT_FAQS)
  );

  const updateFaq = (idx: number, field: keyof FAQItem, val: string) => {
    setFaqs((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)));
  };
  const addFaq = () =>
    setFaqs((prev) => [...prev, { id: `faq-${Date.now()}`, title: '', content: '' }]);
  const removeFaq = (idx: number) => setFaqs((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveSiteSettingAction('faqs', faqs);
    if (res.success) {
      toast({ type: 'success', title: 'FAQs Saved' });
    } else {
      toast({ type: 'error', title: 'Save Failed', message: res.error });
    }
  };

  const panelClass = 'p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl';
  const panelTitleClass = 'flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-3';

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-400" /> FAQ Section
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage questions and answers shown in the accordion on the Contact Us page.
        </p>
      </div>

      <form onSubmit={handleSave} className={panelClass}>
        <div className={panelTitleClass}>
          <HelpCircle className="w-4 h-4 text-emerald-400" /> FAQ Questions & Answers
        </div>
        <p className="text-xs text-slate-400">Edit existing questions or add new ones.</p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">FAQ #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label required>Question</Label>
                <Input
                  value={faq.title}
                  onChange={(e) => updateFaq(idx, 'title', e.target.value)}
                  placeholder="Are all plots DTCP approved?"
                />
              </div>
              <div>
                <Label required>Answer</Label>
                <Textarea
                  rows={3}
                  value={faq.content}
                  onChange={(e) => updateFaq(idx, 'content', e.target.value)}
                  placeholder="Yes, all our layouts..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={addFaq} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </button>
          <Button type="submit" variant="gold" size="sm" className="font-bold">
            <Save className="w-3.5 h-3.5 mr-1" /> Save FAQs
          </Button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────
// Integrations Client Manager
// ─────────────────────────────────────────────
export const IntegrationsClientManager: React.FC<{ initialSettings: SiteSettingRecord[] }> = ({
  initialSettings,
}) => {
  const { toast } = useToast();
  const integrationsRec = initialSettings.find((s) => s.key === 'integrations')?.value || {};

  const [integrationsData, setIntegrationsData] = useState({
    google_search_console: String(integrationsRec.google_search_console || ''),
    google_analytics: String(integrationsRec.google_analytics || ''),
    google_tag_manager: String(integrationsRec.google_tag_manager || ''),
    facebook_pixel: String(integrationsRec.facebook_pixel || ''),
    microsoft_clarity: String(integrationsRec.microsoft_clarity || ''),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveSiteSettingAction('integrations', integrationsData);
    if (res.success) {
      toast({ type: 'success', title: 'Integrations Saved' });
    } else {
      toast({ type: 'error', title: 'Save Failed', message: res.error });
    }
  };

  const panelClass = 'p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl';
  const panelTitleClass = 'flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-3';

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> SEO & Third-Party Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage Google Search Console, Google Analytics, Google Tag Manager, Meta/Facebook Pixel, and Microsoft Clarity.
        </p>
      </div>

      <form onSubmit={handleSave} className={panelClass}>
        <div className={panelTitleClass}>
          <Settings className="w-4 h-4 text-amber-400" /> Webmasters & Tracking Consoles
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          Paste your external search verification and marketing pixel IDs. The required meta tags and script snippets will be automatically injected into your public pages&apos; header.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Google Search Console Verification ID</Label>
              <Input
                value={integrationsData.google_search_console}
                onChange={(e) => setIntegrationsData({ ...integrationsData, google_search_console: e.target.value })}
                placeholder="e.g., d5B8_Xq12_..."
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">
                Paste only the token ID (e.g. <code>dbleVHecwYXyAykr3Sa_fwf_zPPtDWFvOiefp1pVQWM</code>), or you may paste the full GSC meta tag — the app will extract the verification code automatically.
              </p>
            </div>

            <div>
              <Label>Google Analytics Measurement ID (G- ID)</Label>
              <Input
                value={integrationsData.google_analytics}
                onChange={(e) => setIntegrationsData({ ...integrationsData, google_analytics: e.target.value })}
                placeholder="e.g., G-XXXXXXXXXX"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">
                Paste your standard GA4 stream ID starting with <code>G-</code>.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Google Tag Manager Container ID (GTM- ID)</Label>
              <Input
                value={integrationsData.google_tag_manager}
                onChange={(e) => setIntegrationsData({ ...integrationsData, google_tag_manager: e.target.value })}
                placeholder="e.g., GTM-XXXXXXX"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">
                Paste the container ID starting with <code>GTM-</code>.
              </p>
            </div>

            <div>
              <Label>Facebook Pixel ID</Label>
              <Input
                value={integrationsData.facebook_pixel}
                onChange={(e) => setIntegrationsData({ ...integrationsData, facebook_pixel: e.target.value })}
                placeholder="e.g., 123456789012345"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">
                Paste the numeric Meta/Facebook Pixel identifier.
              </p>
            </div>

            <div>
              <Label>Microsoft Clarity Project ID</Label>
              <Input
                value={integrationsData.microsoft_clarity}
                onChange={(e) => setIntegrationsData({ ...integrationsData, microsoft_clarity: e.target.value })}
                placeholder="e.g., abcdefghij"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">
                Paste your Microsoft Clarity project key/ID.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800/40">
          <Button type="submit" variant="gold" size="sm" className="font-bold">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Integrations
          </Button>
        </div>
      </form>
    </div>
  );
};

