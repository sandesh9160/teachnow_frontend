import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { normalizeMediaUrl } from "@/services/api/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  // 'optional' renders immediately in system font — no font-swap re-render that blocks LCP
  display: "optional",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jobsvedika.in"),
  title: "TeachNow – Find Jobs, Build Resume, and Get Hired Faster",
  description: "India's #1 job portal for education professionals.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch layout data here (cached — no extra request) to preload hero image in <head>
  const { heroCTA } = await getGlobalLayoutData();
  const heroImageUrl = heroCTA?.hero?.background_image
    ? normalizeMediaUrl(heroCTA.hero.background_image)
    : null;

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        {/* Preconnect to backend CDN as early as possible */}
        <link rel="preconnect" href="https://teachnowbackend.jobsvedika.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://teachnowbackend.jobsvedika.in" />
        {/* Preload hero background image — tells browser to fetch it immediately, fixing NO_LCP on mobile */}
        {heroImageUrl && (
          <link
            rel="preload"
            as="image"
            href={heroImageUrl}
            fetchPriority="high"
          />
        )}
      </head>
      <body className="antialiased font-sans">
        <noscript>
          <link rel="stylesheet" href="/no-js.css" />
        </noscript>
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}

async function RootLayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fetch critical layout data
  const { navigation, footer, heroCTA } = await getGlobalLayoutData();


  return (
    <LayoutDataProvider
      navigationData={navigation}
      footerData={footer}
      heroCTA={heroCTA}
    >

      <LayoutWrapper
        navigationData={navigation}
        footerData={footer}
        heroCTA={heroCTA}
      >
        {children}
      </LayoutWrapper>
    </LayoutDataProvider>
  );
}

