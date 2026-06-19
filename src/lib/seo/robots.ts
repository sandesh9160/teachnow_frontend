import { MetadataRoute } from 'next';
import { seoConfig } from './config';

export function generateRobotsConfig(): MetadataRoute.Robots {
  const siteUrl = seoConfig.siteUrl;
  const baseUrl = siteUrl ? (siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl) : '';

  const config: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/auth/',
        '/api/',
        '/apply/',
      ],
    },
  };

  if (baseUrl) {
    config.sitemap = `${baseUrl}/sitemap.xml`;
  }

  return config;
}
