export type EmployerProfile = {
  id: number;
  company_name: string;
  company_description: string | null;
  industry: string | null;
  institution_type: string | null;
  website: string | null;
  role: string;
  company_logo: string | null;
  address: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  is_profile_verified: number;
  map_link: string | null;
  is_verified: number;
  is_featured: number;
  slug: string;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_title: string | null;
  created_at: string;
  updated_at: string;
  company_featured: number;
  latitude: string | null;
  longitude: string | null;
};

export type EmployerProfileResponse = {
  status: boolean;
  data: EmployerProfile;
};
