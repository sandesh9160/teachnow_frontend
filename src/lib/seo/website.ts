import { WebSiteSchema } from './types';
import { seoConfig } from './config';

export interface GenerateWebSiteSchemaProps {
  name?: string;
  url?: string;
  searchActionUrl?: string;
  queryInputName?: string;
}

export function generateWebSiteSchema({
  name = seoConfig.siteName,
  url = seoConfig.siteUrl,
  searchActionUrl = seoConfig.siteUrl ? `${seoConfig.siteUrl}/search?q={search_term_string}` : '',
  queryInputName = 'required name=search_term_string',
}: GenerateWebSiteSchemaProps = {}): WebSiteSchema {
  const schema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  };

  if (searchActionUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: searchActionUrl,
      'query-input': queryInputName,
    };
  }

  return schema;
}
