
// Base API URL (Laravel backend)
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://teachnowbackend.jobsvedika.in:8080/api";

// Base URL for images/media
export const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL || "http://teachnowbackend.jobsvedika.in:8080/";

// Laravel Sanctum CSRF endpoint
export const SANCTUM_URL = BASE_URL.replace("/api", "/sanctum");