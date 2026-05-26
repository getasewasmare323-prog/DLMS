const DEFAULT_API_BASE_URL = "";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "";

export function buildApiUrl(pathname = "") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildAssetUrl(pathname = "") {
  const normalizedPath = String(pathname).replace(/^\/+/, "");
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }
  return `${API_BASE_URL}/${normalizedPath}`;
}
