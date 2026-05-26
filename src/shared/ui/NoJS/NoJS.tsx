import React from "react";

interface NoJSProps {
  readonly children: React.ReactNode;
}

/**
 * A declarative wrapper component to render children ONLY when JavaScript is disabled in the browser.
 */
export default function NoJS({ children }: NoJSProps) {
  return <noscript>{children}</noscript>;
}
