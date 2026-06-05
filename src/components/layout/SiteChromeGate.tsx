"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChromeGate({
  children,
  header,
  footer,
}: Readonly<{
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <main>{children}</main>;
  }

  return (
    <>
      {header}
      <main className="pt-16 min-h-screen flex flex-col">{children}</main>
      {footer}
    </>
  );
}
