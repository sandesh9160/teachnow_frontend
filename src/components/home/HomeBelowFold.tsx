import Categories from "@/components/home/Categories/Categories";
import FeaturedInstitutions from "@/components/home/FeaturedInstitutions/FeaturedInstitutions";
import FeaturedJobs from "@/components/home/FeaturedJobs/FeaturedJobs";
import JobSeekerSteps from "@/components/home/Steps/JobSeekerSteps";
import EmployerSteps from "@/components/home/Steps/EmployerSteps";
import Features from "@/components/home/Features/Features";
import BrowseByCity from "@/components/home/BrowseByCity/BrowseByCity";
import Faq from "@/components/home/FAQ/FAQ";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import BlogSections from "@/components/home/BlogSections/BlogSections";
import HeroStats from "@/components/home/HeroStats/Herostats";
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

export default async function HomeBelowFold() {
  const results = await Promise.allSettled([
    getCategories(),
    getFeaturedInstitutions(),
    getFeaturedJobs(),
    getTopCities(),
    getStats(),
    getTestimonials(),
    getFAQs(),
    getBlogs(),
  ]);

  const categories = results[0].status === "fulfilled" ? results[0].value : [];
  const institutions = results[1].status === "fulfilled" ? results[1].value : [];
  const jobs = results[2].status === "fulfilled" ? results[2].value : [];
  const cities = results[3].status === "fulfilled" ? results[3].value : [];
  const stats = results[4].status === "fulfilled" ? results[4].value : null;
  const testimonials = results[5].status === "fulfilled" ? results[5].value : [];
  const faqs = results[6].status === "fulfilled" ? results[6].value : [];
  const blogs = results[7].status === "fulfilled" ? results[7].value : [];

  return (
    <>
      {categories.length > 0 && <Categories categories={categories} />}
      {institutions.length > 0 && <FeaturedInstitutions institutions={institutions} />}
      {cities.length > 0 && <BrowseByCity cities={cities} totalJobs={stats?.total_jobs} />}
      {jobs.length > 0 && <FeaturedJobs jobs={jobs} />}
      {stats && <HeroStats stats={stats} />}
      <JobSeekerSteps />
      <Features />
      <EmployerSteps />
      {testimonials.length > 0 && <Testimonial testimonials={testimonials} />}
      {faqs.length > 0 && <Faq faqs={faqs} />}
      {blogs.length > 0 && <BlogSections blogs={blogs} />}
    </>
  );
}
