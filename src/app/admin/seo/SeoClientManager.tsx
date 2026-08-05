'use client';

import React, { useState } from 'react';
import {
  Search, Plus, Edit3, Trash2, Eye, EyeOff, Globe, ExternalLink, Link2,
  Map, Bot, BarChart3, CheckCircle2, AlertTriangle, Info,
} from 'lucide-react';
import { SEOMetadata } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { saveSeoMetadataAction, deleteSeoMetadataAction, saveRobotsConfigAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';
import { siteConfig } from '@/config/site';
import { STATIC_PAGES } from '@/config/static-pages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EntityOption { id: string; name: string; slug: string; projectName?: string }

interface Props {
  initialSeoRecords: SEOMetadata[];
  locations: EntityOption[];
  projects: EntityOption[];
  configurations: EntityOption[];
  initialRobotsConfig: string;
}

const ENTITY_TYPES = [
  { value: 'page',          label: '📄 Static Page',    hasEntities: true,  urlPrefix: '' },
  { value: 'location',      label: '📍 Location',        hasEntities: true,  urlPrefix: '/locations/' },
  { value: 'project',       label: '🏗️ Project',         hasEntities: true,  urlPrefix: '/projects/' },
  { value: 'configuration', label: '🏠 Property',        hasEntities: true,  urlPrefix: '/properties/' },
] as const;

const CHANGE_FREQ_OPTIONS = ['always','hourly','daily','weekly','monthly','yearly','never'];
const PRIORITY_OPTIONS = [
  { value: '1.0', label: '1.0 — Highest' },
  { value: '0.9', label: '0.9 — Very High' },
  { value: '0.8', label: '0.8 — High' },
  { value: '0.7', label: '0.7 — Medium-High' },
  { value: '0.6', label: '0.6 — Medium' },
  { value: '0.5', label: '0.5 — Default' },
  { value: '0.4', label: '0.4 — Medium-Low' },
  { value: '0.3', label: '0.3 — Low' },
  { value: '0.2', label: '0.2 — Very Low' },
  { value: '0.1', label: '0.1 — Minimal' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len > max ? 'text-red-400' : len > max * 0.85 ? 'text-amber-400' : 'text-slate-500';
  return <span className={`text-xs font-mono ml-auto ${color}`}>{len}/{max}</span>;
}

function GooglePreview({ title, description, url }: { title: string; description: string; url?: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 space-y-2">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <Eye className="w-3 h-3" /> Google Search Preview
      </p>
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-0.5">
        <p className="text-xs text-[#006621] truncate font-sans">
          {(url || 'yoursite.com').replace(/^https?:\/\//, '')}
        </p>
        <p className="text-[17px] text-[#1a0dab] leading-tight truncate font-sans hover:underline cursor-pointer">
          {(title || 'Page Title').slice(0, 60)}{(title || '').length > 60 && '…'}
        </p>
        <p className="text-sm text-[#545454] font-sans leading-snug line-clamp-2">
          {(description || 'Meta description will appear here…').slice(0, 160)}{(description || '').length > 160 && '…'}
        </p>
      </div>
    </div>
  );
}

// ─── Default form state ───────────────────────────────────────────────────────

const defaultForm = {
  entity_type: 'page', entity_id: '',
  meta_title: '', meta_description: '', canonical_url: '',
  open_graph_title: '', open_graph_description: '', open_graph_image_path: '',
  index_enabled: true, json_ld_override: '',
  sitemap_priority: '', sitemap_change_frequency: '',
  meta_keywords: '',
  robots_directives: 'index, follow',
  og_type: 'website',
  twitter_card: 'summary_large_image',
  focus_keyword: '',
  redirect_url: '',
  redirect_type: 301,
  open_graph_image_alt: '',
  custom_tracking_script: '',
};

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = 'seo' | 'sitemap' | 'robots';

const SCHEMA_TEMPLATES = [
  {
    name: '🏢 Real Estate Agency / Agent',
    template: {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Your Choice Properties",
      "image": "https://yourchoiceproperties.in/logo.png",
      "telephone": "+91 98427 22123",
      "email": "info@yourchoiceproperties.in",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Main Road",
        "addressLocality": "Namakkal",
        "addressRegion": "TN",
        "postalCode": "637001",
        "addressCountry": "IN"
      }
    }
  },
  {
    name: '🏘️ Residential Community (Gated Community)',
    template: {
      "@context": "https://schema.org",
      "@type": "ResidencesConsideration",
      "name": "Kongu Garden Gated Community",
      "description": "Premium residential gated layout plots in Paramathi Velur",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Paramathi Velur",
        "addressCountry": "IN"
      }
    }
  },
  {
    name: '❓ FAQ Page Structured Data',
    template: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are your plots DTCP approved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, all our residential layouts are DTCP-approved gated communities with clear title documents."
          }
        }
      ]
    }
  },
  {
    name: '🍞 Breadcrumb navigation list',
    template: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://yourchoiceproperties.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Properties",
          "item": "https://yourchoiceproperties.in/properties"
        }
      ]
    }
  }
];

