export type ImageStyle = 'background' | 'character' | 'ui';

export interface ImageRequest {
  key: string;
  prompt: string;
  style: ImageStyle;
  width: number;
  height: number;
}

export async function generateImage(request: ImageRequest): Promise<string | null> {
  // No image API available — caller should use SVG fallback
  return null;
}

export function isSvgFallback(url: string): boolean {
  return url.startsWith('data:image/svg');
}
