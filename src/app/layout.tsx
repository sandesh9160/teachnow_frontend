import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/providers";
import "./globals.css";

import { LayoutWrapper } from "./LayoutWrapper";
import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
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

