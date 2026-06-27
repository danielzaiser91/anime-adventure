export function useImageUrl(key: string): string {
  if (!key) return '';
  return `${import.meta.env.BASE_URL}assets/${key}.svg`;
}
