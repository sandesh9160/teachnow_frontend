"use client";

import type { ReactNode } from "react";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
  children: ReactNode;
};

function InternalButton({ className, children }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2 truncate">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Logging out...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * POSTs to /auth/logout (server clears cookies + Laravel session).
 */
export function LogoutSubmitButton({ className, children }: Props) {
  return (
    <form action="/auth/logout" method="POST" className="w-full">
      <InternalButton className={className}> 
        {children}
      </InternalButton>
    </form>
  );
}
