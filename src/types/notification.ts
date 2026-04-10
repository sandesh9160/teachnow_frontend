export interface NotificationData {
  job_id?: number;
  application_id?: number;
  [key: string]: any;
}

export interface Notification {
  id: number;
  notifiable_type: string;
  notifiable_id: number;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPagination {
  current_page: number;
  data: Notification[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface NotificationResponse {
  status: boolean;
  data: NotificationPagination;
  message?: string;
}
