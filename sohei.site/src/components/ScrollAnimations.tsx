'use client';

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    let gsapModule: typeof import('gsap') | null = null;
    let scrollTriggerModule: typeof import('gsap/ScrollTrigger') | null = null;

    async function initGSAP() {
      gsapModule = await import('gsap');
      scrollTriggerModule = await import('gsap/ScrollTrigger');
      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.default;

      gsap.registerPlugin(ScrollTrigger);

      // Title animation
      const gsapEl = document.querySelector('.gsap');
      if (gsapEl) {
        gsap.from(gsapEl, {
          opacity: 0,
          duration: 2,
          y: 30,
        });
      }

      // Parallax background
      const background = document.querySelector('.background') as HTMLElement | null;
      if (background) {
        const handleScroll = () => {
          const scrollY = window.scrollY;
          background.style.backgroundPositionY = `${scrollY * 0.5}px`;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
      }

      // Scroll-triggered fade-in
      const scrollElements = document.querySelectorAll('.scroll, .scroll2, .scroll3, .scroll4, .scroll5');
      scrollElements.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => el.classList.add('active'),
        });
      });
    }

    initGSAP();

    return () => {
      if (scrollTriggerModule) {
        scrollTriggerModule.default.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return null;
}
