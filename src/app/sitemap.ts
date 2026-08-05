import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import {
  getPublishedLocations,
  getPublishedProjects,
  getPublishedConfigurations,
} from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { SEOMetadata } from '@/types/database';

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

/** Fetch all seo_metadata rows that have an entity_id (i.e. per-entity overrides). */
async function getSitemapOverrides(): Promise<Map<string, SEOMetadata>> {
  try {
    const supabase = await createClient();
    const result = await supabase
      .from('seo_metadata')
      .select('entity_id, index_enabled, sitemap_priority, sitemap_change_frequency')
      .not('entity_id', 'is', null);

    const rows = (result.data ?? []) as Array<Pick<SEOMetadata, 'entity_id' | 'index_enabled' | 'sitemap_priority' | 'sitemap_change_frequency'>>;
    const map = new Map<string, SEOMetadata>();
    for (const row of rows) {
      if (row.entity_id) map.set(row.entity_id, row as SEOMetadata);
    }
    return map;
  } catch {
    return new Map();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.domain;

  // Static routes — defaults, overridable via SEO records
  const staticRouteDefaults: Array<{ key: string; url: string; changeFrequency: ChangeFreq; priority: number }> = [
    { key: 'home', url: `${baseUrl}`, changeFrequency: 'daily', priority: 1.0 },
    { key: 'locations', url: `${baseUrl}/locations`, changeFrequency: 'weekly', priority: 0.9 },
    { key: 'projects', url: `${baseUrl}/projects`, changeFrequency: 'daily', priority: 0.9 },
    { key: 'properties', url: `${baseUrl}/properties`, changeFrequency: 'daily', priority: 0.9 },
    { key: 'plots-for-sale-in-namakkal', url: `${baseUrl}/plots-for-sale-in-namakkal`, changeFrequency: 'daily', priority: 0.9 },
    { key: 'dtcp-approved-plots-in-paramathi-velur', url: `${baseUrl}/dtcp-approved-plots-in-paramathi-velur`, changeFrequency: 'daily', priority: 0.9 },
    { key: 'villas-for-sale-in-namakkal', url: `${baseUrl}/villas-for-sale-in-namakkal`, changeFrequency: 'daily', priority: 0.9 },
    { key: 'about-us', url: `${baseUrl}/about-us`, changeFrequency: 'monthly', priority: 0.7 },
    { key: 'services', url: `${baseUrl}/services`, changeFrequency: 'monthly', priority: 0.7 },
    { key: 'gallery', url: `${baseUrl}/gallery`, changeFrequency: 'weekly', priority: 0.7 },
    { key: 'contact-us', url: `${baseUrl}/contact-us`, changeFrequency: 'monthly', priority: 0.8 },
    { key: 'privacy-policy', url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { key: 'terms-and-conditions', url: `${baseUrl}/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [locations, projects, properties, overrides] = await Promise.all([
    getPublishedLocations(),
    getPublishedProjects(),
    getPublishedConfigurations(),
    getSitemapOverrides(),
  ]);

  // Helper: apply DB override for priority/frequency, skip if index_enabled=false
  function applyOverride(
    entityId: string,
    defaults: { changeFrequency: ChangeFreq; priority: number },
    lastModified: Date,
    url: string,
  ): MetadataRoute.Sitemap[number] | null {
    const ov = overrides.get(entityId);
    // Excluded by admin
    if (ov && ov.index_enabled === false) return null;
    return {
      url,
      lastModified,
      changeFrequency: (ov?.sitemap_change_frequency as ChangeFreq) ?? defaults.changeFrequency,
      priority: ov?.sitemap_priority ?? defaults.priority,
    };
  }

  const locationRoutes: MetadataRoute.Sitemap = locations
    .map((loc) =>
      applyOverride(
        loc.id,
        { changeFrequency: 'weekly', priority: 0.8 },
        new Date(loc.updated_at || loc.created_at),
        `${baseUrl}/locations/${loc.slug}`,
      ),
    )
    .filter(Boolean) as MetadataRoute.Sitemap;

  const projectRoutes: MetadataRoute.Sitemap = projects
    .map((proj) =>
      applyOverride(
        proj.id,
        { changeFrequency: 'daily', priority: 0.9 },
        new Date(proj.updated_at || proj.created_at),
        `${baseUrl}/projects/${proj.slug}`,
      ),
    )
    .filter(Boolean) as MetadataRoute.Sitemap;

  const propertyRoutes: MetadataRoute.Sitemap = properties
    .map((prop) =>
      applyOverride(
        prop.id,
        { changeFrequency: 'weekly', priority: 0.8 },
        new Date(prop.updated_at || prop.created_at),
        `${baseUrl}/properties/${prop.slug}`,
      ),
    )
    .filter(Boolean) as MetadataRoute.Sitemap;

  // Apply static page overrides (index_enabled=false excludes from sitemap)
  const staticRoutes: MetadataRoute.Sitemap = staticRouteDefaults
    .map((route) =>
      applyOverride(
        route.key,
        { changeFrequency: route.changeFrequency, priority: route.priority },
        new Date(),
        route.url,
      ),
    )
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticRoutes, ...locationRoutes, ...projectRoutes, ...propertyRoutes];
}
