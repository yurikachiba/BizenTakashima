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

// Add is-loaded class to an image element
function markImageLoaded(img: HTMLImageElement) {
  img.classList.add('is-loaded');
}

// Setup load listener for an image
function setupImageLoadListener(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) {
    // Image already loaded
    markImageLoaded(img);
  } else {
    img.addEventListener('load', () => markImageLoaded(img), { once: true });
    img.addEventListener('error', () => markImageLoaded(img), { once: true }); // Show even on error
  }
}

export function useImageLoader(pageName: string) {
  const [customImageKeys, setCustomImageKeys] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Setup image load listeners for smooth fade-in
  useEffect(() => {
    // Initial setup for existing images
    const images = document.querySelectorAll<HTMLImageElement>('img[data-image-key]');
    images.forEach(setupImageLoadListener);

    // Watch for dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the node itself is an image
            if (node.tagName === 'IMG' && node.hasAttribute('data-image-key')) {
              setupImageLoadListener(node as HTMLImageElement);
            }
            // Check for images within the added node
            const imgs = node.querySelectorAll<HTMLImageElement>('img[data-image-key]');
            imgs.forEach(setupImageLoadListener);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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
      // Return custom image URL immediately if it exists (don't wait for preload)
      // CSS transition will handle smooth fade-in
      if (customImageKeys.has(imageKey)) {
        return `${API_BASE}/api/images/${pageName}/${imageKey}`;
      }
      return fallback;
    },
    [pageName, customImageKeys],
  );

  return { loaded, getImageSrc, hasCustomImage: (key: string) => customImageKeys.has(key) };
}
