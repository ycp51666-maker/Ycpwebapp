'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { SiteVisitForm } from '@/components/forms/SiteVisitForm';
import { useTheme } from '@/components/layout/ThemeProvider';

export interface HeroSectionProps {
  heroTitle?: string;
  heroDescription?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  mediaType?: 'video' | 'image';
  desktopVideo?: string;
  mobileVideo?: string;
  desktopImage?: string;
  mobileImage?: string;
  posterImage?: string;
  overlayOpacity?: number;
  heroBlur?: number;
  textAlignment?: 'left' | 'center' | 'right';
  heroH1Alignment?: 'left' | 'center' | 'right';
  heroH1ColorLight?: string;
  heroH1ColorDark?: string;
  heroH1Size?: 'normal' | 'large' | 'xlarge' | string;
  heroH1Transform?: 'none' | 'uppercase' | 'capitalize' | string;
  heroSubtitleAlignment?: 'left' | 'center' | 'right';
  heroSubColorLight?: string;
  heroSubColorDark?: string;
  heroSubSize?: 'small' | 'normal' | 'large' | string;
  headerLightTextColor?: string;
  headerDarkTextColor?: string;
  heroVerticalPosition?: 'center' | 'top' | 'bottom' | string;
  heroContentWidth?: '5xl' | '3xl' | '7xl' | string;
  heroH1MarginTop?: 'normal' | 'none' | 'small' | 'large' | string;
  heroSubMarginTop?: 'normal' | 'none' | 'small' | 'large' | string;
  heroBoxPosition?: string;
  heroOffsetX?: number;
  heroOffsetY?: number;
  heroMobileOffsetX?: number;
  heroMobileOffsetY?: number;
  heroBadgeText?: string;
  heroBadgeVisible?: boolean;
  heroBadgeAlignment?: 'left' | 'center' | 'right';
  heroBadgeColorLight?: string;
  heroBadgeColorDark?: string;
  heroBadgeSize?: 'small' | 'normal' | 'large' | string;
  heroMobileAlignment?: 'center' | 'left' | 'right' | 'same_as_desktop' | string;
  heroEnabled?: boolean;
  videoSpeed?: number;
  heroHeight?: 'screen' | 'large' | 'medium' | 'small' | 'compact' | string;
  heroHeightMobile?: 'screen' | 'large' | 'medium' | 'small' | 'compact' | string;
}

const getYoutubeId = (url?: string | null) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

