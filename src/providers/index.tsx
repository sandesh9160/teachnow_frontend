"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/shared/ui/Tooltip/Tooltip";
import { Toaster } from "@/shared/ui/Toaster/Toaster";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import SessionTimeoutHandler from "@/components/auth/SessionTimeoutHandler";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionTimeoutHandler />
          {children}
          <Toaster />
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
