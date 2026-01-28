'use client';

import { useState, useEffect, useCallback } from 'react';

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
        const res = await fetch(`/api/content/${pageName}`);
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
    [content]
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
