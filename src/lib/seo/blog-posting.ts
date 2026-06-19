import { BlogPostingSchema } from './types';
import { seoConfig } from './config';

export interface GenerateBlogPostingSchemaProps {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function generateBlogPostingSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName = seoConfig.siteName,
  publisherLogo = seoConfig.logoUrl,
}: GenerateBlogPostingSchemaProps): BlogPostingSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: [
      {
        '@type': 'Person',
        name: authorName,
        url: authorUrl,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
  };
}
