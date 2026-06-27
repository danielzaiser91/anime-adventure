import { IMAGE_URLS } from '../data/imageUrls';

export function useImageUrl(key: string): string {
  if (!key) return '';
  // Use AI-generated WebP from CDN when available, fall back to local SVG
  return IMAGE_URLS[key] ?? `${import.meta.env.BASE_URL}assets/${key}.svg`;
}
