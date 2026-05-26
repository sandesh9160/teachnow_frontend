

interface NoJSStylesProps {
  /**
   * Additional custom CSS rules to apply ONLY when JavaScript is disabled in the browser.
   */
  styles?: string;
  /**
   * If true, automatically applies overrides to bypass Framer Motion opacity=0 traps.
   * Targets standard class names such as .motion-h1, .motion-div, or any class matching .motion-*
   */
  framerMotion?: boolean;
}

export default function NoJSStyles({ styles = "", framerMotion = true }: NoJSStylesProps) {
  let combinedStyles = styles;

  if (framerMotion) {
    combinedStyles += `
      .motion-h1, .motion-div, .motion-span, .motion-p, [class*="motion-"] { 
        opacity: 1 !important; 
        transform: none !important; 
        visibility: visible !important;
      }
    `;
  }

  return (
    <noscript>
      <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />
    </noscript>
  );
}
