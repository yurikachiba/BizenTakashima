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

export function useImageLoader(pageName: string) {
  const [customImageKeys, setCustomImageKeys] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Use cached keys if available
    if (imageKeysCache[pageName]) {
      setCustomImageKeys(imageKeysCache[pageName]);
      setLoaded(true);
      return;
    }

    async function loadImageKeys() {
      try {
        const res = await fetch(`${API_BASE}/api/images/${pageName}/_list`);
        if (res.ok) {
          const data = await res.json();
          const keysSet = new Set<string>(data.keys || []);
          imageKeysCache[pageName] = keysSet;
          setCustomImageKeys(keysSet);
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
      if (customImageKeys.has(imageKey)) {
        return `${API_BASE}/api/images/${pageName}/${imageKey}`;
      }
      return fallback;
    },
    [pageName, customImageKeys],
  );

  return { loaded, getImageSrc, hasCustomImage: (key: string) => customImageKeys.has(key) };
}
