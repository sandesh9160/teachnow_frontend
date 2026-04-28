"use client";

import { useMemo } from "react";
import { useLayoutData } from "@/providers/LayoutDataProvider";
import { normalizeMediaUrl } from "@/services/api/client";

export function useBranding() {
  const { navigationData, footerData } = useLayoutData();

  return useMemo(() => {
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

    let brandSecondaryPart = "";
    let brandPrimaryPart = "";

    if (companyName.toLowerCase() === "teachnow") {
      brandSecondaryPart = "Teach";
      brandPrimaryPart = "Now";
    } else {
      const brandNameParts = companyName.split(" ").filter(Boolean);
      brandSecondaryPart = brandNameParts.length > 1 ? brandNameParts.slice(0, -1).join(" ") : companyName;
      brandPrimaryPart = brandNameParts.length > 1 ? brandNameParts.at(-1) || "" : "";
    }

    return {
      companyName,
      companyLogo,
      brandSecondaryPart,
      brandPrimaryPart,
    };
  }, [navigationData, footerData]);
}
