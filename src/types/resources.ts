export interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  pdf: string;
  resource_photo: string;
  author_name: string;
  author_photo: string;
  total_pages: number;
  answer_include: "included" | "not included";
  read_time: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_visible: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceCardProps {
  resource: Resource;
  className?: string;
}
