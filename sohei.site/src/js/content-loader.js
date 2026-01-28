import { SOHEI_API } from './api-config.js';

function getPageName() {
  const bodyClass = document.body.className.split(' ')[0];
  if (bodyClass === 'top' || bodyClass === '') {
    return 'index';
  }
  return bodyClass || window.location.pathname.replace(/.*\//, '').replace('.html', '') || 'index';
}

function applyContent(contentMap) {
  document.querySelectorAll('[data-content-key]').forEach((el) => {
    const key = el.getAttribute('data-content-key');
    if (!contentMap[key]) return;

    const tag = el.tagName.toLowerCase();

    // iframe: set src attribute (for YouTube embeds etc.)
    if (tag === 'iframe') {
      el.src = contentMap[key];
      return;
    }

    // Elements with a <span> child (e.g. timeline entries): preserve span, replace text
    const firstChild = el.querySelector('span');
    if (firstChild) {
      const clone = firstChild.cloneNode(true);
      el.innerHTML = '';
      el.appendChild(clone);
      el.appendChild(document.createElement('br'));
      el.append(contentMap[key].replace(/\n/g, '\n'));
    } else {
      el.textContent = contentMap[key];
    }
  });

  // Second pass: update span elements with their own data-content-key
  // (these may have been cloned during the first pass)
  document.querySelectorAll('span[data-content-key]').forEach((span) => {
    const key = span.getAttribute('data-content-key');
    if (contentMap[key]) {
      span.textContent = contentMap[key];
    }
  });

  // Handle link href updates via data-content-href
  document.querySelectorAll('[data-content-href]').forEach((el) => {
    const key = el.getAttribute('data-content-href');
    if (contentMap[key]) {
      el.href = contentMap[key];
    }
  });
}

async function loadContent() {
  const page = getPageName();
  try {
    const res = await fetch(SOHEI_API.getUrl(`/api/content/${page}`));
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.content) return;
    const contentMap = {};
    data.content.forEach((item) => {
      contentMap[item.key] = item.value;
    });
    applyContent(contentMap);

    // For non-index pages, also load index content for shared footer elements
    if (page !== 'index') {
      try {
        const footerRes = await fetch(SOHEI_API.getUrl('/api/content/index'));
        if (!footerRes.ok) return;
        const footerData = await footerRes.json();
        if (!footerData || !footerData.content) return;
        const footerMap = {};
        footerData.content.forEach((item) => {
          // Only apply footer-related keys
          if (item.key.startsWith('index.heading_contact') ||
              item.key.startsWith('index.contact_') ||
              item.key.startsWith('index.copyright')) {
            footerMap[item.key] = item.value;
          }
        });
        applyContent(footerMap);
      } catch {
        // Footer content not available
      }
    }
  } catch {
    // API not available - use fallback HTML content
  }
}

async function logVisit() {
  const page = getPageName();
  try {
    var ref = document.referrer || '';
    var referrer = '';
    if (ref) {
      try {
        referrer = new URL(ref).hostname;
      } catch {
        referrer = ref;
      }
    }
    await fetch(SOHEI_API.getUrl('/api/analytics/log'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        referrer: referrer,
        screenSize: window.screen.width + 'x' + window.screen.height,
        language: navigator.language || ''
      }),
    });
  } catch {
    // Tracking not available
  }
}

async function loadImages() {
  const page = getPageName();
  try {
    const res = await fetch(SOHEI_API.getUrl(`/api/images/${page}`));
    if (!res.ok) return;
    const data = await res.json();
    if (!data.keys || data.keys.length === 0) return;

    document.querySelectorAll('[data-image-key]').forEach((el) => {
      const key = el.getAttribute('data-image-key');
      if (data.keys.includes(key)) {
        el.src = SOHEI_API.getUrl(`/api/images/${page}/${key}`);
      }
    });
  } catch {
    // API not available - use fallback static images
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  loadImages();
  logVisit();
});