interface SeoCheckResult {
  label: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

type SeoFormData = typeof defaultForm;

function auditSeoState(formData: SeoFormData): { score: number; checks: SeoCheckResult[] } {
  let score = 100;
  const checks: SeoCheckResult[] = [];
  const focus = formData.focus_keyword.trim().toLowerCase();

  // 1. Title Check
  const titleLen = formData.meta_title.length;
  if (titleLen === 0) {
    score -= 25;
    checks.push({ label: 'Meta Title', passed: false, message: 'Meta title is required.', severity: 'error' });
  } else if (titleLen > 60) {
    score -= 10;
    checks.push({ label: 'Meta Title Length', passed: false, message: 'Too long (over 60 chars) - will truncate.', severity: 'warning' });
  } else if (titleLen < 35) {
    score -= 8;
    checks.push({ label: 'Meta Title Length', passed: false, message: 'Too short (under 35 chars) - under-optimized.', severity: 'warning' });
  } else {
    checks.push({ label: 'Meta Title Length', passed: true, message: 'Optimal title length (35-60 chars).', severity: 'success' });
  }

  // 2. Description Check
  const descLen = formData.meta_description.length;
  if (descLen === 0) {
    score -= 25;
    checks.push({ label: 'Meta Description', passed: false, message: 'Meta description is required.', severity: 'error' });
  } else if (descLen > 160) {
    score -= 10;
    checks.push({ label: 'Meta Description Length', passed: false, message: 'Too long (over 160 chars) - will truncate.', severity: 'warning' });
  } else if (descLen < 100) {
    score -= 8;
    checks.push({ label: 'Meta Description Length', passed: false, message: 'Too short (under 100 chars) - under-optimized.', severity: 'warning' });
  } else {
    checks.push({ label: 'Meta Description Length', passed: true, message: 'Optimal description length (100-160 chars).', severity: 'success' });
  }

  // 3. Focus Keyword checks
  if (!focus) {
    score -= 10;
    checks.push({ label: 'Focus Keyword', passed: false, message: 'Enter a target keyword to audit content density.', severity: 'info' });
  } else {
    // Focus Keyword in Title
    const hasInTitle = formData.meta_title.toLowerCase().includes(focus);
    if (!hasInTitle) {
      score -= 15;
      checks.push({ label: 'Keyword in Title', passed: false, message: `Focus keyword "${formData.focus_keyword}" not found in title.`, severity: 'warning' });
    } else {
      checks.push({ label: 'Keyword in Title', passed: true, message: 'Focus keyword found in Meta Title!', severity: 'success' });
    }

    // Focus Keyword in Description
    const hasInDesc = formData.meta_description.toLowerCase().includes(focus);
    if (!hasInDesc) {
      score -= 15;
      checks.push({ label: 'Keyword in Description', passed: false, message: `Focus keyword "${formData.focus_keyword}" not found in description.`, severity: 'warning' });
    } else {
      checks.push({ label: 'Keyword in Description', passed: true, message: 'Focus keyword found in Meta Description!', severity: 'success' });
    }
  }

  // 4. Canonical URL
  if (!formData.canonical_url.trim()) {
    score -= 5;
    checks.push({ label: 'Canonical URL', passed: false, message: 'Missing canonical URL link.', severity: 'warning' });
  } else {
    checks.push({ label: 'Canonical URL', passed: true, message: 'Canonical link defined.', severity: 'success' });
  }

  // 5. Open Graph Image
  if (!formData.open_graph_image_path.trim()) {
    score -= 10;
    checks.push({ label: 'Social OG Image', passed: false, message: 'Missing OG sharing image. Default fallback will be used.', severity: 'warning' });
  } else {
    checks.push({ label: 'Social OG Image', passed: true, message: 'Custom OG sharing image configured.', severity: 'success' });
  }

  // 6. JSON-LD Structured Data
  if (!formData.json_ld_override.trim()) {
    checks.push({ label: 'Structured Data', passed: true, message: 'No custom JSON-LD override (fallback page schema used).', severity: 'info' });
  } else {
    checks.push({ label: 'Structured Data', passed: true, message: 'Custom JSON-LD schema defined.', severity: 'success' });
  }

  return { score: Math.max(0, score), checks };
}

// ─── Main component ───────────────────────────────────────────────────────────

export const SeoClientManager: React.FC<Props> = ({
  initialSeoRecords, locations, projects, configurations, initialRobotsConfig,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('seo');
  const [seoRecords, setSeoRecords] = useState<SEOMetadata[]>(initialSeoRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SEOMetadata | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SEOMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [formData, setFormData] = useState(defaultForm);

  // Robots state
  const [robotsJson, setRobotsJson] = useState(initialRobotsConfig);
  const [robotsError, setRobotsError] = useState('');
  const [isSavingRobots, setIsSavingRobots] = useState(false);

  const patch = (key: string, value: string | boolean | number) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const entityTypeConfig = ENTITY_TYPES.find((t) => t.value === formData.entity_type)!;
  const entityOptions: EntityOption[] = (() => {
    switch (formData.entity_type) {
      case 'page': return STATIC_PAGES.map((p) => ({ id: p.key, name: p.label, slug: p.path }));
      case 'location': return locations;
      case 'project': return projects;
      case 'configuration': return configurations;
      default: return [];
    }
  })();
  const selectedEntity = entityOptions.find((e) => e.id === formData.entity_id) ?? null;

  const handleEntityTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev, entity_type: type, entity_id: '',
      canonical_url: type === 'page' ? siteConfig.domain : '',
    }));
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({ ...defaultForm, canonical_url: siteConfig.domain });
    setJsonError('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (rec: SEOMetadata) => {
    setEditingRecord(rec);
    setFormData({
      entity_type: rec.entity_type || 'page',
      entity_id: rec.entity_id || '',
      meta_title: rec.meta_title || '',
      meta_description: rec.meta_description || '',
      canonical_url: rec.canonical_url || '',
      open_graph_title: rec.open_graph_title || '',
      open_graph_description: rec.open_graph_description || '',
      open_graph_image_path: rec.open_graph_image_path || '',
      index_enabled: rec.index_enabled ?? true,
      json_ld_override: rec.json_ld_override ? JSON.stringify(rec.json_ld_override, null, 2) : '',
      sitemap_priority: rec.sitemap_priority != null ? String(rec.sitemap_priority) : '',
      sitemap_change_frequency: rec.sitemap_change_frequency || '',
      meta_keywords: rec.meta_keywords || '',
      robots_directives: rec.robots_directives || 'index, follow',
      og_type: rec.og_type || 'website',
      twitter_card: rec.twitter_card || 'summary_large_image',
      focus_keyword: rec.focus_keyword || '',
      redirect_url: rec.redirect_url || '',
      redirect_type: rec.redirect_type || 301,
      open_graph_image_alt: rec.open_graph_image_alt || '',
      custom_tracking_script: rec.custom_tracking_script || '',
    });
    setJsonError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.json_ld_override.trim()) {
      try { JSON.parse(formData.json_ld_override); setJsonError(''); }
      catch { setJsonError('Invalid JSON — please fix before saving.'); return; }
    }
    setIsSaving(true);
    const payload: Record<string, unknown> = {
      ...formData,
      entity_id: formData.entity_id || null,
      json_ld_override: formData.json_ld_override.trim() ? JSON.parse(formData.json_ld_override) : null,
      sitemap_priority: formData.sitemap_priority ? parseFloat(formData.sitemap_priority) : null,
      sitemap_change_frequency: formData.sitemap_change_frequency || null,
      redirect_type: formData.redirect_url ? parseInt(String(formData.redirect_type)) : 301,
      redirect_url: formData.redirect_url.trim() || null,
      open_graph_image_alt: formData.open_graph_image_alt.trim() || null,
      custom_tracking_script: formData.custom_tracking_script.trim() || null,
    };
    const res = await saveSeoMetadataAction(payload, editingRecord?.id);
    setIsSaving(false);
    if (res.success) {
      toast({ type: 'success', title: 'SEO Record Saved & Cache Cleared' });
      setIsDialogOpen(false);
      window.location.reload();
    } else {
      toast({ type: 'error', title: 'Error Saving SEO', message: res.error });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteSeoMetadataAction(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (res.success) {
      toast({ type: 'success', title: 'SEO Record Deleted' });
      setSeoRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } else {
      toast({ type: 'error', title: 'Delete Failed', message: res.error });
    }
  };

  const handleSaveRobots = async () => {
    try { JSON.parse(robotsJson); setRobotsError(''); }
    catch { setRobotsError('Invalid JSON — fix before saving.'); return; }
    setIsSavingRobots(true);
    const res = await saveRobotsConfigAction(robotsJson);
    setIsSavingRobots(false);
    if (res.success) toast({ type: 'success', title: 'Robots.txt Updated' });
    else toast({ type: 'error', title: 'Save Failed', message: res.error });
  };

  const previewUrl = formData.canonical_url ||
    (selectedEntity ? `${siteConfig.domain}${entityTypeConfig.urlPrefix}${selectedEntity.slug}` : siteConfig.domain);

  const { score, checks } = auditSeoState(formData);

  // ─── Tab bar ───────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'seo',     label: 'SEO Records',    icon: <Search className="w-4 h-4" /> },
    { id: 'sitemap', label: 'Sitemap Status',  icon: <Map className="w-4 h-4" /> },
    { id: 'robots',  label: 'Robots.txt',      icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-400" /> SEO & Technical Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta tags · OpenGraph · Structured data · Sitemap · Robots.txt
          </p>
        </div>
        {activeTab === 'seo' && (
          <Button variant="gold" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" /> Add SEO Override
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: SEO Records ══════════════ */}
      {activeTab === 'seo' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Records',     value: seoRecords.length },
              { label: 'Indexing Enabled',  value: seoRecords.filter((r) => r.index_enabled).length },
              { label: 'Has OG Image',      value: seoRecords.filter((r) => r.open_graph_image_path).length },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-400">{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 uppercase text-[10px] font-bold text-slate-400">
                  <tr>
                    <th className="p-4">Entity Type</th>
                    <th className="p-4">Linked Entity</th>
                    <th className="p-4">Meta Title</th>
                    <th className="p-4">Meta Description</th>
                    <th className="p-4 text-center">Index</th>
                    <th className="p-4 text-center">Sitemap</th>
                    <th className="p-4 text-center">OG</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {seoRecords.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500">No SEO records yet. Click &ldquo;Add SEO Override&rdquo; to get started.</td></tr>
                  )}
                  {seoRecords.map((rec) => {
                    const linkedName = (() => {
                      if (!rec.entity_id) return null;
                      if (rec.entity_type === 'page') {
                        const sp = STATIC_PAGES.find((p) => p.key === rec.entity_id);
                        return sp ? sp.label : rec.entity_id;
                      }
                      const loc = locations.find((l) => l.id === rec.entity_id);
                      if (loc) return loc.name;
                      const proj = projects.find((p) => p.id === rec.entity_id);
                      if (proj) return proj.name;
                      const cfg = configurations.find((c) => c.id === rec.entity_id);
                      if (cfg) return `${cfg.name}${cfg.projectName ? ` (${cfg.projectName})` : ''}`;
                      return rec.entity_id.slice(0, 8) + '…';
                    })();
                    return (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-400">{rec.entity_type}</td>
                        <td className="p-4 max-w-[140px]">
                          {linkedName
                            ? <span className="flex items-center gap-1 text-slate-300 truncate"><Link2 className="w-3 h-3 shrink-0 text-blue-400" />{linkedName}</span>
                            : <span className="text-slate-600 italic">global</span>}
                        </td>
                        <td className="p-4 font-bold text-white max-w-[160px] truncate">{rec.meta_title}</td>
                        <td className="p-4 max-w-[200px] truncate text-slate-400">{rec.meta_description}</td>
                        <td className="p-4 text-center">
                          {rec.index_enabled
                            ? <Globe className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                            : <EyeOff className="w-3.5 h-3.5 text-red-400 mx-auto" />}
                        </td>
                        <td className="p-4 text-center">
                          {rec.sitemap_priority != null || rec.sitemap_change_frequency
                            ? <BarChart3 className="w-3.5 h-3.5 text-purple-400 mx-auto" />
                            : <span className="text-slate-700">—</span>}
                        </td>
                        <td className="p-4 text-center">
                          {rec.open_graph_image_path
                            ? <ExternalLink className="w-3.5 h-3.5 text-blue-400 mx-auto" />
                            : <span className="text-slate-700">—</span>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleOpenEdit(rec)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(rec)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ TAB: Sitemap Status ══════════════ */}
      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-amber-300 mb-1">How sitemap overrides work</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each SEO record linked to a location, project, or property controls that URL&apos;s sitemap entry.
              Set <strong className="text-slate-300">sitemap priority</strong> (0.0–1.0) and{' '}
              <strong className="text-slate-300">change frequency</strong> per entity in the SEO Records tab.
              Setting <strong className="text-slate-300">Search Engine Indexing = OFF</strong> will exclude
              that URL from the sitemap entirely.
            </p>
          </div>

          {/* Sitemap overview table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">Current Sitemap Overrides</p>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View sitemap.xml
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 uppercase text-[10px] font-bold text-slate-400">
                  <tr>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">In Sitemap</th>
                    <th className="p-4 text-center">Priority Override</th>
                    <th className="p-4 text-center">Frequency Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {seoRecords.filter((r) => r.entity_id).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No entity-level overrides yet. Add an SEO record linked to a project/location/property to override its sitemap settings.
                      </td>
                    </tr>
                  )}
                  {seoRecords
                    .filter((r) => r.entity_id)
                    .map((rec) => {
                      const name = (() => {
                        const loc = locations.find((l) => l.id === rec.entity_id);
                        if (loc) return loc.name;
                        const proj = projects.find((p) => p.id === rec.entity_id);
                        if (proj) return proj.name;
                        const cfg = configurations.find((c) => c.id === rec.entity_id);
                        return cfg ? cfg.name : rec.entity_id?.slice(0, 8) + '…';
                      })();
                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-medium text-slate-200">{name}</td>
                          <td className="p-4 font-mono text-amber-400 text-[11px]">{rec.entity_type}</td>
                          <td className="p-4 text-center">
                            {rec.index_enabled
                              ? <span className="text-emerald-400 text-xs font-medium">✓ Yes</span>
                              : <span className="text-red-400 text-xs font-medium">✗ Excluded</span>}
                          </td>
                          <td className="p-4 text-center text-slate-300">
                            {rec.sitemap_priority != null ? rec.sitemap_priority : <span className="text-slate-600">default</span>}
                          </td>
                          <td className="p-4 text-center text-slate-300">
                            {rec.sitemap_change_frequency || <span className="text-slate-600">default</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Default values reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Values (when no override)</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { type: 'Location',      freq: 'weekly',  priority: '0.8' },
                { type: 'Project',       freq: 'daily',   priority: '0.9' },
                { type: 'Property',      freq: 'weekly',  priority: '0.8' },
              ].map((row) => (
                <div key={row.type} className="bg-slate-950 rounded-lg p-3">
                  <p className="font-semibold text-amber-400 mb-1">{row.type}</p>
                  <p className="text-slate-400">Priority: <span className="text-slate-200">{row.priority}</span></p>
                  <p className="text-slate-400">Frequency: <span className="text-slate-200">{row.freq}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Robots.txt ══════════════ */}
      {activeTab === 'robots' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-sm font-semibold text-blue-300 mb-1">Dynamic Robots.txt</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edit the JSON array below to control what search engine bots can and cannot crawl.
              Each object specifies a <code className="text-blue-300">userAgent</code>, optional{' '}
              <code className="text-blue-300">allow</code> paths, and{' '}
              <code className="text-blue-300">disallow</code> paths.
              Changes take effect at <a href="/robots.txt" target="_blank" rel="noreferrer"
                className="text-blue-400 underline">/robots.txt</a> immediately after saving.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-3">
              <Label>Rules JSON</Label>
              <Textarea
                rows={18}
                value={robotsJson}
                onChange={(e) => { setRobotsJson(e.target.value); setRobotsError(''); }}
                className="font-mono text-xs"
                placeholder={`[\n  {\n    "userAgent": "*",\n    "allow": ["/"],\n    "disallow": ["/admin/", "/api/"]\n  }\n]`}
              />
              {robotsError && <p className="text-xs text-red-400">⚠ {robotsError}</p>}
              <div className="flex gap-3">
                <Button variant="gold" size="sm" onClick={handleSaveRobots} isLoading={isSavingRobots}>
                  Save Robots.txt
                </Button>
                <a href="/robots.txt" target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                  </Button>
                </a>
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-3">
              <Label>Schema Reference</Label>
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-3">
                <p className="text-slate-500 not-italic font-sans text-[11px] uppercase tracking-wider mb-2">Example structure</p>
                <pre className="whitespace-pre-wrap text-emerald-400">{`[
  {
    "userAgent": "*",
    "allow": ["/"],
    "disallow": [
      "/admin/",
      "/api/"
    ]
  },
  {
    "userAgent": "Googlebot",
    "allow": ["/"],
    "disallow": []
  }
]`}</pre>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Common user-agents</p>
                {['* (all bots)', 'Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp (Yahoo)'].map((b) => (
                  <p key={b} className="flex items-center gap-2">
                    <Bot className="w-3 h-3 text-slate-600" /> {b}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editingRecord ? 'Edit SEO Entry' : 'Add SEO Entry'}
        className="max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Input Forms */}
            <div className="lg:col-span-7 space-y-4 overflow-y-auto max-h-[70vh] pr-3">
              {/* Step 1: Target Entity */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1 · Target Entity</p>
                <div className="grid grid-cols-2 gap-2">
                  {ENTITY_TYPES.map((et) => (
                    <button key={et.value} type="button" onClick={() => handleEntityTypeChange(et.value)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                        formData.entity_type === et.value
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                      }`}>{et.label}</button>
                  ))}
                </div>
                {entityTypeConfig.hasEntities && (
                  <div>
                    <Label required>
                      {formData.entity_type === 'page' ? 'Select Static Page'
                        : formData.entity_type === 'location' ? 'Select Location'
                        : formData.entity_type === 'project' ? 'Select Project'
                        : 'Select Property'}
                    </Label>
                    <select
                      value={formData.entity_id}
                      onChange={(e) => {
                        const entityId = e.target.value;
                        const entity = entityOptions.find((option) => option.id === entityId);
                        setFormData((prev) => ({
                          ...prev,
                          entity_id: entityId,
                          canonical_url: !editingRecord && entity
                            ? `${siteConfig.domain}${entityTypeConfig.urlPrefix}${entity.slug}`
                            : prev.canonical_url,
                        }));
                      }}
                      required
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="" disabled>— pick one —</option>
                      {entityOptions.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-slate-900">
                          {opt.name}{opt.projectName ? ` — ${opt.projectName}` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedEntity && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-blue-400">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {siteConfig.domain}{entityTypeConfig.urlPrefix}{selectedEntity.slug}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Target Keywords */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2 · Target Focus Keywords</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Primary Focus Keyword</Label>
                    <Input
                      value={formData.focus_keyword}
                      onChange={(e) => patch('focus_keyword', e.target.value)}
                      placeholder="e.g., plots in namakkal"
                    />
                  </div>
                  <div>
                    <Label>Meta Keywords (comma-separated)</Label>
                    <Input
                      value={formData.meta_keywords}
                      onChange={(e) => patch('meta_keywords', e.target.value)}
                      placeholder="plots, villas, namakkal, properties"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Meta Tags */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3 · HTML Meta Tags</p>
                <div>
                  <div className="flex items-center mb-1"><Label required>Meta Title</Label><CharCounter value={formData.meta_title} max={60} /></div>
                  <Input required value={formData.meta_title} onChange={(e) => patch('meta_title', e.target.value)} placeholder="Page Title | Your Choice Properties" />
                  {formData.meta_title.length > 60 && <p className="text-xs text-red-400 mt-1">Meta title exceeds 60 characters (truncates in SERPs)</p>}
                </div>
                <div>
                  <div className="flex items-center mb-1"><Label required>Meta Description</Label><CharCounter value={formData.meta_description} max={160} /></div>
                  <Textarea required rows={3} value={formData.meta_description} onChange={(e) => patch('meta_description', e.target.value)} placeholder="Enter page meta description…" />
                  {formData.meta_description.length > 160 && <p className="text-xs text-red-400 mt-1">Meta description exceeds 160 characters (truncates in SERPs)</p>}
                </div>
                <div>
                  <Label>Canonical URL</Label>
                  <Input value={formData.canonical_url} onChange={(e) => patch('canonical_url', e.target.value)} placeholder="https://yoursite.com/page" />
                </div>
              </div>

              {/* Step 4: OpenGraph / Social Sharing */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">4 · Social Graphs (OG & Twitter)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>OG Share Card Type</Label>
                    <select value={formData.og_type} onChange={(e) => patch('og_type', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="website">website (standard pages)</option>
                      <option value="article">article (blogs, updates)</option>
                      <option value="product">product (configs, plots)</option>
                      <option value="realestate.property">realestate.property (villas)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Twitter Card Layout</Label>
                    <select value={formData.twitter_card} onChange={(e) => patch('twitter_card', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="summary">Summary Card (small thumbnail)</option>
                      <option value="summary_large_image">Summary Large Image (rich banner)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1"><Label>OG Title</Label><CharCounter value={formData.open_graph_title} max={60} /></div>
                  <Input value={formData.open_graph_title} onChange={(e) => patch('open_graph_title', e.target.value)} placeholder="Defaults to meta title" />
                </div>
                <div>
                  <div className="flex items-center mb-1"><Label>OG Description</Label><CharCounter value={formData.open_graph_description} max={160} /></div>
                  <Textarea rows={2} value={formData.open_graph_description} onChange={(e) => patch('open_graph_description', e.target.value)} placeholder="Defaults to meta description" />
                </div>
                <div>
                  <Label>OG Image Path / URL</Label>
                  <Input value={formData.open_graph_image_path} onChange={(e) => patch('open_graph_image_path', e.target.value)} placeholder="/og-image.jpg or full URL" />
                  <p className="text-[11px] text-slate-500 mt-1">Recommended: 1200×630 pixels</p>
                </div>
                <div>
                  <Label>OG Image Alt Text (for accessibility)</Label>
                  <Input value={formData.open_graph_image_alt} onChange={(e) => patch('open_graph_image_alt', e.target.value)} placeholder="Describe the image contents for bots and screen readers" />
                </div>
              </div>

              {/* Step 5: Sitemap Settings */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5 · XML Sitemap Settings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority Override</Label>
                    <select value={formData.sitemap_priority} onChange={(e) => patch('sitemap_priority', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="">Use default</option>
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Change Frequency Override</Label>
                    <select value={formData.sitemap_change_frequency} onChange={(e) => patch('sitemap_change_frequency', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="">Use default</option>
                      {CHANGE_FREQ_OPTIONS.map((f) => (
                        <option key={f} value={f} className="bg-slate-900 capitalize">{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 6: Advanced Robots Rules */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">6 · Search Engine Robots Meta Rules</p>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  {[
                    { value: 'noindex', label: 'No-Index (Hide from Google Search)' },
                    { value: 'nofollow', label: 'No-Follow (Do not trace links)' },
                    { value: 'noarchive', label: 'No-Archive (Prevent cached pages)' },
                    { value: 'nosnippet', label: 'No-Snippet (Hide search preview description)' },
                  ].map((directive) => {
                    const isChecked = formData.robots_directives.includes(directive.value);
                    return (
                      <label key={directive.value} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const directivesArray = formData.robots_directives
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            let updated;
                            if (e.target.checked) {
                              updated = [...directivesArray, directive.value];
                            } else {
                              updated = directivesArray.filter((d) => d !== directive.value);
                            }
                            if (e.target.checked && directive.value === 'noindex') {
                              updated = updated.filter((d) => d !== 'index');
                            }
                            if (e.target.checked && directive.value === 'nofollow') {
                              updated = updated.filter((d) => d !== 'follow');
                            }
                            if (updated.length === 0) updated = ['index', 'follow'];
                            patch('robots_directives', updated.join(', '));
                          }}
                          className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                        />
                        <span>{directive.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 7: Structured Data (JSON-LD) with templates selector */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7 · Structured Schema (JSON-LD)</p>
                <div>
                  <Label>Schema Boilerplate Templates</Label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = SCHEMA_TEMPLATES.find((t) => t.name === e.target.value);
                      if (selected) {
                        patch('json_ld_override', JSON.stringify(selected.template, null, 2));
                      }
                    }}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="">— pick schema layout to auto-fill —</option>
                    {SCHEMA_TEMPLATES.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>JSON-LD Structured Data Code (optional)</Label>
                  <Textarea rows={5} value={formData.json_ld_override}
                    onChange={(e) => { patch('json_ld_override', e.target.value); setJsonError(''); }}
                    placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'} className="font-mono text-xs" />
                  {jsonError && <p className="text-xs text-red-400 mt-1">⚠ {jsonError}</p>}
                </div>
              </div>

              {/* Step 8: Redirection */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">8 · Page URL Redirection</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label>Destination Redirect URL</Label>
                    <Input
                      value={formData.redirect_url}
                      onChange={(e) => patch('redirect_url', e.target.value)}
                      placeholder="e.g., /projects/new-project or absolute URL"
                    />
                  </div>
                  <div>
                    <Label>Redirect Status</Label>
                    <select value={formData.redirect_type} onChange={(e) => patch('redirect_type', parseInt(e.target.value))}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors">
                      <option value="301">301 (Permanent)</option>
                      <option value="302">302 (Temporary)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">Redirects help pass rank when villas sell out or layouts are renamed.</p>
              </div>

              {/* Step 9: Tracking Pixels */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">9 · Page-Specific Analytics Script (Custom Pixel)</p>
                <div>
                  <Label>Facebook Pixel / GA Custom Conversion Script</Label>
                  <Textarea
                    rows={4}
                    value={formData.custom_tracking_script}
                    onChange={(e) => patch('custom_tracking_script', e.target.value)}
                    placeholder="<!-- Enter custom JS script/iframe code that will run only on this landing page -->"
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Paste HTML tag codes here (e.g. Facebook pixel base tag / custom conversion event codes).</p>
                </div>
              </div>
            </div>

            {/* Right Column: SEO Previews & Live Score Checks */}
            <div className="lg:col-span-5 space-y-4">
              <GooglePreview
                title={formData.open_graph_title || formData.meta_title}
                description={formData.open_graph_description || formData.meta_description}
                url={previewUrl}
              />

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-500" /> Live SEO Audit Score
                  </span>
                  <span className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded-full ${
                    score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {score}/100
                  </span>
                </div>

                {/* Score progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className={`h-full transition-all duration-300 ${
                    score >= 80 ? 'bg-emerald-500'
                    : score >= 50 ? 'bg-amber-500'
                    : 'bg-red-500'
                  }`} style={{ width: `${score}%` }}></div>
                </div>

                {/* Checks Checklist */}
                <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                  {checks.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0">
                        {c.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : c.severity === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : c.severity === 'info' ? (
                          <Info className="w-4 h-4 text-blue-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-200 block leading-tight">{c.label}</span>
                        <span className="text-[10px] text-slate-400 leading-normal">{c.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold" size="md" isLoading={isSaving}>
              {editingRecord ? 'Update SEO Record' : 'Create SEO Record'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete SEO Record"
        message={`This will permanently remove the SEO override for "${deleteTarget?.entity_type}". The page will fall back to its default metadata.`}
        confirmLabel="Delete"
      />
    </div>
  );
};
