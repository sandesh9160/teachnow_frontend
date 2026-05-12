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
  BrowseByCitySkeleton 
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

// Types
import {
  Job,
  Institution,
  City,
  Blog,
  Stats,
  TestimonialData,
  FAQData,
  Category
} from "@/types/homepage";

export default async function HomePage() {
  // Safety defaults for all data sections
  let jobs: Job[] = [];
  let institutions: Institution[] = [];
  let cities: City[] = [];
  let blogs: Blog[] = [];
  let testimonials: TestimonialData[] = [];
  let faqs: FAQData[] = [];
  let categories: Category[] = [];
  let stats: Stats | null = null;
  const { heroCTA } = await getGlobalLayoutData();
  const hero = heroCTA?.hero ?? null;
  const cta = heroCTA?.cta ?? [];

  try {
    const results = await Promise.all([
      getFeaturedJobs(),
      getFeaturedInstitutions(),
      getTopCities(),
      getBlogs(),
      getStats(),
      getTestimonials(),
      getFAQs(),
      getCategories(),
    ]);

    // Safely assign results back to variables
    [jobs, institutions, cities, blogs, stats, testimonials, faqs, categories] = results;
  } catch (error) {
    //console.error("Critical error in HomePage data collection:", error);
    // Page will still render with initialized empty arrays/nulls above
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Hero hero={hero} cta={cta} popularSearches={heroCTA?.popular_searches} />
      {categories && categories.length > 0 && <Categories categories={categories} />}

      {institutions && institutions.length > 0 && <FeaturedInstitutions institutions={institutions} />}
      {cities && cities.length > 0 && <BrowseByCity cities={cities} totalJobs={stats?.total_jobs} />}
      {jobs && jobs.length > 0 && <FeaturedJobs jobs={jobs} />}
      {stats && <HeroStats stats={stats} />}

      <JobSeekerSteps />
      <Features />
      <EmployerSteps />

      {testimonials && testimonials.length > 0 && <Testimonial testimonials={testimonials} />}
      {faqs && faqs.length > 0 && <Faq faqs={faqs} />}
      {blogs && blogs.length > 0 && <BlogSections blogs={blogs} />}
    </div>
  );
}