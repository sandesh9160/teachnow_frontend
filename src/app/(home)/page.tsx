import { Suspense } from "react";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import HeroStats from "@/components/home/HeroStats/Herostats";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import Features from "@/components/home/Features/Features";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import Faq from "@/components/home/FAQ/FAQ";
import dynamic from "next/dynamic";

// Homepage Sections (dynamically imported with SSR enabled to defer client JS loading)
const FeaturedInstitutions = dynamic(() => import("@/components/home/FeaturedInstitutions/FeaturedInstitutions"), { ssr: true });
const FeaturedJobs = dynamic(() => import("@/components/home/FeaturedJobs/FeaturedJobs"), { ssr: true });
const BlogSections = dynamic(() => import("@/components/home/BlogSections/BlogSections"), { ssr: true });

export const revalidate = 30; // Force dynamic server rendering, no static cache

// API
import {
  getFeaturedJobs,
  getFeaturedInstitutions,
  getTopCities,
  getStats,
  getTestimonials,
  getFAQs,
  getCategories,
} from "@/hooks/useHomepage";
import { getBlogs } from "@/hooks/useBlogs";
import { JsonLd } from '@/components/seo/JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

// Data fetching wrappers for streaming
async function CategoriesWrapper() {
  const categories = await getCategories();
  return <Categories categories={categories || []} />;
}

async function FeaturedInstitutionsWrapper() {
  const institutions = await getFeaturedInstitutions();
  return <FeaturedInstitutions institutions={institutions || []} />;
}

async function BrowseByCityWrapper() {
  const [cities, stats] = await Promise.all([getTopCities(), getStats()]);
  return <BrowseByCity cities={cities || []} totalJobs={stats?.total_jobs} />;
}

async function FeaturedJobsWrapper() {
  const jobs = await getFeaturedJobs();
  return <FeaturedJobs jobs={jobs || []} />;
}

async function HeroStatsWrapper() {
  const stats = await getStats();
  return <HeroStats stats={stats} />;
}

async function TestimonialWrapper() {
  const testimonials = await getTestimonials();
  return <Testimonial testimonials={testimonials || []} />;
}

async function FaqWrapper() {
  const faqs = await getFAQs();
  return <Faq faqs={faqs || []} />;
}

async function BlogSectionsWrapper() {
  const blogs = await getBlogs();
  return <BlogSections blogs={blogs || []} />;
}

export default async function HomePage() {
  // Only fetch critical above-the-fold data blocking the initial render
  const globalData = await getGlobalLayoutData();
  
  const heroCTA = globalData?.heroCTA ?? null;
  const hero = heroCTA?.hero ?? null;
  const cta = heroCTA?.cta ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd schema={generateOrganizationSchema()} />
      <JsonLd schema={generateWebSiteSchema()} />
      
      {/* Hero renders immediately as it uses layout-level cached data */}
      <Hero hero={hero} cta={cta} popularSearches={heroCTA?.popular_searches} />

      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-slate-50" />}>
        <CategoriesWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <FeaturedInstitutionsWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <BrowseByCityWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <FeaturedJobsWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-slate-50" />}>
        <HeroStatsWrapper />
      </Suspense>

      {/* Static components stream instantly */}
      <JobSeekerSteps />
      <Features />
      <EmployerSteps />

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <TestimonialWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <FaqWrapper />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-50" />}>
        <BlogSectionsWrapper />
      </Suspense>
    </div>
  );
}
