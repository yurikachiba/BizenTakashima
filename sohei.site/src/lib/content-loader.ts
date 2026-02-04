'use client';

import { useState, useEffect, useCallback, use } from 'react';
import type { ContentData } from './content-server';

// Use relative URLs for Vercel deployment
const API_BASE = '';

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

// Track the src that was loaded for each image
const loadedSrcMap = new WeakMap<HTMLImageElement, string>();

// Add is-loaded class to an image element
function markImageLoaded(img: HTMLImageElement) {
  loadedSrcMap.set(img, img.src);
  img.classList.add('is-loaded');
}

// Setup load listener for an image
function setupImageLoadListener(img: HTMLImageElement) {
  // Check if src changed - if so, reset loaded state
  const prevSrc = loadedSrcMap.get(img);
  if (prevSrc && prevSrc !== img.src) {
    img.classList.remove('is-loaded');
  }

  // If already loaded with current src, mark as loaded
  if (img.complete && img.naturalWidth > 0 && loadedSrcMap.get(img) === img.src) {
    markImageLoaded(img);
  } else if (img.complete && img.naturalWidth > 0 && !loadedSrcMap.has(img)) {
    // First time setup and already loaded
    markImageLoaded(img);
  } else {
    // Wait for load event
    img.addEventListener('load', () => markImageLoaded(img), { once: true });
    img.addEventListener('error', () => markImageLoaded(img), { once: true });
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

    // Watch for dynamically added images and src changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle added nodes
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'IMG' && node.hasAttribute('data-image-key')) {
              setupImageLoadListener(node as HTMLImageElement);
            }
            const imgs = node.querySelectorAll<HTMLImageElement>('img[data-image-key]');
            imgs.forEach(setupImageLoadListener);
          }
        });

        // Handle src attribute changes
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'src' &&
          mutation.target instanceof HTMLImageElement &&
          mutation.target.hasAttribute('data-image-key')
        ) {
          setupImageLoadListener(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });

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

      // Don't return any src until we know which images are custom
      // This prevents default image from loading and showing briefly
      if (!loaded) {
        // Return transparent 1x1 pixel to prevent broken image icon
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }

      // Return custom image URL if it exists, otherwise fallback
      if (customImageKeys.has(imageKey)) {
        return `${API_BASE}/api/images/${pageName}/${imageKey}`;
      }
      return fallback;
    },
    [pageName, customImageKeys, loaded],
  );

  return { loaded, getImageSrc, hasCustomImage: (key: string) => customImageKeys.has(key) };
}

// ============================================
// React 19 use() hook based implementations
// ============================================

/**
 * React 19 use() hook: Server Componentから渡されたPromiseを展開
 * Suspenseと組み合わせて使用
 */
export function useServerContent(contentPromise: Promise<ContentData>) {
  const content = use(contentPromise);

  const getContent = useCallback(
    (key: string, fallback: string): string => {
      return content[key] || fallback;
    },
    [content],
  );

  return { content, getContent };
}

/**
 * React 19 use() hook: Server Componentから渡された画像キーPromiseを展開
 */
export function useServerImageKeys(imageKeysPromise: Promise<string[]>, pageName: string) {
  const imageKeys = use(imageKeysPromise);
  const customImageKeys = new Set(imageKeys);

  // Cache the keys for subsequent renders
  if (!imageKeysCache[pageName]) {
    imageKeysCache[pageName] = customImageKeys;
  }

  // Setup image load listeners for smooth fade-in (same as useImageLoader)
  useEffect(() => {
    // Initial setup for existing images
    const images = document.querySelectorAll<HTMLImageElement>('img[data-image-key]');
    images.forEach(setupImageLoadListener);

    // Watch for dynamically added images and src changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle added nodes
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'IMG' && node.hasAttribute('data-image-key')) {
              setupImageLoadListener(node as HTMLImageElement);
            }
            const imgs = node.querySelectorAll<HTMLImageElement>('img[data-image-key]');
            imgs.forEach(setupImageLoadListener);
          }
        });

        // Handle src attribute changes
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'src' &&
          mutation.target instanceof HTMLImageElement &&
          mutation.target.hasAttribute('data-image-key')
        ) {
          setupImageLoadListener(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    return () => observer.disconnect();
  }, []);

  const getImageSrc = useCallback(
    (imageKey: string, fallback: string): string => {
      if (customImageKeys.has(imageKey)) {
        return `${API_BASE}/api/images/${pageName}/${imageKey}`;
      }
      return fallback;
    },
    [customImageKeys, pageName],
  );

  return { getImageSrc, hasCustomImage: (key: string) => customImageKeys.has(key) };
}
