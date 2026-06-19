import { seoConfig } from './config';
import { ResolveSeoParams, SeoMetadataProps } from './types';

export function resolveSeoData({ apiSeo = {}, pageFallback = {}, path = '' }: ResolveSeoParams): SeoMetadataProps {
  
  // Title Rules
  const siteDefaultTitle = seoConfig.siteName;
  const title = apiSeo.title || pageFallback.title || siteDefaultTitle;

  // Description Rules
  const siteDefaultDescription = seoConfig.siteDescription;
  const description = apiSeo.description || pageFallback.description || siteDefaultDescription;

  // Keywords Rules
  const defaultKeywords = `${title}, ${seoConfig.siteName}, education, teaching`;
  const keywords = apiSeo.keywords || pageFallback.keywords || defaultKeywords;

  // Robots Rules
  const robots = apiSeo.robots || pageFallback.robots || 'index, follow';

  // Canonical Rules
  const generatedCanonical = seoConfig.siteUrl && path ? `${seoConfig.siteUrl}${path}` : '';
  const canonical = apiSeo.canonical || generatedCanonical;

  // Image Rules
  let image = apiSeo.image || pageFallback.image || seoConfig.defaultOgImage || seoConfig.logoUrl;
  
  // Automatically convert relative URLs into absolute URLs using siteUrl
  if (image && image.startsWith('/')) {
    const cleanSiteUrl = seoConfig.siteUrl.endsWith('/') ? seoConfig.siteUrl.slice(0, -1) : seoConfig.siteUrl;
    image = `${cleanSiteUrl}${image}`;
  }

  // Image Alt Rules - Never allow imageAlt to be empty
  const imageAlt = apiSeo.imageAlt || pageFallback.imageAlt || title || seoConfig.siteName || 'Image';

  return {
    title,
    description,
    keywords,
    robots,
    canonical,
    image,
    imageAlt,
  };
}
