export type RecentApplication = {
  job_id: number;
  title: string;
  company_name: string;
  company_logo?: string | null;
  status: string;
  applied_at: string;
};

export type DashboardStats = {
  total_applied: number;
  total_shortlisted: number;
  total_bookmarked: number;
  recent_applications: RecentApplication[];
};

export type DashboardResponse = {
  status: boolean;
  data: DashboardStats;
};
