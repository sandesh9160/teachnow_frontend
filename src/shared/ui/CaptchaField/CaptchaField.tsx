"use client";

import { forwardRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Check } from "lucide-react";

interface CaptchaFieldProps {
  onChange: (token: string | null) => void;
  error?: string;
  className?: string;
}

/**
 * Reusable Google reCAPTCHA component.
 * Requires NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable.
 */
export const CaptchaField = forwardRef<ReCAPTCHA, CaptchaFieldProps>(
  ({ onChange, error, className = "" }, ref) => {
    const [isVerified, setIsVerified] = useState(false);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.warn("reCAPTCHA site key is missing. Component will not render correctly.");
      return null;
    }

    const handleCaptchaChange = (token: string | null) => {
      setIsVerified(!!token);
      onChange(token);
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border transition-all p-3 ${
          isVerified ? "border-green-200 bg-green-50/50" : "border-border bg-muted/3 hover:bg-muted/5"
        }`}>
          <div className="w-full text-center">
            {isVerified ? (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-1.5 text-green-600">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-2.5 w-2.5 stroke-3" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified reCAPTCHA</span>
                </div>
                <p className="mt-0.5 text-[10px] text-green-600/70 leading-tight font-medium">
                  Security verification successful
                </p>
              </div>
            ) : (
              <>
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest opacity-70">Security Verification</h4>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                  Please verify you are not a robot to continue
                </p>
              </>
            )}
          </div>
          <div className={`relative w-full flex justify-center scale-[0.85] origin-center transition-all ${
            isVerified ? "h-0 opacity-0 -my-4 overflow-hidden" : "min-h-[78px] -my-2.5"
          }`}>
            <ReCAPTCHA
              ref={ref}
              sitekey={siteKey}
              onChange={handleCaptchaChange}
              onExpired={() => handleCaptchaChange(null)}
              theme="light"
            />
          </div>
        </div>
        {error && !isVerified && (
          <p id="captcha-error" className="text-[10px] font-medium text-destructive text-center px-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CaptchaField.displayName = "CaptchaField";
