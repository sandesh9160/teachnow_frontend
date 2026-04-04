"use client";

import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

/**
 * POSTs to /auth/logout (server clears cookies + Laravel session).
 */
export function LogoutSubmitButton({ className, children }: Props) {
  return (
    <form action="/auth/logout" method="POST" className="w-full">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
