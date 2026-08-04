/**
 * Static page route definitions for SEO management.
 * Each static page has a unique key used as `entity_id` in the `seo_metadata` table.
 * This allows the admin to set per-page meta title/description/keywords for every static route.
 */

export interface StaticPageDef {
  key: string;
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage?: string;
}

export const STATIC_PAGES: StaticPageDef[] = [
  {
    key: 'home',
    path: '/',
    label: 'Home',
    defaultTitle: 'Your Choice Properties | Plots & Villas in Namakkal',
    defaultDescription:
      'Your Choice Properties offers DTCP approved residential plots, gated community layouts, and custom villas in Namakkal and Paramathi Velur.',
  },
  {
    key: 'about-us',
    path: '/about-us',
    label: 'About Us',
    defaultTitle: 'About Your Choice Properties | Real Estate Company in Namakkal',
    defaultDescription:
      'Learn about Your Choice Properties, our honest approach and our experience in residential plots and villa development across Namakkal and Paramathi Velur.',
  },
  {
    key: 'contact-us',
    path: '/contact-us',
    label: 'Contact Us',
    defaultTitle: 'Contact Your Choice Properties | Villas & Plots in Namakkal & Paramathi velur',
    defaultDescription:
      'Contact Your Choice Properties today for premium villas and DTCP approved plots in Namakkal and Paramathy Velur. Schedule a free site visit.',
  },
  {
    key: 'services',
    path: '/services',
    label: 'Services',
    defaultTitle: 'Our Services | Plots, Villas and Houses in Namakkal',
    defaultDescription:
      'Explore plot sales, villa and house sales, site visits, documentation support and home-loan guidance from Your Choice Properties in Namakkal and Paramathi Velur.',
  },
  {
    key: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    defaultTitle: 'Photo & Video Gallery – Your Choice Properties',
    defaultDescription:
      'View real site photos, villa designs, road infrastructure, YouTube walkthroughs and Instagram reels across Rasi Garden, Kongu Nagar & Kongu Garden in Namakkal & Paramathy Velur.',
  },
  {
    key: 'locations',
    path: '/locations',
    label: 'Locations',
    defaultTitle: 'Explore Locations | Your Choice Properties',
    defaultDescription:
      'Discover current and upcoming residential land layouts, gated townships, and villa locations in Namakkal, Paramathi Velur, Erode, and Salem.',
  },
  {
    key: 'projects',
    path: '/projects',
    label: 'Projects',
    defaultTitle: 'Our Residential Projects | Your Choice Properties',
    defaultDescription:
      'Explore our residential plots and villa projects in Namakkal and Paramathi Velur. Compare the location, available property types and project details before arranging a site visit.',
  },
  {
    key: 'properties',
    path: '/properties',
    label: 'Properties',
    defaultTitle: 'All Property Configurations & Villa Layouts',
    defaultDescription:
      'Search through DTCP approved residential villa plots, 2BHK/3BHK villas, and commercial properties across Tamil Nadu.',
  },
  {
    key: 'privacy-policy',
    path: '/privacy-policy',
    label: 'Privacy Policy',
    defaultTitle: 'Privacy Policy | Your Choice Properties',
    defaultDescription:
      'Understand how Your Choice Properties collects, protects, and uses customer contact and site visit information.',
  },
  {
    key: 'terms-and-conditions',
    path: '/terms-and-conditions',
    label: 'Terms & Conditions',
    defaultTitle: 'Terms and Conditions | Your Choice Properties',
    defaultDescription:
      'Terms of service governing site usage, property reservations, site visit scheduling, and legal title disclaimers.',
  },
  {
    key: 'plots-for-sale-in-namakkal',
    path: '/plots-for-sale-in-namakkal',
    label: 'Plots for Sale in Namakkal',
    defaultTitle: 'DTCP Approved Plots for Sale in Namakkal | Rasi Garden & Kongu Nagar',
    defaultDescription:
      'Explore residential DTCP approved plots for sale in Namakkal. Clear title documents, blacktop roads, underground drainage, and transparent pricing.',
  },
  {
    key: 'dtcp-approved-plots-in-paramathi-velur',
    path: '/dtcp-approved-plots-in-paramathi-velur',
    label: 'DTCP Plots in Paramathi Velur',
    defaultTitle: 'DTCP Approved Plots in Paramathi Velur | Kongu Garden Layouts',
    defaultDescription:
      'Explore DTCP approved plot sites for sale in Paramathi Velur. Strategic highway connectivity, blacktop roads, groundwater facilities, and clear title documentation.',
  },
  {
    key: 'villas-for-sale-in-namakkal',
    path: '/villas-for-sale-in-namakkal',
    label: 'Villas for Sale in Namakkal',
    defaultTitle: '2BHK 3BHK 4BHK Villas & Houses for Sale in Namakkal | Independent Homes',
    defaultDescription:
      'Explore 2BHK, 3BHK, and 4BHK independent villas and houses for sale in Namakkal. Custom architectural planning, Vaastu compliant layouts, teakwood fittings, and covered parking.',
  },
];

export function getStaticPageByKey(key: string): StaticPageDef | undefined {
  return STATIC_PAGES.find((p) => p.key === key);
}

export function getStaticPageByPath(path: string): StaticPageDef | undefined {
  return STATIC_PAGES.find((p) => p.path === path);
}