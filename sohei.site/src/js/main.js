import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/reset.scss';
import '../styles/style.scss';
import './content-loader.js';

gsap.registerPlugin(ScrollTrigger);

// Back to top button
window.onscroll = function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
};

// Parallax background
class ParallaxEffectBackground {
  constructor() {
    this.background = document.querySelector('.background');
    if (!this.background) return;
    this.speed = 0.3;
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const scrollTop = window.pageYOffset;
    this.background.style.backgroundPositionY = `${-scrollTop * this.speed}px`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParallaxEffectBackground();
});

// GSAP scroll animations
const scrollSelectors = ['.scroll', '.scroll2', '.scroll3', '.scroll4', '.scroll5'];
scrollSelectors.forEach((selector) => {
  gsap.fromTo(
    selector,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      scrollTrigger: {
        trigger: selector,
        start: 'top center',
      },
    },
  );
});

gsap.fromTo('.gsap', { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.8 });
