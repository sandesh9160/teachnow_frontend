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
import ExploreTutors from "@/components/home/ExploreTutors/ExploreTutors";
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
