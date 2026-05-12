import { Suspense } from "react";
import nextDynamic from "next/dynamic";

export const revalidate = 60; // Revalidate every 60 seconds

// Components
import Hero from "@/components/home/Hero/Hero";
import HeroStats from "@/components/home/HeroStats/Herostats";
import Categories from "@/components/home/Categories/Categories";

// Dynamic Components (Deferred)
// Home Skeletons
import { 
  FeaturedJobsSkeleton,
  FeaturedInstitutionsSkeleton, 
  BrowseByCitySkeleton,
  CategoriesSkeleton,
  HeroStatsSkeleton
} from "@/components/home/HomeSkeletons";

// Dynamic Components (Deferred)
const FeaturedInstitutions = nextDynamic(() => import("@/components/home/FeaturedInstitutions/FeaturedInstitutions"), {
  loading: () => <FeaturedInstitutionsSkeleton />
});
const FeaturedJobs = nextDynamic(() => import("@/components/home/FeaturedJobs/FeaturedJobs"), {
  loading: () => <FeaturedJobsSkeleton />
});
const JobSeekerSteps = nextDynamic(() => import("@/components/home/Steps/JobSeekerSteps"));
const EmployerSteps = nextDynamic(() => import("@/components/home/Steps/EmployerSteps"));
const Features = nextDynamic(() => import("@/components/home/Features/Features"));
const BrowseByCity = nextDynamic(() => import("@/components/home/BrowseByCity/BrowseByCity"), {
  loading: () => <BrowseByCitySkeleton />
});
const Faq = nextDynamic(() => import("@/components/home/FAQ/FAQ"));
const Testimonial = nextDynamic(() => import("@/components/home/Testimonial/Testimonial"));
const BlogSections = nextDynamic(() => import("@/components/home/BlogSections/BlogSections"));

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

import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";


// Async Data Wrappers for Streaming
async function CategoriesSection() {
  const categories = await getCategories();
  if (!categories || categories.length === 0) return null;
  return <Categories categories={categories} />;
}

async function FeaturedInstitutionsSection() {
  const institutions = await getFeaturedInstitutions();
  if (!institutions || institutions.length === 0) return null;
  return <FeaturedInstitutions institutions={institutions} />;
}

async function FeaturedJobsSection() {
  const jobs = await getFeaturedJobs();
  if (!jobs || jobs.length === 0) return null;
  return <FeaturedJobs jobs={jobs} />;
}

async function BrowseByCitySection() {
  const [cities, stats] = await Promise.all([getTopCities(), getStats()]);
  if (!cities || cities.length === 0) return null;
  return <BrowseByCity cities={cities} totalJobs={stats?.total_jobs} />;
}

async function StatsSection() {
  const stats = await getStats();
  if (!stats) return null;
  return <HeroStats stats={stats} />;
}

async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  if (!testimonials || testimonials.length === 0) return null;
  return <Testimonial testimonials={testimonials} />;
}

async function FAQSection() {
  const faqs = await getFAQs();
  if (!faqs || faqs.length === 0) return null;
  return <Faq faqs={faqs} />;
}

async function BlogsSection() {
  const blogs = await getBlogs();
  if (!blogs || blogs.length === 0) return null;
  return <BlogSections blogs={blogs} />;
}

export default async function HomePage() {
  const { heroCTA } = await getGlobalLayoutData();
  const hero = heroCTA?.hero ?? null;
  const cta = heroCTA?.cta ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero renders immediately as it uses layout-level cached data */}
      <Hero hero={hero} cta={cta} popularSearches={heroCTA?.popular_searches} />
      
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <Suspense fallback={<FeaturedInstitutionsSkeleton />}>
        <FeaturedInstitutionsSection />
      </Suspense>

      <Suspense fallback={<BrowseByCitySkeleton />}>
        <BrowseByCitySection />
      </Suspense>

      <Suspense fallback={<FeaturedJobsSkeleton />}>
        <FeaturedJobsSection />
      </Suspense>

      <Suspense fallback={<HeroStatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Static-data sections still deferred for better FCP/LCP focus */}
      <Suspense fallback={null}>
        <JobSeekerSteps />
      </Suspense>
      
      <Suspense fallback={null}>
        <Features />
      </Suspense>
      
      <Suspense fallback={null}>
        <EmployerSteps />
      </Suspense>

      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>

      <Suspense fallback={null}>
        <BlogsSection />
      </Suspense>
    </div>
  );
}