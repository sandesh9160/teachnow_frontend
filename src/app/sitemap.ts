import { MetadataRoute } from 'next';
import { getStaticSitemapRoutes, buildDynamicSitemapRoute } from '@/lib/seo';
import { fetchAPI } from '@/services/api/client';
import { ApiResponse } from '@/types/homepage';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = getStaticSitemapRoutes();

  // We could fetch dynamic routes here to build out the sitemap fully
  // Example for jobs (assuming an endpoint exists or we fetch the latest 100)
  try {
    const res = await fetchAPI<ApiResponse<any>>('/open/jobs?per_page=100');
    const jobs = res?.data?.data || res?.data || [];
    
    if (Array.isArray(jobs)) {
      const dynamicJobRoutes = jobs.map((job: any) => 
        buildDynamicSitemapRoute('/jobs', job.slug || String(job.id))
      );
      return [...staticRoutes, ...dynamicJobRoutes];
    }
  } catch (err) {
    // Proceed with static routes if fetch fails
  }

  return staticRoutes;
}
