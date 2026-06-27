import { IMAGE_URLS } from '../data/imageUrls';

export function useImageUrl(key: string): string {
  const url = (IMAGE_URLS as Record<string, string>)[key];
  return url ?? '';
}
