import type { Metadata } from "next";
// import { Suspense } from "react";
import { Providers } from "@/providers";
import "./globals.css";

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

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
        {/* Preconnect to Google Fonts and backend CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://teachnowbackend.jobsvedika.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://teachnowbackend.jobsvedika.in" />
      </head>
      <body className="antialiased font-sans">
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
