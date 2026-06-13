import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";


import Hero from "@/components/home/Hero/Hero";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";


import dynamic from "next/dynamic";

const Categories = dynamic(() => import("@/components/home/Categories/Categories"));
const FeaturedInstitutions = dynamic(() => import("@/components/home/FeaturedInstitutions/FeaturedInstitutions"));
const BrowseByCity = dynamic(() => import("@/components/home/BrowseByCity/BrowseByCity"));
const FeaturedJobs = dynamic(() => import("@/components/home/FeaturedJobs/FeaturedJobs"));
const HeroStats = dynamic(() => import("@/components/home/HeroStats/Herostats"));
const Testimonial = dynamic(() => import("@/components/home/Testimonial/Testimonial"));
const Faq = dynamic(() => import("@/components/home/FAQ/FAQ"));
const BlogSections = dynamic(() => import("@/components/home/BlogSections/BlogSections"));
const ExploreTutors = dynamic(() => import("@/components/home/ExploreTutors/ExploreTutors"));

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


export default async function HomePage() {
  // Fetch all sections concurrently on the server
  const [
    globalData,
    categories,
    institutions,
    jobs,
    cities,
    stats,
    testimonials,
    faqs,
    blogs,
  ] = await Promise.all([
    getGlobalLayoutData(),
    getCategories(),
    getFeaturedInstitutions(),
    getFeaturedJobs(),
    getTopCities(),
    getStats(),
    getTestimonials(),
    getFAQs(),
    getBlogs(),
  ]);

  const heroCTA = globalData?.heroCTA ?? null;
  const hero = heroCTA?.hero ?? null;
  const cta = heroCTA?.cta ?? [];

  console.log("heroCTA", heroCTA);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero renders immediately as it uses layout-level cached data */}
      <Hero hero={hero} cta={cta} popularSearches={heroCTA?.popular_searches} />

      <Categories categories={categories || []} />

      <FeaturedInstitutions institutions={institutions || []} />

      <BrowseByCity cities={cities || []} totalJobs={stats?.total_jobs} />

      <FeaturedJobs jobs={jobs || []} />

      <HeroStats stats={stats} />

      <JobSeekerSteps />

      <Features />

      <EmployerSteps />

      <Testimonial testimonials={testimonials || []} />

      <Faq faqs={faqs || []} />

      <BlogSections blogs={blogs || []} />

      <ExploreTutors />
    </div>
  );
}
