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

      // Hero title animation
      const heroTitle = document.querySelector('.gsap-hero');
      if (heroTitle) {
        gsap.from(heroTitle, {
          opacity: 0,
          y: 40,
          duration: 1.8,
          ease: 'power3.out',
        });
      }

      // Hero subtitle animation
      const heroSub = document.querySelector('.gsap-hero-sub');
      if (heroSub) {
        gsap.from(heroSub, {
          opacity: 0,
          y: 20,
          duration: 1.2,
          delay: 0.8,
          ease: 'power3.out',
        });
      }

      // Parallax hero background
      const heroBg = document.querySelector('.hero__bg') as HTMLElement | null;
      if (heroBg) {
        gsap.to(heroBg, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Reveal animations on scroll
      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => el.classList.add('is-visible'),
        });
      });

      // Section card image parallax
      const cardImages = document.querySelectorAll('.section-card__image img');
      cardImages.forEach((img) => {
        gsap.to(img, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Page header image parallax (for sub-pages)
      const pageHeroImg = document.querySelector('.page-hero__image img');
      if (pageHeroImg) {
        gsap.to(pageHeroImg, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: '.page-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
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
