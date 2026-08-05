import React from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import { RedirectsClientManager } from './RedirectsClientManager';
import { SiteSettingRecord } from '../settings/SettingsClientManager';

export const dynamic = 'force-dynamic';

interface RedirectLocationRoute {
  slug: string;
  name: string;
}

interface RedirectProjectRoute {
  slug: string;
  name: string;
  locations?: { slug: string } | null;
}

interface RedirectConfigRoute {
  slug: string;
  name: string;
}

export default async function AdminRedirectsPage() {
  await requireAdmin(['super_admin', 'content_admin']);
  const supabase = await createAdminClient();

  // Fetch all site settings, locations, projects, and property configurations in parallel
  const [settingsRes, locationsRes, projectsRes, configsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('locations').select('slug, name'),
    supabase.from('projects').select('slug, name, locations(slug)'),
    supabase.from('property_configurations').select('slug, name'),
  ]);

  const settings = (settingsRes.data as SiteSettingRecord[]) || [];
  const locations = (locationsRes.data as unknown as RedirectLocationRoute[]) || [];
  const projects = (projectsRes.data as unknown as RedirectProjectRoute[]) || [];
  const configs = (configsRes.data as unknown as RedirectConfigRoute[]) || [];

  // Compile active route paths for selection dropdowns
  const activeRoutes = [
    { path: '/', label: 'Home Page' },
    { path: '/about-us', label: 'About Us' },
    { path: '/contact-us', label: 'Contact Us' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/terms-and-conditions', label: 'Terms & Conditions' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/disclaimer', label: 'Disclaimer' },
  ];

  locations.forEach((loc) => {
    activeRoutes.push({
      path: `/locations/${loc.slug}`,
      label: `Location: ${loc.name}`,
    });
  });

  projects.forEach((p) => {
    // Global project path
    activeRoutes.push({
      path: `/projects/${p.slug}`,
      label: `Project: ${p.name}`,
    });

    // Location-specific nested project path
    const locSlug = p.locations?.slug;
    if (locSlug) {
      activeRoutes.push({
        path: `/locations/${locSlug}/${p.slug}`,
        label: `Nested Project: ${p.name} (in ${locSlug})`,
      });
    }
  });

  configs.forEach((conf) => {
    activeRoutes.push({
      path: `/properties/${conf.slug}`,
      label: `Property Layout: ${conf.name}`,
    });
  });

  return <RedirectsClientManager initialSettings={settings} activeRoutes={activeRoutes} />;
}
