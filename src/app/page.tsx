import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// Components
import Hero from "@/components/home/Hero/Hero";
import HeroStats from "@/components/home/HeroStats/Herostats";
import Categories from "@/components/home/Categories/Categories";
import FeaturedInstitutions from "@/components/home/FeaturedInstitutions/FeaturedInstitutions";
import FeaturedJobs from "@/components/home/FeaturedJobs/FeaturedJobs";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import Faq from "@/components/home/FAQ/FAQ";

// Lazy
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
    <main className="flex flex-col min-h-screen">
      {hero && <Hero hero={hero} cta={cta} />}
      {categories && categories.length > 0 && <Categories categories={categories} />}

      {institutions && institutions.length > 0 && <FeaturedInstitutions institutions={institutions} />}
      {cities && cities.length > 0 && <BrowseByCity cities={cities} />}
      {jobs && jobs.length > 0 && <FeaturedJobs jobs={jobs} />}
      {stats && <HeroStats stats={stats} />}

      <JobSeekerSteps />
      <Features />
      <EmployerSteps />

      {testimonials && testimonials.length > 0 && <Testimonial testimonials={testimonials} />}
      {blogs && blogs.length > 0 && <BlogSections blogs={blogs} />}

      {faqs && faqs.length > 0 && <Faq faqs={faqs} />}
    </main>
  );
}