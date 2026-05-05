import type { Metadata } from "next";

import { Providers } from "@/providers";
import "./globals.css";

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jobsvedika.in"),
  title: "TeachNow – Find Jobs, Build Resume, and Get Hired Faster",
  description: "India's #1 job portal for education professionals.",
  icons: {
    icon: "/images/branded-logo.png",
    apple: "/images/branded-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutInner>{children}</RootLayoutInner>;
}

async function RootLayoutInner({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ navigation, footer, heroCTA }, session] = await Promise.all([
    getGlobalLayoutData(),
    getSessionProfile(),
  ]);
  const authUser = sessionUserForHeader(session);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-display: swap !important; }
        `}} />
      </head>
      <body className="antialiased">
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}