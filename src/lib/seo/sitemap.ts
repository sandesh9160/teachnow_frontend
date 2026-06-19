import { MetadataRoute } from 'next';
import { seoConfig } from './config';

export function getStaticSitemapRoutes(): MetadataRoute.Sitemap {
  const siteUrl = seoConfig.siteUrl || 'https://teachnow.in';
  const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  
  const staticPaths = [
    '',
    '/about-us',
    '/contact-us',
    '/faqs',
    '/hire-now',
    '/institutions',
    '/jobs',
    '/blogs',
    '/resources',
    '/pricing-plans',
    '/privacy-policy',
    '/terms-and-conditions',
  ];

  return staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));
}

export function buildDynamicSitemapRoute(routePrefix: string, slug: string): MetadataRoute.Sitemap[number] {
  const siteUrl = seoConfig.siteUrl || 'https://teachnow.in';
  const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  return {
    url: `${baseUrl}${routePrefix}/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.6,
  };
}
