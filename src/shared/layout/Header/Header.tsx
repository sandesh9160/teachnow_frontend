"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationData, Menu as NavMenu } from "@/types/homepage";
import type { DashboardRole } from "@/types/session";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import type { FooterData } from "@/lib/globalLayout/getGlobalLayoutData";
import { normalizeMediaUrl } from "@/services/api/client";



// --- Sub-components for better modularity and less repetition ---

const MegaMenu = ({
  label,
  data,
  active,
  onToggle,
  onClose,
  isMobile,
  isJobs
}: Readonly<{
  label: string,
  data: any,
  active: boolean,
  onToggle: () => void,
  onClose: () => void,
  isMobile: boolean,
  isJobs?: boolean
}>) => {
  if (!data?.sections) return null;

  const sidebars = data.sections.filter((s: any) => s.slug === "categories") || [];
  const panels = data.sections.filter((s: any) => s.slug !== "categories") || [];

  if (isMobile) {
    return (
      <>
        <button
          onClick={onToggle}
          suppressHydrationWarning
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
        {active && (
          <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {sidebars.map((sb: any) => (
              <div key={sb.title} className="pt-2">
                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{sb.title}</p>
                {sb.links.map((link: any) => (
                  <Link key={link.label} href={link.href} onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            {panels.map((panel: any) => (
              <div key={panel.title} className="pt-2">
                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{panel.title}</p>
                {panel.links.map((link: any) => (
                  <Link key={link.label} href={link.href} onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${active ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
      >
        {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
      </button>
      {active && (
        <div className="absolute left-0 top-full mt-2 w-[800px] rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="flex gap-10">
            {sidebars.map((sb: any) => (
              <div key={sb.title} className="w-56 border-r border-border pr-8">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{sb.title}</p>
                <div className="space-y-0.5">
                  {sb.links.map((link: any) => (
                    <Link key={link.label} href={link.href} onClick={onClose} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group">
                      <span className="truncate">{link.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-8">
              {panels.map((panel: any) => (
                <div key={panel.title} className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{panel.title}</p>
                  <div className="space-y-1">
                    {panel.links.map((link: any) => (
                      <Link key={link.label} href={link.href} onClick={onClose} className="block rounded-lg px-2 py-1 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors truncate">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isJobs && (
            <div className="mt-8 border-t border-border pt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Find the perfect teaching opportunity</p>
              <Link href="/jobs" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                View All Opportunities <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SimpleDropdown = ({
  label,
  items,
  active,
  onToggle,
  onClose,
  isMobile,
  isJobs
}: Readonly<{
  label: string,
  items: any[],
  active: boolean,
  onToggle: () => void,
  onClose: () => void,
  isMobile: boolean,
  isJobs?: boolean
}>) => {
  if (isMobile) {
    return (
      <>
        <button
          onClick={onToggle}
          suppressHydrationWarning
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
        {active && (
          <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {items.map((item) => (
              <Link key={item.label} href={item.href} onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
            {isJobs && (
              <Link href="/jobs" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                View All Jobs
              </Link>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${active ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
      >
        {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
      </button>
      {active && (
        <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          {items.map((item) => (
            <Link key={item.label} href={item.href} onClick={onClose} className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
          {isJobs && (
            <div className="mt-1 border-t border-border pt-1">
              <Link href="/jobs" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                View All
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Helpers for Menu Mapping ---

function resolveMenuHref(menu: Partial<NavMenu> | null | undefined, parent?: NavMenu | null): string {
  if (!menu) return "#";

  const rawUrl = String(menu.url || "").trim();

  // If it's an external absolute URL, return as is
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  // We ignore /open/ prefixes from the backend as they are typically API paths, 
  // and we prefer our custom slug-based internal routing.
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("/open/")) return rawUrl;

  const slug = String(menu.slug || "").trim().replace(/^\/+|\/+$/g, "");
  const parentSlug = String(parent?.slug || "").trim().toLowerCase();

  // Mapping for static pages to match renamed folders
  const staticLinkMap: Record<string, string> = {
    "about": "about-us",
    "contact": "contact-us",
    "pricing": "pricing-plans",
    "free-cv-resume-builder": "ai-resume-builder",
    "faq": "faqs",
    "/open/home/faqs": "faqs", // Explicitly map the API URL as well
  };

  const finalSlug = staticLinkMap[slug.toLowerCase()] || staticLinkMap[rawUrl] || slug;

  if (parentSlug === "jobs" && slug) return `/jobs/${slug}`;
  if ((parentSlug === "institutes" || parentSlug === "institutions") && slug) return `/institutions/${slug}`;

  if (finalSlug === "jobs") return "/jobs";
  if (finalSlug === "institutes" || finalSlug === "institutions") return "/institutions";
  if (finalSlug) return `/${finalSlug}`;

  return rawUrl || "#";
}

function mapNavigationData(navData: NavigationData | null): any[] {
  if (!navData?.menus) return [];

  return navData.menus
    .filter((m: NavMenu) => m.is_active === 1 && m.show_in_nav === 1)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((menu: NavMenu) => {
      const children = (menu.children_recursive || [])
        .filter((c: NavMenu) => c.is_active === 1 && c.show_in_nav === 1)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      const hasChildren = children.length > 0;
      const isJobsMenu = menu.slug === "jobs" || menu.title?.toLowerCase().includes("job");
      const isInstitutionsMenu = ["institutes", "institutions"].includes(String(menu.slug || "").toLowerCase());
      const isMega = isJobsMenu || isInstitutionsMenu;

      let structure: any = null;
      if (hasChildren) {
        if (isMega) {
          structure = {
            sections: children
              .map((section: NavMenu) => {
                const grandChildren = (section.children_recursive || [])
                  .filter((link: NavMenu) => link.is_active === 1 && link.show_in_nav === 1);

                const linksSource = grandChildren.length > 0 ? grandChildren : [section];

                return {
                  title: section.title,
                  slug: section.slug,
                  links: linksSource.map((link: NavMenu) => ({
                    label: link.title,
                    href: resolveMenuHref(link, grandChildren.length > 0 ? menu : section),
                  })),
                };
              })
              .filter((section: any) => Array.isArray(section.links) && section.links.length > 0),
          };

          if (structure.sections.length === 0) {
            structure = children.map((item: NavMenu) => ({
              label: item.title,
              href: resolveMenuHref(item, menu),
            }));
          }
        } else {
          structure = children.map((item: NavMenu) => ({
            label: item.title,
            href: resolveMenuHref(item, menu),
          }));
        }
      }

      return {
        ...menu,
        url: resolveMenuHref(menu),
        hasChildren,
        isMega: isMega && !!structure && !Array.isArray(structure),
        isJobs: isJobsMenu,
        structure
      };
    });
}

// --- Auth Sections extracted for better maintainability and lower complexity ---

const DesktopAuth = ({
  mounted,
  isLoggedIn,
  user,
  userDropdownOpen,
  setUserDropdownOpen,
  userDropdownRef,
  dashboardPath,
}: Readonly<{
  mounted: boolean;
  isLoggedIn: boolean;
  user: any;
  userDropdownOpen: boolean;
  setUserDropdownOpen: (open: boolean) => void;
  userDropdownRef: React.RefObject<HTMLDivElement | null>;
  dashboardPath: string;
}>) => {
  if (!mounted) return <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />;

  if (!isLoggedIn) {
    return (
      <>
        <Button asChild variant="ghost" size="sm"><Link href="/auth/login">Register / Login</Link></Button>
        <Button asChild variant="hero" size="sm"><Link href="/auth/employer-login">Post a Job</Link></Button>
      </>
    );
  }

  return (
    <div className="relative" ref={userDropdownRef}>
      <button
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 transition-colors hover:bg-muted"
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-full font-display font-bold text-[10px] overflow-hidden ${user?.role === "employer" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
          {user?.avatar && (user.avatar.startsWith("http") || user.avatar.includes("/")) ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.avatar || user?.name?.[0] || "U"
          )}
        </div>
        <span className="text-xs font-semibold text-foreground">{user?.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
      </button>
      {userDropdownOpen && (
        <div className="absolute right-0 top-12 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link href={dashboardPath} onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href={user?.role === "employer" ? "/dashboard/employer/settings" : "/dashboard/jobseeker/profile"} onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {user?.role === "employer" ? <Settings className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {user?.role === "employer" ? "Settings" : "Profile"}
          </Link>
          <LogoutSubmitButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </LogoutSubmitButton>
        </div>
      )}
    </div>
  );
};

const MobileAuth = ({
  mounted,
  isLoggedIn,
  user,
  dashboardPath,
  closeAll
}: Readonly<{
  mounted: boolean;
  isLoggedIn: boolean;
  user: any;
  dashboardPath: string;
  closeAll: () => void;
}>) => {
  if (!mounted) return <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />;

  if (!isLoggedIn) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full"><Link href="/auth/login" onClick={closeAll}>Register / Login</Link></Button>
        <Button asChild variant="hero" className="w-full"><Link href="/auth/employer-login" onClick={closeAll}>Post a Job</Link></Button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="space-y-2">
        <div className="px-4 py-2 bg-muted/30 rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground uppercase">User</p>
          <p className="text-sm font-medium">{user?.name}</p>
        </div>
        <Link href={dashboardPath} onClick={closeAll}>
          <Button variant="outline" className="w-full gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button>
        </Link>
        <LogoutSubmitButton className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Logout
        </LogoutSubmitButton>
      </div>
    </div>
  );
};

// --- Main Header Component ---

export type HeaderAuthUser = {
  name: string;
  email: string;
  role: DashboardRole;
  avatar?: string;
};

const Header = ({
  navigationData,
  footerData,
  authUser,
}: Readonly<{
  navigationData: NavigationData | null;
  footerData: FooterData | null;
  authUser: HeaderAuthUser | null;
}>) => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isLoggedIn = !!authUser;
  const user = authUser;
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => setActiveDropdown(activeDropdown === name ? null : name);
  const closeAll = () => {
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  // --- Dynamic Data Mapping with Fallbacks ---
  const mappedMenus = useMemo(() => {
    return mapNavigationData(navigationData);
  }, [navigationData]);

  const dashboardPath = user?.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker";

  // Brand Data: Robust extraction from navigation or footer data
  const footerBrandSection = footerData?.sections?.find((s: any) =>
    String(s?.title || "").toLowerCase().includes("teach")
  );
  const footerBrandLink = (footerBrandSection?.links?.find((l: any) => Boolean(l?.icon)) || footerBrandSection?.links?.[0]) as any;

  const rawCompany =
    (navigationData as any)?.companies?.list?.[0] ||
    (navigationData as any)?.companies ||
    (navigationData as any)?.company ||
    (navigationData as any)?.brand ||
    navigationData ||
    (footerData as any)?.company ||
    (footerData as any)?.brand ||
    footerBrandSection ||
    footerData;

  const companyName = rawCompany?.company_name || rawCompany?.name || rawCompany?.title || footerBrandLink?.title || "TeachNow";
  const rawLogo =
    rawCompany?.company_logo ||
    rawCompany?.logo ||
    rawCompany?.brand_logo ||
    rawCompany?.icon ||
    footerBrandLink?.icon ||
    footerBrandLink?.logo;

  const companyLogo = rawLogo ? normalizeMediaUrl(rawLogo) : null;
  const brandNameParts = companyName.split(" ").filter(Boolean);
  const brandSecondaryPart = brandNameParts.length > 1 ? brandNameParts.slice(0, -1).join(" ") : companyName;
  const brandPrimaryPart = brandNameParts.length > 1 ? brandNameParts.at(-1) || "" : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/60 bg-white/70 backdrop-blur-md dark:bg-slate-950/70 dark:border-slate-800/60">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 md:px-10" ref={navRef}>
        <Link href="/" className="flex items-center gap-2 group" onClick={closeAll}>
          {companyLogo ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-display font-bold text-xl transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105 group-hover:shadow-lg">
              {companyName[0] || "T"}
            </div>
          )}
          <span className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
            {brandSecondaryPart}
            {brandPrimaryPart ? (
              <span className="text-primary group-hover:text-foreground transition-colors">{brandPrimaryPart}</span>
            ) : null}
          </span>
        </Link>

        {/* Dynamic Navigation (Desktop) */}
        <div className="hidden items-center gap-1 lg:flex">
          {mappedMenus.map((menu) => {
            if (menu.isMega && menu.structure) {
              return (
                <MegaMenu
                  key={menu.id}
                  label={menu.title}
                  data={menu.structure}
                  active={activeDropdown === menu.slug}
                  onToggle={() => toggleDropdown(menu.slug)}
                  onClose={closeAll}
                  isMobile={false}
                />
              );
            }
            if (menu.hasChildren && menu.structure && Array.isArray(menu.structure)) {
              return (
                <SimpleDropdown
                  key={menu.id}
                  label={menu.title}
                  items={menu.structure}
                  active={activeDropdown === menu.slug}
                  onToggle={() => toggleDropdown(menu.slug)}
                  onClose={closeAll}
                  isMobile={false}
                  isJobs={menu.isJobs}
                />
              );
            }
            return (
              <Link
                key={menu.id}
                href={menu.url}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${pathname === menu.url ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
              >
                {menu.title}
              </Link>
            );
          })}
        </div>

        {/* Auth Actions (Desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <DesktopAuth
            mounted={mounted}
            isLoggedIn={isLoggedIn}
            user={user}
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
            userDropdownRef={userDropdownRef}
            dashboardPath={dashboardPath}
          />
        </div>

        {/* Mobile Toggle */}
        <button className="flex items-center justify-center rounded-lg p-2 text-foreground lg:hidden hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1 pt-2">
            {mappedMenus.map((menu) => {
              if (menu.isMega && menu.structure) {
                return (
                  <MegaMenu
                    key={menu.id}
                    label={menu.title}
                    data={menu.structure}
                    active={activeDropdown === menu.slug}
                    onToggle={() => toggleDropdown(menu.slug)}
                    onClose={closeAll}
                    isMobile={true}
                    isJobs={menu.isJobs}
                  />
                );
              }
              if (menu.hasChildren && menu.structure) {
                return (
                  <SimpleDropdown
                    key={menu.id}
                    label={menu.title}
                    items={menu.structure}
                    active={activeDropdown === menu.slug}
                    onToggle={() => toggleDropdown(menu.slug)}
                    onClose={closeAll}
                    isMobile={true}
                    isJobs={menu.isJobs}
                  />
                );
              }
              return (
                <Link
                  key={menu.id}
                  href={menu.url}
                  onClick={closeAll}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted shadow-none"
                >
                  {menu.title}
                </Link>
              );
            })}

            <MobileAuth
              mounted={mounted}
              isLoggedIn={isLoggedIn}
              user={user}
              dashboardPath={dashboardPath}
              closeAll={closeAll}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
