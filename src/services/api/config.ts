
// Base API URL (Laravel backend)
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://teachnowbackend.jobsvedika.in/api";

// Base URL for images/media (Laravel public storage)
export const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL || "https://teachnowbackend.jobsvedika.in/";

// Laravel Sanctum CSRF endpoint
export const SANCTUM_URL = BASE_URL.replace("/api", "/sanctum");