import type { Metadata } from "next";

import { Providers } from "@/providers";
import "./globals.css";

import Header from "@/shared/layout/Header/Header";
import Footer from "@/shared/layout/Footer/Footer";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "TeachNow – Find Jobs, Build Resume, and Get Hired Faster",
  description: "India's #1 job portal for education professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutInner>{children}</RootLayoutInner>;
}

async function RootLayoutInner({ children }: Readonly<{ children: React.ReactNode }>) {
  const { navigation, footer } = await getGlobalLayoutData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Header navigationData={navigation} footerData={footer} />
          <main className="pt-16">{children}</main>
          <Footer footerData={footer} />
        </Providers>
      </body>
    </html>
  );
}