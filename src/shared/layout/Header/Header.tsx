"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationData } from "@/types/homepage";
import type { DashboardRole } from "@/types/session";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import type { FooterData } from "@/lib/globalLayout/getGlobalLayoutData";
import { normalizeMediaUrl } from "@/services/api/client";
import { useClientSession } from "@/hooks/useClientSession";


// --- Sub-components for better modularity and less repetition ---

const NavItem = ({ item, onClose, level = 0 }: { item: any, onClose: () => void, level?: number }) => (
  <div className={level > 0 ? "pl-3.5 border-l border-slate-100/80 ml-2 mt-1" : "mt-0.5"}>
    <Link
      href={item.url}
      onClick={onClose}
      className={`block rounded-lg py-1 transition-all duration-200 ${level === 0
          ? "text-[14px] font-medium text-slate-600 hover:text-primary px-2"
          : "text-[13px] font-normal text-slate-400 hover:text-primary"
        }`}
    >
      {item.title}
    </Link>
    {item.children?.length > 0 && (
      <div className="space-y-0.5">
        {item.children.map((child: any) => (
          <NavItem key={child.id} item={child} onClose={onClose} level={level + 1} />
        ))}
      </div>
    )}
  </div>
);

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

  const sidebars = data.sections.filter((s: any) => String(s.slug || "").toLowerCase() === "categories") || [];
  const panels = data.sections.filter((s: any) => String(s.slug || "").toLowerCase() !== "categories") || [];

  if (isMobile) {
    return (
      <>
        <button
          onClick={onToggle}
          suppressHydrationWarning
          className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${active ? "text-primary bg-primary/5" : "text-gray-600"}`}
        >
          {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
        </button>
        {active && (
          <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {sidebars.map((sb: any) => (
              <div key={sb.id} className="pt-2">
                <p className="px-3 text-[10px] font-bold text-slate-400 tracking-widest mb-1">CATEGORIES</p>
                {sb.children.map((child: any) => (
                  <NavItem key={child.id} item={child} onClose={onClose} />
                ))}
              </div>
            ))}
            {panels.map((panel: any) => (
              <div key={panel.id} className="pt-2">
                <Link href={panel.url} onClick={onClose} className="px-3 text-[10px] font-bold text-slate-400 tracking-widest mb-1 block hover:text-primary transition-colors">
                  {panel.title.toUpperCase()}
                </Link>
                <div className="pl-2">
                  {panel.children.map((child: any) => (
                    <NavItem key={child.id} item={child} onClose={onClose} />
                  ))}
                </div>
              </div>
            ))}
            {isJobs && (
              <div className="pt-4 mt-2 border-t border-slate-100 pl-3">
                <Link href="/jobs" onClick={onClose} className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#1e3a8a] font-display hover:text-blue-800 transition-colors group">
                  View All Jobs <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
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
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${active ? "text-primary bg-primary/5" : "text-gray-500"}`}
      >
        {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
      </button>
      {active && (
        <div className={`absolute left-0 top-full mt-2 ${sidebars.length > 0 || panels.length > 2 ? "w-[800px]" : "w-max min-w-[280px]"} rounded-xl border border-border bg-card p-8 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50`}>
          <div className="flex gap-12">
            {sidebars.map((sb: any) => (
              <div key={sb.id} className="w-60 border-r border-border pr-10">
                <Link href={sb.url} onClick={onClose} className="text-[11px] font-bold text-slate-400 tracking-[0.15em] mb-6 block hover:text-primary transition-colors">
                  {sb.title.toUpperCase()}
                </Link>
                <div className="space-y-1">
                  {sb.children.map((child: any) => (
                    <NavItem key={child.id} item={child} onClose={onClose} />
                  ))}
                </div>
              </div>
            ))}
            <div className={`flex-1 grid ${panels.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-x-12 gap-y-10`}>
              {panels.map((panel: any) => (
                <div key={panel.id} className="min-w-0">
                  <Link href={panel.url} onClick={onClose} className="text-[11px] font-bold text-slate-400 tracking-[0.15em] mb-6 block hover:text-primary transition-colors">
                    {panel.title.toUpperCase()}
                  </Link>
                  <div className="space-y-1">
                    {panel.children.map((child: any) => (
                      <NavItem key={child.id} item={child} onClose={onClose} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isJobs && (
            <div className="mt-8 border-t border-border pt-5">
              <Link href="/jobs" onClick={onClose} className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#1e3a8a] font-display hover:text-blue-800 transition-colors group">
                View All Jobs <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
          className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${active ? "text-primary bg-primary/5" : "text-gray-600"}`}
        >
          {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
        </button>
        {active && (
          <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {items.map((item: any) => (
              <NavItem key={item.id} item={item} onClose={onClose} />
            ))}
            {isJobs && (
              <Link href="/jobs" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
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
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${active ? "text-primary bg-primary/5" : "text-gray-500"}`}
      >
        {label} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-180" : ""}`} />
      </button>
      {active && (
        <div className="absolute left-0 top-full mt-2 w-60 rounded-xl border border-border bg-card p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="space-y-1">
            {items.map((item: any) => (
              <NavItem key={item.id} item={item} onClose={onClose} />
            ))}
          </div>
          {isJobs && (
            <div className="mt-2 border-t border-border pt-2">
              <Link href="/jobs" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                View All
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Auth Sections extracted for better maintainability and lower complexity ---

const DesktopAuth = ({
  isLoggedIn,
  user,
  userDropdownOpen,
  setUserDropdownOpen,
  userDropdownRef,
}: Readonly<{
  isLoggedIn: boolean;
  user: any;
  userDropdownOpen: boolean;
  setUserDropdownOpen: (open: boolean) => void;
  userDropdownRef: React.RefObject<HTMLDivElement | null>;
}>) => {
  const [avatarError, setAvatarError] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-1.5 xl:gap-4">
        <Link
          href="/auth/login"
          className="rounded-lg px-3.5 py-2 text-sm font-bold text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-primary whitespace-nowrap"
        >
          Register / Login
        </Link>
        <Button asChild variant="hero" size="sm" >
          <Link href="/auth/login?role=employer_recruiter">Post a Job</Link>
        </Button>
      </div>
    );
  }

  const avatarSrc = user?.avatar ? normalizeMediaUrl(user.avatar) : null;

  return (
    <div className="relative" ref={userDropdownRef}>
      <button
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        aria-label="Toggle user account menu"
        aria-haspopup="true"
        aria-expanded={userDropdownOpen}
        className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 transition-all group"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/10 group-hover:scale-105 transition-transform overflow-hidden font-display relative">
          {avatarSrc && !avatarError ? (
            <Image
              src={avatarSrc}
              alt={user.name || "User avatar"}

              width={32}
              height={32}
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            user?.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <div className="hidden xl:block text-left">
          <p className="text-[13px] font-bold text-slate-900 leading-tight">{user?.name}</p>
          <p className="text-[10px] font-bold text-indigo-500 tracking-wide uppercase">
            {user?.exactRole || (user?.role === "employer" ? "Institution" : user?.role === "recruiter" ? "Recruiter" : "Job Seeker")}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${userDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {userDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
            <p className="text-[10px] font-medium text-slate-400 mb-0.5">Account Info</p>
            <p className="text-[13px] font-semibold text-slate-700 truncate">{user?.email}</p>
          </div>

          <Link href={user?.role === "employer" ? "/dashboard/employer" : user?.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/jobseeker"} onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all">
            <LayoutDashboard className="h-4 w-4 opacity-70" /> My Dashboard
          </Link>

          <div className="h-px bg-slate-50 my-1 mx-4"></div>

          <LogoutSubmitButton className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-all text-left">
            <LogOut className="h-4 w-4 opacity-70" /> Sign Out
          </LogoutSubmitButton>
        </div>
      )}
    </div>
  );
};

const MobileAuth = ({
  isLoggedIn,
  user,
  dashboardPath,
  closeAll
}: Readonly<{
  isLoggedIn: boolean;
  user: any;
  dashboardPath: string;
  closeAll: () => void;
}>) => {
  if (!isLoggedIn) {
    return (
      <div className="mt-4 flex flex-col gap-3 p-2">
        <Button asChild variant="outline" className="w-full h-11 rounded-xl font-bold"><Link href="/auth/login" onClick={closeAll}>Register / Login</Link></Button>
        <Button asChild variant="hero" className="w-full h-11 rounded-xl font-bold"><Link href="/auth/login?role=employer_recruiter" onClick={closeAll}>Post a Job</Link></Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 p-2 pt-4 border-t border-gray-50">
      <div className="flex items-center gap-3 px-1 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md">
          {user?.name?.[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-tight">
            {user?.exactRole || (user?.role === "employer" ? "Institution" : user?.role === "recruiter" ? "Recruiter" : "Job Seeker")}
          </p>
        </div>
      </div>
      <Link href={dashboardPath} onClick={closeAll}>
        <Button variant="outline" className="w-full gap-2 h-11 rounded-xl font-bold"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button>
      </Link>
      <LogoutSubmitButton className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-1">
        <LogOut className="h-4 w-4" /> Logout
      </LogoutSubmitButton>
    </div>
  );
};

// --- Main Header Component ---

export type HeaderAuthUser = {
  name: string;
  email: string;
  role: DashboardRole;
  avatar?: string;
  exactRole?: string;
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const { user: clientUser } = useClientSession();
  const user = authUser || clientUser;
  const isLoggedIn = !!user;


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    closeAll();
  }, [pathname]);

  const toggleDropdown = (name: string) => setActiveDropdown(activeDropdown === name ? null : name);
  const closeAll = () => {
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  // --- Dynamic Data Mapping with Fallbacks (Memoized) ---
  const mappedMenus = useMemo(() => (navigationData as any)?.mappedMenus || [], [navigationData]);

  const dashboardPath = useMemo(() =>
    user?.role === "employer"
      ? "/dashboard/employer"
      : user?.role === "recruiter"
        ? "/dashboard/recruiter"
        : "/dashboard/jobseeker"
    , [user?.role]);

  // Brand Data: Robust extraction from navigation or footer data (Memoized)
  const { companyName, companyLogo, brandPrimaryPart, brandSecondaryPart } = useMemo(() => {
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

    const name = rawCompany?.company_name || rawCompany?.name || rawCompany?.title || footerBrandLink?.title || "TeachNow";
    const rawLogo =
      rawCompany?.company_logo ||
      rawCompany?.logo ||
      rawCompany?.brand_logo ||
      rawCompany?.icon ||
      footerBrandLink?.icon ||
      footerBrandLink?.logo;

    const logo = rawLogo ? normalizeMediaUrl(rawLogo) : null;

    let secondary = "";
    let primary = "";

    if (name.toLowerCase() === "teachnow") {
      secondary = "Teach";
      primary = "Now";
    } else {
      const parts = name.split(" ").filter(Boolean);
      secondary = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
      primary = parts.length > 1 ? parts.at(-1) || "" : "";
    }

    return {
      companyName: name,
      companyLogo: logo,
      brandPrimaryPart: primary,
      brandSecondaryPart: secondary
    };
  }, [navigationData, footerData]);


  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm transition-all duration-300"
      ref={navRef}
      suppressHydrationWarning
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0" onClick={closeAll}>
          {companyLogo ? (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <Image
                src={companyLogo}
                alt={companyName}
                className="h-full w-full object-contain"
                width={40}
                height={40}
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-white font-display font-bold text-lg sm:text-xl transition-all duration-300 group-hover:scale-105 shadow-md shadow-primary/10">
              {companyName[0] || "T"}
            </div>
          )}
          <span className="font-display text-base sm:text-xl font-extrabold text-gray-900 tracking-tight transition-colors leading-none block">
            {brandSecondaryPart}
            {brandPrimaryPart ? (
              <span className="text-primary">{companyName.includes(" ") ? " " : ""}{brandPrimaryPart}</span>
            ) : null}
          </span>
        </Link>

        {/* Navigation Links (Centered) */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
          {mappedMenus.map((menu: any) => {
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
                  isJobs={menu.isJobs || menu.slug === "jobs" || menu.title?.toLowerCase().includes("job")}
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
                className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${pathname === menu.url ? "text-primary bg-primary/5 shadow-inner" : "text-gray-500"}`}
              >
                {menu.title}
              </Link>
            );
          })}
        </nav>

        {/* Action Belt (Right) */}
        <div className="hidden items-center gap-4 lg:flex">
          <DesktopAuth
            isLoggedIn={isLoggedIn}
            user={user}
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
            userDropdownRef={userDropdownRef}
          />
        </div>

        <div className="flex lg:hidden items-center gap-1.5 sm:gap-3">
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="text-[11px] sm:text-[12px] font-bold text-primary px-2 sm:px-4 py-2 bg-primary/5 rounded-lg whitespace-nowrap transition-all active:scale-95 border border-primary/10"
            >
              Register / Login
            </Link>
          )}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 transition-colors border border-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            suppressHydrationWarning
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileOpen && (
        <div className="border-t border-gray-50 bg-white px-2 pb-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300 max-h-[90vh] overflow-y-auto">
          <div className="pt-4 flex flex-col gap-0.5">
            {mappedMenus.map((menu: any) => {
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
                    isJobs={menu.isJobs || menu.slug === "jobs" || menu.title?.toLowerCase().includes("job")}
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
                  className={`rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all duration-200 hover:bg-gray-50 hover:text-primary ${pathname === menu.url ? "text-primary bg-primary/5" : "text-gray-600"}`}
                >
                  {menu.title}
                </Link>
              );
            })}

            <MobileAuth
              isLoggedIn={isLoggedIn}
              user={user}
              dashboardPath={dashboardPath}
              closeAll={closeAll}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
