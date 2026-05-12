import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/providers";
import "./globals.css";

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jobsvedika.in"),
  title: "TeachNow – Find Jobs, Build Resume, and Get Hired Faster",
  description: "India's #1 job portal for education professionals.",
  icons: {
    icon: "/images/branded-logo.png",
    apple: "/images/branded-logo.png",
  },
};

import { Suspense } from "react";
import Loading from "./loading";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <Suspense fallback={<Loading />}>
            <RootLayoutContent>{children}</RootLayoutContent>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

async function RootLayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  // Parallel fetch critical layout data and session
  const [{ navigation, footer, heroCTA }, session] = await Promise.all([
    getGlobalLayoutData(),
    getSessionProfile(),
  ]);
  
  const authUser = sessionUserForHeader(session);

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
        authUser={authUser}
      >
        {children}
      </LayoutWrapper>
    </LayoutDataProvider>
  );
}
