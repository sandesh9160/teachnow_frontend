import { Metadata } from 'next';
import { seoConfig } from './config';
import { SeoMetadataProps, ResolveSeoParams } from './types';
import { resolveSeoData } from './resolver';

export function generateCanonical(canonicalUrl?: string): string | undefined {
  return canonicalUrl || undefined;
}

export function generateRobots(robotsStr?: string): Metadata['robots'] {
  if (!robotsStr) return undefined;
  const isNoIndex = robotsStr.includes('noindex');
  const isNoFollow = robotsStr.includes('nofollow');
  return {
    index: !isNoIndex,
    follow: !isNoFollow,
  };
}

export function generateOpenGraph(seoData: SeoMetadataProps): Metadata['openGraph'] {
  return {
    title: seoData.title,
    description: seoData.description,
    url: seoData.canonical,
    siteName: seoConfig.siteName,
    images: seoData.image ? [
      {
        url: seoData.image,
        alt: seoData.imageAlt,
      }
    ] : [],
    type: 'website',
  };
}

export function generateTwitter(seoData: SeoMetadataProps): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    creator: seoConfig.siteName,
    site: seoConfig.siteName,
    images: seoData.image ? [
      {
        url: seoData.image,
        alt: seoData.imageAlt,
      }
    ] : [],
  };
}

export function generateSeoMetadata(params: ResolveSeoParams): Metadata {
  const resolvedSeo = resolveSeoData(params);

  return {
    title: resolvedSeo.title,
    description: resolvedSeo.description,
    keywords: resolvedSeo.keywords,
    alternates: {
      canonical: generateCanonical(resolvedSeo.canonical),
    },
    robots: generateRobots(resolvedSeo.robots),
    openGraph: generateOpenGraph(resolvedSeo),
    twitter: generateTwitter(resolvedSeo),
  };
}
