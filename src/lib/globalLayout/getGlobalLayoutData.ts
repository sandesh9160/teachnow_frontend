import { cache } from "react";
import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";
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
};

export type HeroCTAData = {
  hero?: HeroSection | null;
  cta?: CTASection[] | null;
};

const REVALIDATE_SECONDS = 60;

function normalizeHeroCTA(raw: any): HeroCTAData {
  const hero = raw?.hero
    ? {
        ...raw.hero,
        background_image: normalizeMediaUrl(raw.hero.background_image),
      }
    : null;

  // API is expected to return `cta: [{ ... }]`
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

  return { hero, cta };
}

async function fetchNavigation(): Promise<NavigationData | null> {
  try {
    const res = await fetchAPI<ApiResponse<NavigationData>>("/open/home/navigation", {
      revalidate: REVALIDATE_SECONDS,
    });
    return res.data || (res as any);
  } catch {
    return null;
  }
}

async function fetchFooter(): Promise<FooterData | null> {
  try {
    const res = await fetchAPI<ApiResponse<FooterData>>("/open/home/footer", {
      revalidate: REVALIDATE_SECONDS,
    });
    const data = res.data || (res as any);
    const normalized: FooterData = {
      sections: Array.isArray(data?.sections) ? data.sections : [],
      top_searches: Array.isArray(data?.top_searches) ? data.top_searches : [],
    };

    // Normalize icon URLs
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
  } catch {
    return null;
  }
}

async function fetchHeroCTA(): Promise<HeroCTAData | null> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/hero-section", {
      revalidate: REVALIDATE_SECONDS,
    });
    const data = res.data || (res as any);
    return normalizeHeroCTA(data);
  } catch {
    return null;
  }
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

