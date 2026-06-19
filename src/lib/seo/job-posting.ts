import { JobPostingSchema } from './types';
import { seoConfig } from './config';

export interface GenerateJobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganizationName?: string;
  hiringOrganizationUrl?: string;
  hiringOrganizationLogo?: string;
  location: {
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
    streetAddress?: string;
    postalCode?: string;
  };
  baseSalary?: {
    currency?: string;
    minValue?: number;
    maxValue?: number;
    value?: number;
    unitText?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
}

export function generateJobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  hiringOrganizationName = seoConfig.siteName,
  hiringOrganizationUrl = seoConfig.siteUrl,
  hiringOrganizationLogo = seoConfig.logoUrl,
  location,
  baseSalary,
}: GenerateJobPostingSchemaProps): JobPostingSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    validThrough,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: hiringOrganizationName,
      sameAs: hiringOrganizationUrl,
      logo: hiringOrganizationLogo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.addressLocality,
        addressRegion: location.addressRegion,
        addressCountry: location.addressCountry,
        streetAddress: location.streetAddress,
        postalCode: location.postalCode,
      },
    },
    ...(baseSalary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: baseSalary.currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          ...(baseSalary.value !== undefined ? { value: baseSalary.value } : {}),
          ...(baseSalary.minValue !== undefined ? { minValue: baseSalary.minValue } : {}),
          ...(baseSalary.maxValue !== undefined ? { maxValue: baseSalary.maxValue } : {}),
          unitText: baseSalary.unitText || 'YEAR',
        },
      },
    }),
  };
}
