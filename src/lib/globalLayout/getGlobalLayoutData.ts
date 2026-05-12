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

/**
 * Navigation Mapping Utilities (Server-side)
 */

function resolveMenuHref(menu: any, parent?: any): string {
  if (!menu) return "#";
  let rawUrl = String(menu.url || "").trim();
  const slug = String(menu.slug || "").trim().replace(/^\/+|\/+$/g, "");
  const parentSlug = String(parent?.slug || "").trim().toLowerCase();

  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith("open/")) rawUrl = "/" + rawUrl.replace(/^open\//, "");
  else if (rawUrl.startsWith("/open/")) rawUrl = rawUrl.replace(/^\/open\//, "/");

  if (parentSlug === "jobs" && slug) return `/jobs/${slug}`;
  if ((parentSlug === "institutes" || parentSlug === "institutions") && slug) return `/institutions/${slug}`;

  if (slug && !["categories", "institutes", "institutions", "company", "employer"].includes(slug.toLowerCase())) {
     if (slug.toLowerCase() === "jobs") return "/jobs";
     return `/${slug}`;
  }
  return rawUrl || "/";
}

function mapNavigationData(navData: NavigationData | null): any[] {
  if (!navData?.menus) return [];
  const allMenusFlattened: any[] = [];
  const flatten = (items: any[]) => {
    if (!Array.isArray(items)) return;
    items.forEach(item => {
      allMenusFlattened.push(item);
      const kids = item.children || item.children_recursive || [];
      if (kids.length > 0) flatten(kids);
    });
  };
  flatten(navData.menus);

  const menuMap = new Map<number, any>();
  allMenusFlattened.forEach((m: any) => {
    const mChildren = m.children || m.children_recursive || [];
    menuMap.set(m.id, { ...m, _children: [...mChildren] });
  });

  const mapItem = (item: any, parent?: any): any => {
    const syncedItem = menuMap.get(item.id) || item;
    const children = (syncedItem._children || [])
      .filter((c: any) => c.is_active === 1 && c.show_in_nav === 1)
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

    const mappedChildren = children.map((c: any) => mapItem(c, syncedItem));
    return {
      ...syncedItem,
      url: resolveMenuHref(syncedItem, parent),
      children: mappedChildren,
      hasChildren: mappedChildren.length > 0,
      hasGrandChildren: mappedChildren.some((c: any) => c.hasChildren)
    };
  };

  return Array.from(menuMap.values())
    .filter((m: any) => m.is_active === 1 && (!m.parent_id || m.parent_id === null) && (m.show_in_nav === 1 || m.slug?.toLowerCase().includes("job") || m.title?.toLowerCase().includes("job")))
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((root: any) => {
      const mapped = mapItem(root);
      const slug = String(root.slug || "").toLowerCase();
      const title = String(root.title || "").toLowerCase();
      const isJobsMenu = slug.includes("jobs") || title.includes("job");
      const isInstitutionsMenu = ["institutes", "institutions"].includes(slug);
      const isMega = isJobsMenu || isInstitutionsMenu || mapped.hasGrandChildren;

      let structure: any = null;
      if (mapped.hasChildren) {
        structure = isMega ? { sections: mapped.children } : mapped.children;
      }

      return {
        ...mapped,
        isMega: isMega && !!structure && !Array.isArray(structure),
        isJobs: isJobsMenu,
        structure
      };
    });
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

async function fetchNavigation(): Promise<any | null> {
  const res = await serverFetch<ApiResponse<NavigationData>>("/open/home/navigation");
  if (!res) return null;
  
  const rawResponse = res as any;
  const data = res.data ?? rawResponse;
  const menus = Array.isArray(data) ? data : (data?.menus || []);
  
  const navData = {
    ...(typeof data === 'object' && !Array.isArray(data) ? data : {}),
    menus,
    company_logos: data?.company_logos || rawResponse?.company_logos || [],
  };

  return {
    ...navData,
    mappedMenus: mapNavigationData(navData)
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


