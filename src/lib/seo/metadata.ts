import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { SEOMetadata } from '@/types/database';
import { getStaticPageByKey } from '@/config/static-pages';

type OpenGraphType = 'website' | 'article';
type TwitterCardType = 'summary' | 'summary_large_image';

// ─── Static page metadata ─────────────────────────────────────────────────────

/**
 * Fetches the admin-managed SEO override for a static page.
 * Static pages are identified by their route key (e.g. 'about-us', 'contact-us').
 * The key is stored in the `entity_id` column with `entity_type = 'page'`.
 */
export async function getStaticPageSeoOverride(pageKey: string): Promise<SEOMetadata | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('entity_type', 'page')
      .eq('entity_id', pageKey)
      .maybeSingle();
    return (data as SEOMetadata | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * Generates metadata for a static page, merging the admin override with defaults.
 * Falls back to the static page's default title/description if no override exists.
 */
export async function generateStaticPageMetadata(pageKey: string): Promise<Metadata> {
  const pageDef = getStaticPageByKey(pageKey);
  const fallback = {
    title: pageDef?.defaultTitle || siteConfig.title,
    description: pageDef?.defaultDescription || siteConfig.description,
    canonicalUrl: pageDef ? `${siteConfig.domain}${pageDef.path === '/' ? '' : pageDef.path}` : siteConfig.domain,
    ogImage: pageDef?.defaultOgImage || `${siteConfig.domain}/logo.png`,
  };

  try {
    const override = await getStaticPageSeoOverride(pageKey);
    return buildMetadataFromOverride(override, fallback);
  } catch {
    return buildMetadataFromOverride(null, fallback);
  }
}

// ─── Home page ────────────────────────────────────────────────────────────────

export async function generateHomePageMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('home');
}

// ─── Generic entity override ──────────────────────────────────────────────────

/**
 * Fetches the admin-managed SEO override for a specific entity.
 * entity_type examples: 'project', 'location', 'configuration'
 * entity_id: the UUID of that row in the DB.
 * Returns null (no override) on any error so callers always have a safe fallback.
 */
export async function getSeoOverride(
  entityType: string,
  entityId: string,
): Promise<SEOMetadata | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();
    return (data as SEOMetadata | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * Merges an optional SEO override with hard-coded fallback values.
 * Produces a fully-typed Next.js Metadata object including:
 *  - robots (noindex/nofollow when index_enabled = false)
 *  - canonical URL override
 *  - OpenGraph + Twitter cards
 */
export function buildMetadataFromOverride(
  override: SEOMetadata | null,
  fallback: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string;
  },
): Metadata {
  const title = override?.meta_title || fallback.title;
  const description = override?.meta_description || fallback.description;
  const canonical = override?.canonical_url || fallback.canonicalUrl;
  const ogTitle = override?.open_graph_title || title;
  const ogDescription = override?.open_graph_description || description;
  const ogImage = override?.open_graph_image_path || fallback.ogImage || `${siteConfig.domain}/logo.png`;
  const indexed = override?.index_enabled ?? true;

  const keywords = override?.meta_keywords
    ? override.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined;

  const robotsDirectives = override?.robots_directives || '';
  const robotsParts = robotsDirectives.split(',').map((s) => s.trim().toLowerCase());
  const robots = indexed
    ? {
        index: !robotsParts.includes('noindex'),
        follow: !robotsParts.includes('nofollow'),
        noarchive: robotsParts.includes('noarchive'),
        nosnippet: robotsParts.includes('nosnippet'),
      }
    : {
        index: false,
        follow: !robotsParts.includes('nofollow'),
        noarchive: robotsParts.includes('noarchive'),
        nosnippet: robotsParts.includes('nosnippet'),
      };

  const ogType = (override?.og_type === 'article' ? 'article' : 'website') satisfies OpenGraphType;
  const twitterCard = (
    override?.twitter_card === 'summary' ? 'summary' : 'summary_large_image'
  ) satisfies TwitterCardType;
  const ogImageAlt = override?.open_graph_image_alt || title;

  return {
    title,
    description,
    keywords,
    robots,
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      locale: 'en_IN',
      type: ogType,
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

// ─── Home page JSON-LD ────────────────────────────────────────────────────────

export function getHomePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    url: siteConfig.domain,
    logo: `${siteConfig.domain}/logo.png`,
    description: siteConfig.description,
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
    sameAs: [
      siteConfig.socialLinks.facebook,
      siteConfig.socialLinks.instagram,
    ].filter(Boolean),
  };
}

