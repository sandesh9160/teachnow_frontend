export const seoConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || '',
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
  logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO || '',
  defaultOgImage: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || '',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  socialProfiles: [
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
  ].filter(Boolean) as string[],
};
