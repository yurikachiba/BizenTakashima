import { SOHEI_API } from './api-config.js';

function getPageName() {
  const bodyClass = document.body.className.split(' ')[0];
  if (bodyClass === 'top' || bodyClass === '') {
    return 'index';
  }
  return bodyClass || window.location.pathname.replace(/.*\//, '').replace('.html', '') || 'index';
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
    document.querySelectorAll('[data-content-key]').forEach((el) => {
      const key = el.getAttribute('data-content-key');
      if (contentMap[key]) {
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
      }
    });
  } catch {
    // API not available - use fallback HTML content
  }
}

async function logVisit() {
  const page = getPageName();
  try {
    await fetch(SOHEI_API.getUrl('/api/analytics/log'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    });
  } catch {
    // Tracking not available
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  logVisit();
});
