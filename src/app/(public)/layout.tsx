import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/toast';
import { getNavLocations, getSocialLinks, getIntegrationsSettings, getGlobalAnnouncement, getContentPage, getContactInfo } from '@/lib/data';
import { SiteSettingsProvider } from '@/components/providers/SiteSettingsProvider';

// Lazy-load interactive below-the-fold components to reduce initial JS bundle
const StickyActionBar = dynamic(
  () => import('@/components/layout/StickyActionBar').then(m => ({ default: m.StickyActionBar }))
);
const AutoContactPopup = dynamic(
  () => import('@/components/public/AutoContactPopup').then(m => ({ default: m.AutoContactPopup }))
);

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

function extractVerificationToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const contentMatch = /content\s*=\s*["']([^"']+)["']/i.exec(trimmed);
  return contentMatch ? contentMatch[1] : trimmed;
}

export async function generateMetadata(): Promise<Metadata> {
  const integrations = await getIntegrationsSettings();
  const google = extractVerificationToken(integrations?.google_search_console || '');

  return google
    ? {
        verification: {
          google,
        },
      }
    : {};
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch nav locations, social links, tracking integrations, global announcement, contact info, and home page content from DB
  const [navLocations, socialLinks, integrations, announcement, homePage, contactInfo] = await Promise.all([
    getNavLocations(),
    getSocialLinks(),
    getIntegrationsSettings(),
    getGlobalAnnouncement(),
    getContentPage('home'),
    getContactInfo(),
  ]);

  const homeContent = (homePage?.content || {}) as {
    header_light_text_color?: string;
    header_dark_text_color?: string;
  };

  return (
    <ToastProvider>
      {/* Dynamic tracking scripts */}
      {integrations?.google_analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${integrations.google_analytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${integrations.google_analytics}');
            `}
          </Script>
        </>
      )}
      {integrations?.google_tag_manager && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${integrations.google_tag_manager}');
            `}
          </Script>
        </>
      )}
      {integrations?.facebook_pixel && (
        <>
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${integrations.facebook_pixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${integrations.facebook_pixel}&ev=PageView&noscript=1" />`
          }} />
        </>
      )}

      {integrations?.microsoft_clarity && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${integrations.microsoft_clarity}");
          `}
        </Script>
      )}

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-xl"
      >
        Skip to main content
      </a>

      <SiteSettingsProvider contactInfo={contactInfo} socialLinks={socialLinks} announcement={announcement}>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
          {integrations?.google_tag_manager && (
            <noscript dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${integrations.google_tag_manager}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
            }} />
          )}
          <Header
            navLocations={navLocations}
            socialLinks={socialLinks}
            announcement={announcement}
            contactInfo={contactInfo}
            headerLightTextColor={homeContent.header_light_text_color}
            headerDarkTextColor={homeContent.header_dark_text_color}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer socialLinks={socialLinks} contactInfo={contactInfo} />
          <StickyActionBar />
          <AutoContactPopup />
        </div>
      </SiteSettingsProvider>
    </ToastProvider>
  );
}
