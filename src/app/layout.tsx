import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/config/site';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

const ogImage = new URL('/og-image.jpg', siteConfig.domain).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Real Estate Namakkal',
    'Plots for sale Tamil Nadu',
    'Villas Namakkal',
    'Paramathi Velur Real Estate',
    'Your Choice Properties',
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.domain,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="antialiased h-full">
      <head>
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://maps.google.com" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
