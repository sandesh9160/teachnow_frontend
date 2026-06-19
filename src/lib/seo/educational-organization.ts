import { EducationalOrganizationSchema } from './types';
import { seoConfig } from './config';

export interface GenerateEducationalOrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export function generateEducationalOrganizationSchema({
  name = seoConfig.siteName,
  url = seoConfig.siteUrl,
  logo = seoConfig.logoUrl,
  sameAs = seoConfig.socialProfiles,
  telephone = seoConfig.phone,
  address,
}: GenerateEducationalOrganizationSchemaProps = {}): EducationalOrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name,
    url,
    logo,
    sameAs,
    ...(telephone && { telephone }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress,
        addressLocality: address.addressLocality,
        addressRegion: address.addressRegion,
        postalCode: address.postalCode,
        addressCountry: address.addressCountry,
      },
    }),
  };
}
