import { cache } from "react";
import { BASE_URL, IMAGE_BASE_URL } from "@/services/api/config";
import type {
  ApiResponse,
  NavigationData,
  HeroSection,
  CTASection,
} from "@/types/homepage";

export type FooterLink = {
  id?: number;
  title?: string;
  url?: string;
  icon?: string | null;
};

export type FooterSection = {
  id?: number;
  title?: string;
  links?: FooterLink[];
};

export type FooterTopSearch = {
  id?: number;
  title?: string;
  keyword?: string;
  location?: string;
};

export type FooterData = {
  sections: FooterSection[];
  top_searches: FooterTopSearch[];
  company_logos?: any[];
  company?: any;
};

export type HeroCTAData = {
  hero?: HeroSection | null;
  cta?: CTASection[] | null;
  popular_searches?: { name: string; slug: string }[];
};

/**
 * Utility: Normalize Media URL (Server-side optimized)
 */
function normalizeMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cleanBase = IMAGE_BASE_URL.endsWith("/")
    ? IMAGE_BASE_URL.slice(0, -1)
    : IMAGE_BASE_URL;
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}

/**
 * Native Fetch Wrapper for Server Components
 * Leverages Next.js Data Cache
 */
async function serverFetch<T>(endpoint: string, revalidate = 3600): Promise<T | null> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

function normalizeHeroCTA(raw: any): HeroCTAData {
  const hero = raw?.hero
    ? {
      ...raw.hero,
      background_image: normalizeMediaUrl(raw.hero.background_image),
    }
    : null;

  const rawCta = raw?.cta;
  let ctaItems: any[] = [];
  if (Array.isArray(rawCta)) {
    ctaItems = rawCta;
  } else if (rawCta) {
    ctaItems = [rawCta];
  }

  const cta = ctaItems.map((item) => ({
    ...item,
    background_image: normalizeMediaUrl(item?.background_image),
  }));

  const popular_searches = Array.isArray(raw?.popular_searches) ? raw.popular_searches : [];

  return { hero, cta, popular_searches };
}

async function fetchNavigation(): Promise<NavigationData | null> {
  const res = await serverFetch<ApiResponse<NavigationData>>("/open/home/navigation");
  if (!res) return null;
  
  const rawResponse = res as any;
  const data = res.data ?? rawResponse;
  const menus = Array.isArray(data) ? data : (data?.menus || []);

  return {
    ...(typeof data === 'object' && !Array.isArray(data) ? data : {}),
    menus,
    company_logos: data?.company_logos || rawResponse?.company_logos || [],
  };
}

async function fetchFooter(): Promise<FooterData | null> {
  const res = await serverFetch<ApiResponse<FooterData>>("/open/home/footer");
  if (!res) return null;

  const data = res.data || (res as any);
  const normalized: FooterData = {
    sections: Array.isArray(data?.sections) ? data.sections : [],
    top_searches: Array.isArray(data?.top_searches) ? data.top_searches : [],
    company_logos: data?.company_logos || (res as any)?.company_logos || [],
    company: data?.company || (res as any)?.company || null,
  };

  normalized.sections = normalized.sections.map((s) => ({
    ...s,
    links: Array.isArray(s.links)
      ? s.links.map((l) => ({
        ...l,
        icon: l?.icon ? normalizeMediaUrl(l.icon) : l?.icon ?? null,
      }))
      : [],
  }));

  return normalized;
}

async function fetchHeroCTA(): Promise<HeroCTAData | null> {
  const res = await serverFetch<ApiResponse<any>>("/open/home/hero-section");
  if (!res) return null;
  const data = res.data || (res as any);
  return normalizeHeroCTA(data);
}

const getGlobalLayoutDataCached = cache(async () => {
  const [navigation, footer, heroCTA] = await Promise.all([
    fetchNavigation(),
    fetchFooter(),
    fetchHeroCTA(),
  ]);

  return {
    navigation,
    footer,
    heroCTA,
  };
});

export async function getGlobalLayoutData(): Promise<{
  navigation: NavigationData | null;
  footer: FooterData | null;
  heroCTA: HeroCTAData | null;
}> {
  return getGlobalLayoutDataCached();
}


