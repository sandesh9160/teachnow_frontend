import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { normalizeMediaUrl } from "@/services/api/client";

// Server Components (imported statically)
import Hero from "@/components/home/Hero/Hero";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";

// Homepage Sections (imported statically to support server rendering)
import Categories from "@/components/home/Categories/Categories";
import FeaturedInstitutions from "@/components/home/FeaturedInstitutions/FeaturedInstitutions";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import FeaturedJobs from "@/components/home/FeaturedJobs/FeaturedJobs";
import HeroStats from "@/components/home/HeroStats/Herostats";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import Faq from "@/components/home/FAQ/FAQ";
import BlogSections from "@/components/home/BlogSections/BlogSections";

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
  const heroImageUrl = hero?.background_image ? normalizeMediaUrl(hero.background_image) : null;

  return (
    <div className="flex flex-col min-h-screen">
      {heroImageUrl && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}
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
    </div>
  );
}