// ─── Project JSON-LD ──────────────────────────────────────────────────────────

export function getProjectJsonLd(project: {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  starting_price: number | null;
  hero_image_path: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  location?: { name: string } | null;
}) {
  const url = `${siteConfig.domain}/projects/${project.slug}`;
  return [
    // Breadcrumb
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.domain },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteConfig.domain}/projects` },
        { '@type': 'ListItem', position: 3, name: project.name, item: url },
      ],
    },
    // Residence / Real Estate Listing
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: project.name,
      url,
      description:
        project.short_description ||
        `${project.name} — premium residential project in ${project.location?.name || 'Namakkal'}.`,
      ...(project.hero_image_path ? { image: project.hero_image_path } : {}),
      ...(project.starting_price
        ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: project.starting_price,
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
      ...(project.address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: project.address,
              addressLocality: project.location?.name || 'Namakkal',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          }
        : {}),
      ...(project.latitude && project.longitude
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: project.latitude,
              longitude: project.longitude,
            },
          }
        : {}),
      provider: {
        '@type': 'RealEstateAgent',
        name: siteConfig.name,
        url: siteConfig.domain,
      },
    },
  ];
}

// ─── Location JSON-LD ─────────────────────────────────────────────────────────

export function getLocationJsonLd(location: {
  name: string;
  slug: string;
  short_description: string | null;
  hero_image_path: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const url = `${siteConfig.domain}/locations/${location.slug}`;
  return [
    // Breadcrumb
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.domain },
        { '@type': 'ListItem', position: 2, name: 'Locations', item: `${siteConfig.domain}/locations` },
        { '@type': 'ListItem', position: 3, name: location.name, item: url },
      ],
    },
    // Place
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${location.name} Real Estate`,
      url,
      description:
        location.short_description ||
        `Explore premium residential plots and villas in ${location.name}.`,
      ...(location.hero_image_path ? { image: location.hero_image_path } : {}),
      ...(location.address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: location.address,
              addressLocality: location.name,
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          }
        : {}),
      ...(location.latitude && location.longitude
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: location.latitude,
              longitude: location.longitude,
            },
          }
        : {}),
    },
  ];
}

// ─── Configuration / Property JSON-LD ────────────────────────────────────────

export function getConfigurationJsonLd(config: {
  name: string;
  slug: string;
  short_description: string | null;
  starting_price: number | null;
  hero_image_path: string | null;
  property_type: string;
  bhk: number;
  bedrooms: number;
  bathrooms: number;
  plot_area: string | null;
  built_up_area: string | null;
  project?: {
    name: string;
    slug: string;
    address: string | null;
    location?: { name: string } | null;
  } | null;
}) {
  const url = `${siteConfig.domain}/properties/${config.slug}`;
  return [
    // Breadcrumb
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.domain },
        { '@type': 'ListItem', position: 2, name: 'Properties', item: `${siteConfig.domain}/properties` },
        ...(config.project
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: config.project.name,
                item: `${siteConfig.domain}/projects/${config.project.slug}`,
              },
              { '@type': 'ListItem', position: 4, name: config.name, item: url },
            ]
          : [{ '@type': 'ListItem', position: 3, name: config.name, item: url }]),
      ],
    },
    // Residence
    {
      '@context': 'https://schema.org',
      '@type': 'Residence',
      name: config.name,
      url,
      description:
        config.short_description ||
        `${config.bhk} BHK ${config.property_type} at ${config.project?.name || 'Your Choice Properties'} in ${config.project?.location?.name || 'Namakkal'}.`,
      ...(config.hero_image_path ? { image: config.hero_image_path } : {}),
      numberOfRooms: config.bedrooms,
      numberOfBathroomsTotal: config.bathrooms,
      ...(config.built_up_area ? { floorSize: { '@type': 'QuantitativeValue', value: config.built_up_area } } : {}),
      ...(config.starting_price
        ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: config.starting_price,
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
      ...(config.project?.address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: config.project.address,
              addressLocality: config.project.location?.name || 'Namakkal',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          }
        : {}),
    },
  ];
}

// ─── JSON-LD resolver ─────────────────────────────────────────────────────────

/**
 * Returns the admin-defined JSON-LD override if set,
 * otherwise returns the provided default structured data.
 * Always returns a serialisable object / array safe for JSON.stringify.
 */
export function resolveJsonLd(
  override: SEOMetadata | null,
  defaultData: object | object[],
): object | object[] {
  if (override?.json_ld_override) {
    return override.json_ld_override as object;
  }
  return defaultData;
}
