import { useEffect, useState } from 'react';

export function useImagePreloader(urls: string[]): { ready: boolean; progress: number } {
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    if (urls.length === 0) return;
    setLoaded(0);
    let cancelled = false;

    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setLoaded((n) => n + 1);
      };
      img.onerror = () => {
        if (!cancelled) setLoaded((n) => n + 1);
      };
      img.src = url;
    });

    return () => { cancelled = true; };
  }, [urls.join(',')]);

  const progress = urls.length === 0 ? 1 : loaded / urls.length;
  return { ready: loaded >= urls.length, progress };
}
