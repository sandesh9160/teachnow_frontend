export type Resume = {
  id: number | string;
  title?: string | null;
  file_name?: string | null;
  created_at: string;
  is_default?: boolean;
  url?: string | null;
  /** Human-readable file size when API provides it */
  size?: string | null;
};

export type ResumeResponse = {
  status?: boolean;
  data?: Resume | Resume[];
  message?: string;
};
