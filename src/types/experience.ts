export interface ExperienceRecord {
  id: number;
  job_seeker_id: number;
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: number | boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperiencePayload {
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean | number;
  description?: string | null;
}
