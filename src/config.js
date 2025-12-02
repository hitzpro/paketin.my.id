// URL Backend
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3200";

// Fallback ke origin browser jika env tidak ada
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:4321");