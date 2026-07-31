export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  domain: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://www.yourchoiceproperties.in';
};

export const siteConfig: SiteConfig = {
  name: 'Your Choice Properties',
  title: 'Your Choice Properties | Premium Residential Plots & Villas in Tamil Nadu',
  description:
    'Discover premium plots, villas, and commercial real-estate properties in Namakkal, Paramathi Velur, Salem, Erode, and nearby locations. Trusted real-estate developer.',
  domain: getSiteUrl(),
  contact: {
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    email: 'info@yourchoiceproperties.in',
    address: 'Main Road, Namakkal, Tamil Nadu - 637001',
  },
  socialLinks: {
    facebook: 'https://facebook.com/yourchoiceproperties',
    instagram: 'https://instagram.com/yourchoiceproperties',
  },
};
