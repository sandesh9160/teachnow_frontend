import FeaturedInstitutions from "@/components/home/FeaturedInstitutions/FeaturedInstitutions";
import FeaturedJobs from "@/components/home/FeaturedJobs/FeaturedJobs";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import Faq from "@/components/home/FAQ/FAQ";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import BlogSections from "@/components/home/BlogSections/BlogSections";

export const revalidate = 0; // Force dynamic server rendering, no static cache

// Components
import Hero from "@/components/home/Hero/Hero";
import HeroStats from "@/components/home/HeroStats/Herostats";
import Categories from "@/components/home/Categories/Categories";

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
      
      <CategoriesSection />

      <FeaturedInstitutionsSection />

      <BrowseByCitySection />

      <FeaturedJobsSection />

      <StatsSection />

      <JobSeekerSteps />
      
      <Features />
      
      <EmployerSteps />

      <TestimonialsSection />

      <FAQSection />

      <BlogsSection />
    </div>
  );
}
