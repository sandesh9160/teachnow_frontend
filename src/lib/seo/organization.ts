import { OrganizationSchema } from './types';
import { seoConfig } from './config';

export interface GenerateOrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export function generateOrganizationSchema({
  name = seoConfig.siteName,
  url = seoConfig.siteUrl,
  logo = seoConfig.logoUrl,
  sameAs = seoConfig.socialProfiles,
}: GenerateOrganizationSchemaProps = {}): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
    ...(seoConfig.phone || seoConfig.supportEmail ? {
      contactPoint: [
        {
          '@type': 'ContactPoint',
          ...(seoConfig.phone && { telephone: seoConfig.phone }),
          ...(seoConfig.supportEmail && { email: seoConfig.supportEmail }),
          contactType: 'customer support',
        }
      ]
    } : {})
  };
}
