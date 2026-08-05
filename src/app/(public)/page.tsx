import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import {
  getPublishedLocations,
  getPublishedProjects,
  getPublishedGalleryItems,
  getContentPage,
} from '@/lib/data';
import { getTestimonials } from '@/lib/data/settings';
import { generateHomePageMetadata, getHomePageJsonLd } from '@/lib/seo/metadata';

import { HeroSection } from '@/components/public/HeroSection';
import { LocationCardsSection } from '@/components/public/LocationCardsSection';
import { CompanyIntroSection } from '@/components/public/CompanyIntroSection';
import { StatsSection } from '@/components/public/StatsSection';
import { FeaturedProjectsSection } from '@/components/public/FeaturedProjectsSection';
import { WhyChooseUsSection, WhyChooseUsItem } from '@/components/public/WhyChooseUsSection';
import { GalleryPreviewSection } from '@/components/public/GalleryPreviewSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { SiteVisitCTASection } from '@/components/public/SiteVisitCTASection';

export async function generateMetadata(): Promise<Metadata> {
  return await generateHomePageMetadata();
}

export default async function HomePage() {
  // Fetch dynamic content and records from data access layer
  const [locations, projects, galleryItems, homeContent, testimonials] = await Promise.all([
    getPublishedLocations({ featuredOnly: true }),
    getPublishedProjects({ featuredOnly: true }),
    getPublishedGalleryItems({ featuredOnly: true }),
    getContentPage('home'),
    getTestimonials(),
  ]);

  const jsonLd = getHomePageJsonLd();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentJson = (homeContent?.content as Record<string, any>) || {};

  // Render stats strictly from the page content's stats_list
  const resolvedStats = Array.isArray(contentJson.stats_list) ? contentJson.stats_list : [];

  // Check if there is a local video file inside the public folder (priority 1)
  let localVideo: string | undefined = undefined;
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    const videoFile = files.find(
      (file) => file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm')
    );
    if (videoFile) {
      localVideo = `/${videoFile}`;
    }
  } catch (error) {
    console.error('Error scanning public directory for video assets:', error);
  }

  return (
    <>
      {/* Organization / WebSite Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-0">
        {/* 1. Hero with Background Video/Image & Admin Opacity Controls */}
        <HeroSection
          heroEnabled={contentJson.hero_enabled !== false}
          heroTitle={contentJson.hero_h1 || contentJson.hero_title}
          heroDescription={contentJson.hero_description || contentJson.hero_subtitle}
          primaryCtaLabel={contentJson.primary_cta_label}
          primaryCtaLink={contentJson.primary_cta_link}
          secondaryCtaLabel={contentJson.secondary_cta_label}
          mediaType={contentJson.hero_media_type || (localVideo ? 'video' : 'image')}
          desktopVideo={contentJson.hero_media_type === 'image' ? undefined : (contentJson.desktop_video || localVideo)}
          mobileVideo={contentJson.hero_media_type === 'image' ? undefined : (contentJson.mobile_video || localVideo)}
          desktopImage={contentJson.desktop_image}
          mobileImage={contentJson.mobile_image}
          posterImage={contentJson.poster_image}
          overlayOpacity={contentJson.overlay_opacity !== undefined ? Number(contentJson.overlay_opacity) : 70}
          heroBlur={contentJson.hero_blur !== undefined ? Number(contentJson.hero_blur) : 0}
          textAlignment={contentJson.text_alignment || 'center'}
          heroH1Alignment={contentJson.hero_h1_alignment}
          heroH1ColorLight={contentJson.hero_h1_color_light}
          heroH1ColorDark={contentJson.hero_h1_color_dark}
          heroH1Size={contentJson.hero_h1_size}
          heroH1Transform={contentJson.hero_h1_transform}
          heroSubtitleAlignment={contentJson.hero_subtitle_alignment}
          heroSubColorLight={contentJson.hero_sub_color_light}
          heroSubColorDark={contentJson.hero_sub_color_dark}
          heroSubSize={contentJson.hero_sub_size}
          headerLightTextColor={contentJson.header_light_text_color}
          headerDarkTextColor={contentJson.header_dark_text_color}
          heroVerticalPosition={contentJson.hero_vertical_position || 'center'}
          heroContentWidth={contentJson.hero_content_width || '5xl'}
          heroH1MarginTop={contentJson.hero_h1_margin_top || 'normal'}
          heroSubMarginTop={contentJson.hero_sub_margin_top || 'normal'}
          heroBoxPosition={contentJson.hero_box_position || 'center'}
          heroOffsetX={contentJson.hero_offset_x !== undefined ? Number(contentJson.hero_offset_x) : 0}
          heroOffsetY={contentJson.hero_offset_y !== undefined ? Number(contentJson.hero_offset_y) : 0}
          heroMobileOffsetX={contentJson.hero_mobile_offset_x !== undefined ? Number(contentJson.hero_mobile_offset_x) : 0}
          heroMobileOffsetY={contentJson.hero_mobile_offset_y !== undefined ? Number(contentJson.hero_mobile_offset_y) : 0}
          heroBadgeText={contentJson.hero_badge_text}
          heroBadgeVisible={contentJson.hero_badge_visible !== false}
          heroBadgeAlignment={contentJson.hero_badge_alignment}
          heroBadgeColorLight={contentJson.hero_badge_color_light}
          heroBadgeColorDark={contentJson.hero_badge_color_dark}
          heroBadgeSize={contentJson.hero_badge_size}
          heroMobileAlignment={contentJson.hero_mobile_alignment || 'center'}
          heroHeight={contentJson.hero_height || 'screen'}
          heroHeightMobile={contentJson.hero_height_mobile || 'screen'}
          videoSpeed={contentJson.video_speed !== undefined ? Number(contentJson.video_speed) : 0.75}
        />

        {/* 2. Two Central Location-Selection Cards (Overlapping Hero Lower Area) */}
        <LocationCardsSection
          locations={locations}
          enabled={contentJson.location_cards_enabled !== false}
          overlap={contentJson.location_cards_overlap !== false}
          overlapAmount={contentJson.location_cards_overlap_amount || 'medium'}
          overlapDesktop={contentJson.location_cards_overlap_desktop !== undefined ? Boolean(contentJson.location_cards_overlap_desktop) : (contentJson.location_cards_overlap !== false)}
          overlapMobile={contentJson.location_cards_overlap_mobile !== undefined ? Boolean(contentJson.location_cards_overlap_mobile) : (contentJson.location_cards_overlap !== false)}
          overlapAmountDesktop={contentJson.location_cards_overlap_amount_desktop || contentJson.location_cards_overlap_amount || 'medium'}
          overlapAmountMobile={contentJson.location_cards_overlap_amount_mobile || contentJson.location_cards_overlap_amount || 'medium'}
          containerWidth={contentJson.location_cards_container_width || '6xl'}
          aspectRatio={contentJson.location_cards_aspect_ratio || '16/10'}
          gridAlignment={contentJson.location_cards_alignment || 'center'}
          nonOverlapMarginTop={contentJson.location_cards_non_overlap_margin_top || 'medium'}
        />

        {/* 3. Short Company Introduction Section */}
        <CompanyIntroSection
          introHeading={contentJson.intro_h2}
          introContent={contentJson.intro_content}
          introImage={contentJson.intro_image || '/certifivate.jpeg'}
        />

        {/* Key Statistics Highlights */}
        <StatsSection
          stats={resolvedStats}
          isVisible={contentJson.stats_visible !== false}
        />

        {/* 4. Featured Projects (Rasi Garden, Kongu Nagar, Kongu Garden) */}
        <FeaturedProjectsSection projects={projects} />

        {/* 5. Small Compact Why Choose Us Section */}
        <WhyChooseUsSection items={contentJson.why_choose_us_items as WhyChooseUsItem[]} />

        {/* 6. Gallery Preview Section */}
        <GalleryPreviewSection
          galleryItems={galleryItems}
          heading={contentJson.gallery_heading}
          description={contentJson.gallery_description}
          ctaLabel={contentJson.gallery_cta}
        />

        {/* 7. Testimonials Scrolling Ticker */}
        <TestimonialsSection testimonials={testimonials ?? undefined} />

        {/* 8. Final Site-Visit CTA Section */}
        <SiteVisitCTASection
          heading={contentJson.final_cta_heading}
          description={contentJson.final_cta_description}
        />
      </div>
    </>
  );
}