function parseHeroRichText(text?: string | null): React.ReactNode {
  if (!text) return null;

  if (!/<(b|i|u|gold|mark|strong|em)[^>]*>/i.test(text)) {
    return text;
  }

  const regex = /<(b|i|u|gold|mark|strong|em)>(.*?)<\/\1>/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const tagName = match[1].toLowerCase();
    const content = match[2];

    if (tagName === 'b' || tagName === 'strong') {
      parts.push(<strong key={match.index} className="font-extrabold">{content}</strong>);
    } else if (tagName === 'i' || tagName === 'em') {
      parts.push(<em key={match.index} className="italic font-serif">{content}</em>);
    } else if (tagName === 'u') {
      parts.push(<u key={match.index} className="underline decoration-amber-400 decoration-2 underline-offset-4">{content}</u>);
    } else if (tagName === 'gold' || tagName === 'mark') {
      parts.push(<span key={match.index} className="text-amber-400 font-extrabold drop-shadow">{content}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroTitle = 'Your Choice Properties – Trusted Plots, Villas and Houses in Namakkal and Paramathi Velur',
  heroDescription = 'Explore residential plots, gated-community villas and independent houses across our projects in Namakkal and Paramathi Velur.',
  primaryCtaLabel = 'Explore Projects',
  primaryCtaLink = '/projects',
  secondaryCtaLabel = 'Contact Us',
  mediaType = 'image',
  desktopVideo,
  mobileVideo,
  desktopImage = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80',
  posterImage = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  overlayOpacity = 70,
  heroBlur = 0,
  textAlignment = 'center',
  heroH1Alignment,
  heroH1ColorLight,
  heroH1ColorDark,
  heroH1Size,
  heroH1Transform,
  heroSubtitleAlignment,
  heroSubColorLight,
  heroSubColorDark,
  heroSubSize,
  headerLightTextColor,
  headerDarkTextColor,
  heroContentWidth = '5xl',
  heroH1MarginTop = 'normal',
  heroSubMarginTop = 'normal',
  heroBoxPosition = 'center',
  heroOffsetX = 0,
  heroOffsetY = 0,
  heroMobileOffsetX = 0,
  heroMobileOffsetY = 0,
  heroBadgeText = 'DTCP & RERA Approved Layouts',
  heroBadgeVisible = true,
  heroBadgeAlignment,
  heroBadgeColorLight,
  heroBadgeColorDark,
  heroBadgeSize,
  heroMobileAlignment = 'center',
  heroEnabled = true,
  videoSpeed = 0.75,
  heroHeight = 'screen',
  heroHeightMobile = 'screen',
}) => {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Resolve vh value from keyword for a given height setting
  const resolveVh = (h: string) =>
    h === 'large' ? '85vh'
    : h === 'medium' ? '70vh'
    : h === 'small' ? '55vh'
    : h === 'compact' ? '45vh'
    : '100vh';

  // Build a server-rendered responsive style block so the height is always correct
  // regardless of Tailwind purging or CSS hot-reload issues.
  const heroStyleBlock = `
    #hero-section-main { min-height: ${resolveVh(heroHeightMobile)}; }
    @media (min-width: 640px) { #hero-section-main { min-height: ${resolveVh(heroHeight)}; } }
  `;

  useEffect(() => {
    if (videoRef.current && typeof videoSpeed === 'number') {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed]);

  // Derived client-side origin — empty string on server to avoid hydration mismatch
  const pageOrigin = '';

  const secondaryLabel = secondaryCtaLabel || 'Schedule a Site Visit';
  const isContactAction = secondaryLabel.toLowerCase().includes('contact');

  if (heroEnabled === false) return null;

  const safeDesktopImage = desktopImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80';
  const safePosterImage = posterImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
  const activeYoutubeId = getYoutubeId(desktopVideo) || getYoutubeId(mobileVideo);
  const activeDirectVideo = desktopVideo || mobileVideo;
  const activeImage = safeDesktopImage || safePosterImage;

  // Derive YouTube thumbnail for video poster when explicit poster image is not configured
  const videoPosterUrl = (() => {
    if (posterImage) return posterImage;
    if (activeYoutubeId) return `https://img.youtube.com/vi/${activeYoutubeId}/hqdefault.jpg`;
    return undefined;
  })();

  // Safe clamping of opacity 0-100 & blur (0-100% maps to 0-25px blur)
  const safeOpacity = Math.max(0, Math.min(100, overlayOpacity ?? 70)) / 100;
  const blurPx = (Math.max(0, Math.min(100, heroBlur || 0)) / 100) * 20;
  const blurStyle: React.CSSProperties = blurPx > 0 ? { filter: `blur(${blurPx.toFixed(1)}px)`, transform: 'scale(1.05)' } : {};

  // Derive grid horizontal alignment from 9-point grid selection
  const gridHorizontalPos = heroBoxPosition
    ? heroBoxPosition.includes('left')
      ? 'left'
      : heroBoxPosition.includes('right')
      ? 'right'
      : 'center'
    : 'center';

  const effectiveH1Align = heroH1Alignment || gridHorizontalPos || textAlignment;
  const effectiveSubAlign = heroSubtitleAlignment || gridHorizontalPos || textAlignment;
  const effectiveBadgeAlign = heroBadgeAlignment || gridHorizontalPos || textAlignment;

  const alignClasses =
    (gridHorizontalPos || textAlignment) === 'left'
      ? 'text-left items-start'
      : (gridHorizontalPos || textAlignment) === 'right'
      ? 'text-right items-end'
      : 'text-center items-center';

  const h1FlexAlign =
    effectiveH1Align === 'left'
      ? 'justify-start text-left'
      : effectiveH1Align === 'right'
      ? 'justify-end text-right'
      : 'justify-center text-center';

  const subFlexAlign =
    effectiveSubAlign === 'left'
      ? 'justify-start text-left'
      : effectiveSubAlign === 'right'
      ? 'justify-end text-right'
      : 'justify-center text-center';

  const ctaFlexAlign =
    effectiveH1Align === 'left'
      ? 'justify-start'
      : effectiveH1Align === 'right'
      ? 'justify-end'
      : 'justify-center';

  const h1CustomColor = theme === 'light' ? (heroH1ColorLight || headerLightTextColor) : (heroH1ColorDark || headerDarkTextColor);
  const subCustomColor = theme === 'light' ? (heroSubColorLight || headerLightTextColor) : (heroSubColorDark || headerDarkTextColor);

  const h1Style: React.CSSProperties = {
    ...(h1CustomColor ? { color: h1CustomColor } : {}),
    ...(heroH1Transform && heroH1Transform !== 'none' ? { textTransform: heroH1Transform as React.CSSProperties['textTransform'] } : {}),
  };

  const subStyle: React.CSSProperties = {
    ...(subCustomColor ? { color: subCustomColor } : {}),
  };

  const h1SizeClass =
    heroH1Size === 'large'
      ? 'text-4xl sm:text-6xl'
      : heroH1Size === 'xlarge'
      ? 'text-5xl sm:text-7xl'
      : 'text-3xl sm:text-5xl';

  const subSizeClass =
    heroSubSize === 'small'
      ? 'text-xs sm:text-base'
      : heroSubSize === 'large'
      ? 'text-base sm:text-xl'
      : 'text-sm sm:text-lg';

  const containerWidthClass =
    heroContentWidth === '3xl'
      ? 'max-w-3xl'
      : heroContentWidth === '7xl'
      ? 'max-w-7xl'
      : 'max-w-5xl';

  const h1MarginTopClass =
    heroH1MarginTop === 'none'
      ? 'mt-0'
      : heroH1MarginTop === 'small'
      ? 'mt-1'
      : heroH1MarginTop === 'large'
      ? 'mt-5'
      : '';

  const subMarginTopClass =
    heroSubMarginTop === 'none'
      ? 'mt-0'
      : heroSubMarginTop === 'small'
      ? 'mt-1'
      : heroSubMarginTop === 'large'
      ? 'mt-5'
      : '';

  // Dynamic bottom container padding based on desktop and mobile hero heights
  const contentPaddingClass = (() => {
    const isSmallCompactDesktop = heroHeight === 'small' || heroHeight === 'compact';
    const isSmallCompactMobile = heroHeightMobile === 'small' || heroHeightMobile === 'compact';
    const isMediumDesktop = heroHeight === 'medium';
    const isMediumMobile = heroHeightMobile === 'medium';

    if (isSmallCompactDesktop && isSmallCompactMobile) {
      return 'pb-8 sm:pb-12';
    } else if (isSmallCompactDesktop) {
      return 'pb-20 sm:pb-12';
    } else if (isSmallCompactMobile) {
      return 'pb-8 sm:pb-28';
    } else if (isMediumDesktop || isMediumMobile) {
      return 'pb-16 sm:pb-20';
    }
    return 'pb-28 sm:pb-36';
  })();

  // 9-Point Box Position: justify = vertical, wrapperAlign = where the content block sits, align = internal text alignment
  const boxPosLayout = (() => {
    const isSmallCompact = heroHeight === 'small' || heroHeight === 'compact' || heroHeightMobile === 'small' || heroHeightMobile === 'compact';
    const isMedium = heroHeight === 'medium' || heroHeightMobile === 'medium';

    const ptTop = isSmallCompact ? 'pt-6 sm:pt-8' : isMedium ? 'pt-10 sm:pt-14' : 'pt-16 sm:pt-20';
    const ptMid = isSmallCompact ? 'pt-4 sm:pt-6' : isMedium ? 'pt-8 sm:pt-10' : 'pt-12 sm:pt-16';
    const ptBot = isSmallCompact ? 'pt-2 sm:pt-4' : isMedium ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12';

    switch (heroBoxPosition) {
      case 'top-left':
        return { justify: `justify-start ${ptTop} pb-2`, wrapperAlign: 'mr-auto', align: 'items-start text-left' };
      case 'top-center':
        return { justify: `justify-start ${ptTop} pb-2`, wrapperAlign: 'mx-auto', align: 'items-center text-center' };
      case 'top-right':
        return { justify: `justify-start ${ptTop} pb-2`, wrapperAlign: 'ml-auto', align: 'items-end text-right' };
      case 'center-left':
        return { justify: `justify-center ${ptMid} pb-2`, wrapperAlign: 'mr-auto', align: 'items-start text-left' };
      case 'center-right':
        return { justify: `justify-center ${ptMid} pb-2`, wrapperAlign: 'ml-auto', align: 'items-end text-right' };
      case 'bottom-left':
        return { justify: `justify-end ${ptBot} pb-4 sm:pb-8`, wrapperAlign: 'mr-auto', align: 'items-start text-left' };
      case 'bottom-center':
        return { justify: `justify-end ${ptBot} pb-4 sm:pb-8`, wrapperAlign: 'mx-auto', align: 'items-center text-center' };
      case 'bottom-right':
        return { justify: `justify-end ${ptBot} pb-4 sm:pb-8`, wrapperAlign: 'ml-auto', align: 'items-end text-right' };
      case 'center':
      default:
        return {
          justify: `justify-center ${ptMid} pb-2`,
          wrapperAlign: 'mx-auto',
          align: alignClasses,
        };
    }
  })();

  const badgeCustomColor = theme === 'light' ? heroBadgeColorLight : heroBadgeColorDark;
  const badgeStyle: React.CSSProperties = badgeCustomColor
    ? { color: badgeCustomColor, borderColor: `${badgeCustomColor}60`, backgroundColor: `${badgeCustomColor}15` }
    : {};

  const badgeTextColorClass = badgeCustomColor ? '' : 'text-amber-400';
  const badgeBorderColorClass = badgeCustomColor ? '' : 'border-amber-500/30';
  const badgeBgColorClass = badgeCustomColor ? '' : 'bg-amber-500/10';

  const badgeSizeClass =
    heroBadgeSize === 'small'
      ? 'text-[10px] px-2.5 py-0.5'
      : heroBadgeSize === 'large'
      ? 'text-sm px-4 py-1.5'
      : 'text-xs px-3.5 py-1';

  const badgeAlignClass =
    effectiveBadgeAlign === 'left'
      ? 'self-start'
      : effectiveBadgeAlign === 'right'
      ? 'self-end'
      : 'self-center';
  const mobileAlignClass =
    heroMobileAlignment === 'left'
      ? 'max-sm:items-start max-sm:text-left'
      : heroMobileAlignment === 'right'
      ? 'max-sm:items-end max-sm:text-right'
      : heroMobileAlignment === 'same_as_desktop'
      ? ''
      : 'max-sm:items-center max-sm:text-center';

  const responsiveOffsetStyle = {
    '--hero-offset-x': `${heroOffsetX || 0}px`,
    '--hero-offset-y': `${heroOffsetY || 0}px`,
    '--hero-mobile-offset-x': `${heroMobileOffsetX || 0}px`,
    '--hero-mobile-offset-y': `${heroMobileOffsetY || 0}px`,
  } as React.CSSProperties;

  return (
    <>
      {/* Responsive hero height — server-rendered style block, always fresh */}
      <style dangerouslySetInnerHTML={{ __html: heroStyleBlock }} />
      <section id="hero-section-main" className="relative flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100">
      {/* Media Background Layer (Pure container, clips all rendering issues) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Blur/Scale Wrapper — must be relative so fill Images have a positioned parent */}
        <div className="relative w-full h-full overflow-hidden" style={blurStyle}>
          {mediaType === 'video' && (getYoutubeId(desktopVideo) || getYoutubeId(mobileVideo)) ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              {/* Optional Poster image shown while YouTube iframe initializes */}
              {videoPosterUrl && (
                <Image
                  src={videoPosterUrl}
                  alt="Hero Background Poster"
                  fill
                  sizes="100vw"
                  className="object-cover object-center z-0"
                  priority
                  quality={90}
                />
              )}

              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeYoutubeId}&playsinline=1&enablejsapi=1&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&origin=${pageOrigin}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] min-w-full min-h-full pointer-events-none border-0 z-10"
                style={{ opacity: 0.9 }}
                allow="autoplay; encrypted-media"
                title="Hero Background Video"
                suppressHydrationWarning
              />
            </div>
          ) : activeDirectVideo ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              <video
                key={activeDirectVideo}
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={videoPosterUrl || desktopImage}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover object-center pointer-events-none z-10"
              >
                <source src={activeDirectVideo} type="video/mp4" />
                <source src={activeDirectVideo} type="video/webm" />
              </video>
            </div>
          ) : (
            <Image
              src={activeImage}
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover object-center transition-all duration-700 z-0"
              priority
              quality={90}
            />
          )}
        </div>

        {/* Dynamic Admin Controlled Dark Overlay Opacity (Applies to both video & image media background layers, behind text) */}
        <div
          className="absolute inset-0 bg-slate-950 pointer-events-none"
          style={{ opacity: safeOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Content Section — full-width flex column to allow 9-point grid positioning */}
      <div className={`relative z-10 w-full px-4 sm:px-6 lg:px-8 ${contentPaddingClass} flex-1 flex flex-col ${boxPosLayout.justify}`}>
        <div className={`hero-offset-transform ${containerWidthClass} ${boxPosLayout.wrapperAlign} flex flex-col ${boxPosLayout.align} ${mobileAlignClass} space-y-5`} style={responsiveOffsetStyle}>

          {/* Badge Tag */}
          {heroBadgeVisible !== false && (
            <div
              style={badgeStyle}
              className={`hero-animate-badge ${badgeAlignClass} inline-flex items-center gap-2 ${badgeSizeClass} ${badgeBgColorClass} ${badgeBorderColorClass} border rounded-full ${badgeTextColorClass} font-bold uppercase tracking-widest backdrop-blur-md shadow-xl`}
            >
              <Sparkles className="w-3.5 h-3.5" style={badgeCustomColor ? { color: badgeCustomColor } : undefined} />
              <span>{parseHeroRichText(heroBadgeText || 'DTCP & RERA Approved Layouts')}</span>
            </div>
          )}

          {/* H1 Heading */}
          <h1
            style={h1Style}
            className={`font-serif ${h1SizeClass} ${h1MarginTopClass} font-extrabold tracking-tight leading-tight w-full max-w-4xl drop-shadow-md flex flex-wrap ${h1FlexAlign} gap-x-[0.25em] gap-y-1`}
          >
            {/<(b|i|u|gold|mark|strong|em)[^>]*>/i.test(heroTitle)
              ? parseHeroRichText(heroTitle)
              : heroTitle.split(' ').map((word, idx) => (
                  <span
                    key={idx}
                    className="hero-word-left inline-block"
                    style={{ ...h1Style, animationDelay: `${0.5 + idx * 0.045}s` }}
                  >
                    {word}
                  </span>
                ))}
          </h1>

          {/* Description */}
          <p
            style={subStyle}
            className={`${subSizeClass} ${subMarginTopClass} w-full max-w-4xl sm:max-w-5xl leading-relaxed font-normal drop-shadow-sm flex flex-wrap ${subFlexAlign} gap-x-[0.22em] gap-y-1`}
          >
            {/<(b|i|u|gold|mark|strong|em)[^>]*>/i.test(heroDescription)
              ? parseHeroRichText(heroDescription)
              : heroDescription.split(' ').map((word, idx) => (
                  <span
                    key={idx}
                    className="hero-word-right inline-block"
                    style={{ ...subStyle, animationDelay: `${0.9 + idx * 0.035}s` }}
                  >
                    {word}
                  </span>
                ))}
          </p>

          {/* Compact Designed CTA Buttons with Mouse Hover Animations */}
          <div className={`hero-animate-cta w-full flex flex-wrap items-center ${ctaFlexAlign} gap-4 pt-3`}>
            {theme === 'light' ? (
              <>
                <Link href={primaryCtaLink || '/projects'} className="group">
                  <Button
                    variant="gold"
                    size="sm"
                    className="font-bold px-5 py-2.5 text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 hover:shadow-amber-500/35 transition-all duration-300 flex items-center gap-2"
                  >
                    <span>{primaryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 pointer-events-none" />
                  </Button>
                </Link>

                {isContactAction ? (
                  <Link href="/contact-us">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group border-slate-400 hover:border-amber-400 text-slate-100 hover:text-amber-300 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md font-bold px-5 py-2.5 text-xs sm:text-sm rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      <Calendar className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300 pointer-events-none" />
                      <span>{secondaryLabel}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVisitModalOpen(true)}
                    className="group border-slate-400 hover:border-amber-400 text-slate-100 hover:text-amber-300 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md font-bold px-5 py-2.5 text-xs sm:text-sm rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <Calendar className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300 pointer-events-none" />
                    <span>{secondaryLabel}</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link href={primaryCtaLink || '/projects'} className="blob-btn blob-btn-explore">
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 pointer-events-none" />
                  <span className="blob-btn__inner">
                    <span className="blob-btn__blobs">
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                    </span>
                  </span>
                </Link>

                {isContactAction ? (
                  <Link href="/contact-us" className="blob-btn blob-btn-contact">
                    <Calendar className="w-4 h-4 shrink-0 pointer-events-none" />
                    <span>{secondaryLabel}</span>
                    <span className="blob-btn__inner">
                      <span className="blob-btn__blobs">
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                      </span>
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsVisitModalOpen(true)}
                    className="blob-btn blob-btn-contact"
                  >
                    <Calendar className="w-4 h-4 shrink-0 pointer-events-none" />
                    <span>{secondaryLabel}</span>
                    <span className="blob-btn__inner">
                      <span className="blob-btn__blobs">
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                      </span>
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Site Visit Booking Modal */}
      <Dialog
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        title="Request a Guided Site Visit"
        description="Provide your details below, and our team will get in touch to confirm layout availability and schedule your visit."
      >
        <SiteVisitForm onSuccess={() => setIsVisitModalOpen(false)} />
      </Dialog>

      {/* SVG gooey blob filter definitions */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo"></feColorMatrix>
            <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
          </filter>
        </defs>
      </svg>
    </section>
    </>
  );
};
