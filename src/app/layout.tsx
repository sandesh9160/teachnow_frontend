import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
// import { Suspense } from "react";
import { Providers } from "@/providers";
import "./globals.css";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

import { generateSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateSeoMetadata({
    path: "/",
    pageFallback: {
      title: "TeachNow – Find Jobs, Build Resume, and Get Hired Faster",
      description: "India's #1 job portal for education professionals.",
    }
  }),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://teachnow.in"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverTime = Date.now();
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__serverTime = serverTime;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to backend — both http and https */}
        <link rel="preconnect" href="https://teachnowbackend.jobsvedika.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://teachnowbackend.jobsvedika.in" />
        <link rel="preconnect" href="http://teachnowbackend.jobsvedika.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="http://teachnowbackend.jobsvedika.in" />
        {/* Preconnect to Google Fonts CDN used by next/font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`antialiased font-sans ${interFont.variable} ${plusJakartaSansFont.variable}`} suppressHydrationWarning>
        <script
          id="server-time-script"
          dangerouslySetInnerHTML={{
            __html: `window.__serverTime = ${serverTime};`
          }}
        />
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

function RootLayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <RootLayoutContentInner>{children}</RootLayoutContentInner>
    </div>
  );
}

async function RootLayoutContentInner({ children }: Readonly<{ children: React.ReactNode }>) {
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
