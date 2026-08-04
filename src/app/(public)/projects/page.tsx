import React from 'react';
import { Metadata } from 'next';
import { getPublishedProjects } from '@/lib/data';
import { FeaturedProjectsSection } from '@/components/public/FeaturedProjectsSection';
import { generateStaticPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata('projects');
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* H1 & Overview Description Header */}
      <div className="max-w-7xl mx-auto border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Layout Projects</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white mt-1">
          Our Residential Projects
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-2 leading-relaxed">
          Explore our residential plots and villa projects in Namakkal and Paramathi Velur. Compare the location, available property types and project details before arranging a site visit.
        </p>
      </div>

      {/* Projects List Section */}
      <FeaturedProjectsSection projects={projects} />
    </div>
  );
}
