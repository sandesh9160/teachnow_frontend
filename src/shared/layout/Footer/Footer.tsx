import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { normalizeMediaUrl } from "@/services/api/client";
import type { FooterData, FooterTopSearch } from "@/lib/globalLayout/getGlobalLayoutData";

function toAbsoluteUrl(url?: string): string {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return url;
  return `https://${url}`;
}

function toSearchHref(item?: FooterTopSearch | null): string {
  if (item?.keyword || item?.location) {
    const keyword = String(item.keyword || "")
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, "-");
    const location = String(item.location || "")
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, "-");
    const slug = [keyword, location].filter(Boolean).join("-");
    return slug ? `/jobs/${slug}` : "/jobs";
  }
  return "/jobs";
}

export const Footer = ({
  footerData,
}: Readonly<{
  footerData: FooterData | null;
}>) => {
  const sections: FooterData["sections"] = footerData?.sections ?? [];
  const topSearches: FooterData["top_searches"] = footerData?.top_searches ?? [];

  // Backend brand is typically represented by the section whose title contains "teach".
  // We use it to populate the top-left brand block.
  const brandSection =
    sections.find((s) => String(s?.title || "").toLowerCase().includes("teach")) ?? null;

  const brandLink =
    brandSection?.links?.find((l) => Boolean(l?.icon)) ?? brandSection?.links?.[0] ?? null;

  const brandName = brandSection?.title || "";
  const brandText =
    brandLink?.title || "";

  const brandIcon = brandLink?.icon ? normalizeMediaUrl(brandLink.icon) : "";

  const brandNameParts = String(brandName)
    .trim()
    .split(" ")
    .filter(Boolean);

  const brandPrimaryPart =
    brandNameParts.length > 1 ? brandNameParts.at(-1) || "" : "";
  const brandSecondaryPart =
    brandNameParts.length > 1 ? brandNameParts.slice(0, -1).join(" ") : brandName;

  const gridSections = brandSection ? sections.filter((s) => s !== brandSection) : sections;

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16 ml-4 md:ml-8 lg:ml-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              {brandIcon ? (
                <img
                  src={brandIcon}
                  alt={brandName}
                  className="h-8 w-8 object-contain rounded-lg"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <GraduationCap className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-foreground">
                {brandSecondaryPart}
                {brandPrimaryPart ? (
                  <span className="text-primary">{brandPrimaryPart}</span>
                ) : null}
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {brandText}
            </p>
          </div>

          {gridSections.map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">{section.title}</h4>
                <ul className="space-y-2.5">
                  {(Array.isArray(section.links) ? section.links : []).map((link) => {
                    const href = toAbsoluteUrl(link.url);
                    const isExternal = /^https?:\/\//i.test(href) || href === "#";

                    return (
                      <li key={link.id || link.title}>
                        {isExternal ? (
                          <a
                            href={href}
                            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                            target={href === "#" ? undefined : "_blank"}
                            rel={href === "#" ? undefined : "noreferrer"}
                          >
                            {link.icon ? (
                              <img
                                src={normalizeMediaUrl(link.icon)}
                                alt={link.title || "link icon"}
                                className="h-4 w-4 object-contain transition-transform group-hover:scale-105"
                              />
                            ) : null}
                            <span>{link.title}</span>
                          </a>
                        ) : (
                          <Link
                            href={href}
                            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {link.icon ? (
                              <img
                                src={normalizeMediaUrl(link.icon)}
                                alt={link.title || "link icon"}
                                className="h-4 w-4 object-contain transition-transform group-hover:scale-105"
                              />
                            ) : null}
                            <span>{link.title}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          {/* Top Searches */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Top Searches</h4>
            <ul className="space-y-2.5">
              {topSearches.map((link: any, index: number) => (
                <li key={link.title || index}>
                  <Link
                    href={toSearchHref(link as FooterTopSearch)}
                    className="group text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="bg-linear-to-r from-primary to-primary bg-size-[0%_1px] bg-bottom-left bg-no-repeat transition-all duration-300 group-hover:bg-size-[100%_1px]">
                      {link.title || "Search Jobs"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {brandName || "TeachNow"}.in — All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact-us" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
