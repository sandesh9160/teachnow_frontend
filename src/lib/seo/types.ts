export type SchemaContext = 'https://schema.org';

export interface BaseSchema {
  '@context'?: SchemaContext;
  '@type': string;
  '@id'?: string;
  identifier?: string;
}

export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    email?: string;
    contactType: string;
  }[];
}

export interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface BreadcrumbListSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }[];
}

export interface CollectionPageSchema extends BaseSchema {
  '@type': 'CollectionPage';
  name: string;
  url: string;
  description?: string;
}

export interface JobPostingSchema extends BaseSchema {
  '@type': 'JobPosting';
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType: string | string[];
  hiringOrganization: {
    '@type': 'Organization';
    name: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      streetAddress?: string;
      addressLocality: string;
      addressRegion: string;
      postalCode?: string;
      addressCountry: string;
    };
  };
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: {
      '@type': 'QuantitativeValue';
      value?: number;
      minValue?: number;
      maxValue?: number;
      unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    };
  };
}

export interface BlogPostingSchema extends BaseSchema {
  '@type': 'BlogPosting';
  headline: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  }[];
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  description: string;
}

export interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  }[];
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  description: string;
}

export interface FAQPageSchema extends BaseSchema {
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export interface EducationalOrganizationSchema extends BaseSchema {
  '@type': 'EducationalOrganization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  telephone?: string;
}

// SEO Metadata Types
export interface SeoMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
}

export interface ResolveSeoParams {
  apiSeo?: SeoMetadataProps;
  pageFallback?: SeoMetadataProps;
  path?: string;
}
