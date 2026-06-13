import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";


import Hero from "@/components/home/Hero/Hero";
import dynamic from "next/dynamic";

// Homepage Sections (dynamically imported with SSR enabled to defer client JS loading)
const Categories = dynamic(() => import("@/components/home/Categories/Categories"), { ssr: true });
const FeaturedInstitutions = dynamic(() => import("@/components/home/FeaturedInstitutions/FeaturedInstitutions"), { ssr: true });
const BrowseByCity = dynamic(() => import("@/components/home/BrowseByCity/BrowseByCity"), { ssr: true });
const FeaturedJobs = dynamic(() => import("@/components/home/FeaturedJobs/FeaturedJobs"), { ssr: true });
const HeroStats = dynamic(() => import("@/components/home/HeroStats/Herostats"), { ssr: true });
const JobSeekerSteps = dynamic(() => import("@/components/home/Steps/JobSeekerSteps"), { ssr: true });
const Features = dynamic(() => import("@/components/home/Features/Features"), { ssr: true });
const EmployerSteps = dynamic(() => import("@/components/home/Steps/EmployerSteps"), { ssr: true });
const Testimonial = dynamic(() => import("@/components/home/Testimonial/Testimonial"), { ssr: true });
const Faq = dynamic(() => import("@/components/home/FAQ/FAQ"), { ssr: true });
const BlogSections = dynamic(() => import("@/components/home/BlogSections/BlogSections"), { ssr: true });
const ExploreTutors = dynamic(() => import("@/components/home/ExploreTutors/ExploreTutors"), { ssr: true });

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
