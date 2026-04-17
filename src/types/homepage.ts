
export type Job = {
  id: number;
  title: string;
  description?: string;
  employer: {
    id?: number;
    company_name: string;
    company_logo: string;
    slug?: string;
    institution_type?: string;
  };
  institution_type?: string;
  employer_id?: number;
  location: string;
  job_type: string;
  slug?: string | null;
  salary_min: string;
  salary_max: string;
  experience_required: number;
  vacancies?: number;
  job_status?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  similar_jobs?: Job[];
  cover_letter_question_id?: number;
  screening_questions?: { id: number; question: string }[];
  questions?: { 
    id: number; 
    job_id: number;
    question: string; 
    question_type: "boolean" | "numeric" | "text" | string;
    recruiter_answer?: string;
  }[];
  category?: {
    id: number;
    name: string;
    slug?: string;
  };
};


export type Institution = {
  id: number;
  company_name: string;
  company_logo: string;
  slug: string;
  company_description?: string;
  description?: string;
  location?: string;
  address?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  website?: string;
  industry?: string;
  founded_in?: string;
  employee_count?: string;
  institution_type?: string;
  is_verified?: number;
  is_featured?: number;
  associated_jobs?: Job[];
  jobs_count?: number;
  latitude?: string | null;
  longitude?: string | null;
  map_link?: string | null;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  image: string;
  category: string;
  content?: string;
  author?: string;
  date?: string;
  readTime?: string;
  created_at?: string;
  excerpt?: string; // Added excerpt for BlogCard/BlogSections
  // slug: string;
  icon?: string | null;
  jobs_count?: number;
};



export type HeroSection = {
  id?: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  background_image: string;
  trust_text?: string | null;
  is_active?: number;
};

export type CTASection = {
  id?: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  background_image: string;
  is_active?: number;
};

export type HeroResponse = {
  status: boolean;
  data: {
    hero: HeroSection;
    cta: CTASection[];
  };
};

export type Stats = {
  total_jobs: number;
  total_companies: number;
  total_candidates: number;
  total_recruiters: number;
};

export type TestimonialData = {
  id: number;
  name: string;
  designation: string;
  company: string;
  photo?: string | null;
  message: string;
  rating?: number | null;
};

export type FAQData = {
  question: string;
  answer: string;
};

export type City = {
  id: number;
  name: string;
  image: string;
  jobs_count?: number;
};

export type Category = {
  id: number;
  name: string;
  slug?: string;
  icon?: string | null;
  jobs_count?: number;
};

export type ResourceData = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  pdf?: string | null;
  resource_photo?: string | null;
  author_name?: string | null;
  author_photo?: string | null;
  total_pages?: number | null;
  read_time?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  is_visible?: number;
  is_featured?: number;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  status: boolean | number;
  message?: string;
  data: T;
  total?: number;
};

export type Menu = {
  id: number;
  parent_id: number | null;
  title: string;
  url: string;
  display_order: number;
  show_in_nav: number;
  is_active: number;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
  children_recursive: Menu[];
};

export type NavigationData = {
  menus: Menu[];
  companies?: {
    total: number;
    list: any[];
  };
  company_logos?: any[];
  company?: any;
};
