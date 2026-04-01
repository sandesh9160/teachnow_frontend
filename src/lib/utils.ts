import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  // Use a stable locale to avoid hydration mismatches
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Normalizes a string into a URL-friendly slug.
 * Trims, lowercases, decodes, and replaces spaces/special chars with hyphens.
 */
export function sanitizeSlug(rawSlug?: string | null): string {
  if (!rawSlug) return "";
  
  try {
    const decoded = decodeURIComponent(rawSlug);
    return decoded
      .toLowerCase()
      .trim()
      .replace(/^[:/]+/, "")
      .replace(/\/+$/, "")
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-")         // Deduplicate hyphens
      .replace(/^-+|-+$/g, "");    // Remove leading/trailing hyphens
  } catch {
    return (rawSlug || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
  }
}
