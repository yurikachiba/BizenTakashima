'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useContentLoader } from '@/lib/content-loader';
import InstagramEmbed from '@/components/InstagramEmbed';

const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/p/CzjLvCaPF2S/';

export default function Footer() {
  const { getContent } = useContentLoader('index');

  useEffect(() => {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      const handleClick = (e: Event) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      backToTop.addEventListener('click', handleClick);
      return () => backToTop.removeEventListener('click', handleClick);
    }
  }, []);

  return (
    <footer className="footer">
      {/* Contact */}
      <div className="footer__contact">
        <h2 className="footer__contact-title" data-content-key="index.heading_contact">
          {getContent('index.heading_contact', 'お問い合わせ')}
        </h2>
        <p className="footer__contact-text" data-content-key="index.contact_text">
          {getContent('index.contact_text', 'InstagramのDMまでお願いいたします。')}
        </p>
        <div className="footer__instagram">
          <InstagramEmbed url={getContent('index.instagram_url', DEFAULT_INSTAGRAM_URL)} />
        </div>
      </div>

      {/* Navigation */}
      <div className="footer__bottom">
        <button id="back-to-top" className="footer__back-to-top" aria-label="トップへ戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M12 5L5 12M12 5L19 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <nav className="footer__nav">
          <Link href="/">トップページ</Link>
          <Link href="/work">作品紹介</Link>
          <Link href="/process">制作の様子</Link>
          <Link href="/interview">インタビュー</Link>
          <Link href="/artist">作家紹介</Link>
        </nav>
        <p className="footer__copyright" data-content-key="index.copyright">
          {getContent('index.copyright', `©TakashimaSohei. ${new Date().getFullYear()}.`)}
        </p>
      </div>
    </footer>
  );
}
