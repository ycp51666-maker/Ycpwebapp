'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Award, Building2, Users, Maximize, Home } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string;
  icon?: string;
}

export interface StatsSectionProps {
  stats?: StatItem[];
  isVisible?: boolean;
}

const AnimatedCounter: React.FC<{ value: string }> = ({ value }) => {
  // Strip commas to correctly parse values like "1,200"
  const cleanValue = value.replace(/,/g, '');
  const match = cleanValue.match(/^([\d.]+)(.*)/);
  const targetNum = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isDecimal = match ? match[1].includes('.') : false;

  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;
          const duration = 1800; // 1.8 seconds smooth animation

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Smooth easeOutCubic curve
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOutProgress * targetNum;

            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(targetNum);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [targetNum]);

  // Format with commas if integer, keep single decimal if float
  const displayValue = isDecimal
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString('en-US');

  return (
    <span ref={containerRef}>
      {displayValue}{suffix}
    </span>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, isVisible = true }) => {
  if (!isVisible || !stats || stats.length === 0) return null;

  const list = stats;

  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-5 h-5 text-amber-400" />,
    Building2: <Building2 className="w-5 h-5 text-emerald-400" />,
    Users: <Users className="w-5 h-5 text-blue-400" />,
    Maximize: <Maximize className="w-5 h-5 text-amber-500" />,
    Home: <Home className="w-5 h-5 text-emerald-500" />,
  };

  return (
    <section className="relative py-8 bg-slate-900/80 border-y border-slate-800/80 overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {list.map((stat, idx) => (
            <div
              key={idx}
              className="group p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-lg hover:border-amber-500/40 transition-all duration-300 flex flex-col items-center text-center space-y-2 hover:-translate-y-1 w-[calc(50%-0.5rem)] sm:w-44 lg:w-48"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {iconMap[stat.icon || 'Award'] || <Award className="w-5 h-5 text-amber-400" />}
              </div>

              <span className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-amber-400 group-hover:text-amber-300 transition-colors">
                <AnimatedCounter value={stat.value} />
              </span>

              <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-300 tracking-wider leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
