import React from "react";
import type { 
  Job, 
  Institution, 
  HeroSection, 
  CTASection,
  Category, 
  Stats,
  TestimonialData,
  Blog,
  FAQData
} from "./homepage";

/**
 * Props for the JobCard component.
 * @example
 * <JobCard title="Math Teacher" company="DPS" ... />
 */
export interface JobCardProps {
  id?: number | string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  tags: string[];
   posted: string | number | Date;
  slug?: string | null;
  logo?: string;
}

/**
 * Props for the CompanyCard component.
 */
export interface CompanyCardProps {
  name: string;
  type?: string;
  location: string;
  openJobs?: number;
  slug?: string;
  logo?: string;
}

/**
 * Props for the FeaturedJobs section.
 */
export interface FeaturedJobsProps {
  jobs: Job[];
}

/**
 * Props for the FeaturedInstitutions section.
 */
export type FeaturedInstitutionsProps = {
  institutions: Institution[];
};

/**
 * Props for the Hero section.
 */
export interface HeroProps {
  hero: HeroSection;
  cta?: CTASection[] | null;
}

/**
 * Props for the Categories section.
 */
export interface CategoriesProps {
  categories: Category[];
}

/**
 * Props for the HeroStats section.
 */
export interface HeroStatsProps {
  stats: Stats;
}

/**
 * Props for the Testimonial section.
 */
export interface TestimonialProps {
  testimonials: TestimonialData[];
}

/**
 * Props for the BlogSections.
 */
export interface BlogSectionsProps {
  blogs: Blog[];
}

/**
 * Props for the FAQ section.
 */
export interface FAQProps {
  faqs: FAQData[];
}

/**
 * Utility type to retrieve the props a component accepts without its ref.
 * @template T - The component type or tag name.
 */
export type ComponentPropsWithoutRef<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;
