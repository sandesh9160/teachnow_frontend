import { Suspense } from "react";

// Server Components (imported statically)
import Hero from "@/components/home/Hero/Hero";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";

// Homepage Sections (imported statically to support server rendering and streaming)
import Categories from "@/components/home/Categories/Categories";
import FeaturedInstitutions from "@/components/home/FeaturedInstitutions/FeaturedInstitutions";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import FeaturedJobs from "@/components/home/FeaturedJobs/FeaturedJobs";
import HeroStats from "@/components/home/HeroStats/Herostats";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import Faq from "@/components/home/FAQ/FAQ";
import BlogSections from "@/components/home/BlogSections/BlogSections";


export const revalidate = 30; // Force dynamic server rendering, no static cache


// Skeletons
import {
  CategoriesSkeleton,
  FeaturedInstitutionsSkeleton,
  BrowseByCitySkeleton,
  FeaturedJobsSkeleton,
  HeroStatsSkeleton,
  TestimonialsSkeleton,
  FAQSkeleton,
  BlogsSkeleton,
} from "@/components/home/HomeSkeletons";

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


// Async Data Wrappers for Streaming (always render component to prevent skeleton -> null collapse shifts)
async function CategoriesSection() {
  const categories = await getCategories();
  return <Categories categories={categories || []} />;
}

async function FeaturedInstitutionsSection() {
  const institutions = await getFeaturedInstitutions();
  return <FeaturedInstitutions institutions={institutions || []} />;
}

async function FeaturedJobsSection() {
  const jobs = await getFeaturedJobs();
  return <FeaturedJobs jobs={jobs || []} />;
}

async function BrowseByCitySection() {
  const [cities, stats] = await Promise.all([getTopCities(), getStats()]);
  return <BrowseByCity cities={cities || []} totalJobs={stats?.total_jobs} />;
}

async function StatsSection() {
  const stats = await getStats();
  return <HeroStats stats={stats} />;
}

async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  return <Testimonial testimonials={testimonials || []} />;
}

async function FAQSection() {
  const faqs = await getFAQs();
  return <Faq faqs={faqs || []} />;
}

async function BlogsSection() {
  const blogs = await getBlogs();
  return <BlogSections blogs={blogs || []} />;
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

      <JobSeekerSteps />

      <Features />

      <EmployerSteps />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>

      <Suspense fallback={<BlogsSkeleton />}>
        <BlogsSection />
      </Suspense>
    </div>
  );
}
