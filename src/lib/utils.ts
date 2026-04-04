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
import { IMAGE_BASE_URL } from "@/services/api/config";

/**
 * Converts a relative media path into a full URL using the global IMAGE_BASE_URL.
 */
export function normalizeMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  // Use the professionally configured IMAGE_BASE_URL
  const cleanBase = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  const cleanPath = path.toString().startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
