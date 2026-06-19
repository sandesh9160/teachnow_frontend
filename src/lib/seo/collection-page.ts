import { CollectionPageSchema } from './types';
import { seoConfig } from './config';

export interface GenerateCollectionPageSchemaProps {
  name: string;
  url: string;
  description?: string;
}

export function generateCollectionPageSchema({
  name,
  url,
  description = seoConfig.siteDescription,
}: GenerateCollectionPageSchemaProps): CollectionPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: url.startsWith('http') ? url : `${seoConfig.siteUrl}${url}`,
    ...(description && { description }),
  };
}
