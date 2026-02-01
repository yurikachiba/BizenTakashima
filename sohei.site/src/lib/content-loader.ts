'use client';

import { useState, useEffect, useCallback } from 'react';

// Use relative URLs for Vercel deployment
const API_BASE = '';

interface ContentData {
  [key: string]: string;
}

export function useContentLoader(pageName?: string) {
  const [content, setContent] = useState<ContentData>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pageName) return;

    async function loadContent() {
      try {
        const res = await fetch(`${API_BASE}/api/content/${pageName}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch {
        // Graceful fallback to static content
      } finally {
        setLoaded(true);
      }
    }

    loadContent();
  }, [pageName]);

  const getContent = useCallback(
    (key: string, fallback: string): string => {
      return content[key] || fallback;
    },
    [content],
  );

  return { content, loaded, getContent };
}

export function useAnalyticsLog(pageName: string) {
  useEffect(() => {
    async function logVisit() {
      try {
        await fetch('/api/analytics/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pageName,
            referrer: document.referrer || null,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || null,
          }),
        });
      } catch {
        // Silent fail
      }
    }

    logVisit();
  }, [pageName]);
}

// Cache for custom image keys per page (shared across hook instances)
const imageKeysCache: { [page: string]: Set<string> } = {};
// Cache for preloaded images (to avoid re-preloading)
const preloadedImagesCache: { [page: string]: Set<string> } = {};

// Preload an image and return a promise that resolves when loaded
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve even on error to not block
    img.src = src;
  });
}

export function useImageLoader(pageName: string) {
  const [customImageKeys, setCustomImageKeys] = useState<Set<string>>(new Set());
  const [readyImages, setReadyImages] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Use cached preloaded images if available
    if (preloadedImagesCache[pageName]) {
      setCustomImageKeys(imageKeysCache[pageName]);
      setReadyImages(preloadedImagesCache[pageName]);
      setLoaded(true);
      return;
    }

    // Use cached keys if available (but still need to preload)
    if (imageKeysCache[pageName]) {
      setCustomImageKeys(imageKeysCache[pageName]);
      setLoaded(true);
      // Preload images in background
      preloadedImagesCache[pageName] = new Set();
      for (const key of imageKeysCache[pageName]) {
        const imgUrl = `${API_BASE}/api/images/${pageName}/${key}`;
        preloadImage(imgUrl).then(() => {
          preloadedImagesCache[pageName].add(key);
          setReadyImages((prev) => new Set([...prev, key]));
        });
      }
      return;
    }

    async function loadImageKeys() {
      try {
        const res = await fetch(`${API_BASE}/api/images/${pageName}/_list`);
        if (res.ok) {
          const data = await res.json();
          const keysSet = new Set<string>(data.keys || []);
          imageKeysCache[pageName] = keysSet;
          preloadedImagesCache[pageName] = new Set();
          setCustomImageKeys(keysSet);

          // Preload each custom image before making it available
          for (const key of keysSet) {
            const imgUrl = `${API_BASE}/api/images/${pageName}/${key}`;
            preloadImage(imgUrl).then(() => {
              preloadedImagesCache[pageName].add(key);
              setReadyImages((prev) => new Set([...prev, key]));
            });
          }
        }
      } catch {
        // Graceful fallback to default images
      } finally {
        setLoaded(true);
      }
    }

    loadImageKeys();
  }, [pageName]);

  const getImageSrc = useCallback(
    (imageKey: string, fallback: string): string => {
      // imageKey format: "page.key" (e.g., "index.philosophy_image")
      // Stored in DB as: page="index", key="index.philosophy_image" (full key)
      // Only return custom image URL after it's been preloaded to prevent flickering
      if (readyImages.has(imageKey)) {
        return `${API_BASE}/api/images/${pageName}/${imageKey}`;
      }
      return fallback;
    },
    [pageName, readyImages],
  );

  return { loaded, getImageSrc, hasCustomImage: (key: string) => customImageKeys.has(key) };
}
