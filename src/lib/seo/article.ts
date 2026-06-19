import { ArticleSchema } from './types';
import { seoConfig } from './config';

export interface GenerateArticleSchemaProps {
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

export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName = seoConfig.siteName,
  publisherLogo = seoConfig.logoUrl,
}: GenerateArticleSchemaProps): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
