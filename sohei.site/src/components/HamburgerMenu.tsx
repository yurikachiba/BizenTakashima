'use client';

import Link from 'next/link';

export default function HamburgerMenu() {
  return (
    <nav className="nav">
      <input type="checkbox" id="nav-toggle" className="nav__checkbox" />
      <label htmlFor="nav-toggle" className="nav__button">
        <span className="nav__icon"></span>
      </label>
      <div className="nav__overlay">
        <div className="nav__content">
          <ul className="nav__list">
            <li className="nav__item">
              <Link href="/" className="nav__link">
                <span className="nav__link-en">Top</span>
                <span className="nav__link-ja">トップページ</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link href="/work" className="nav__link">
                <span className="nav__link-en">Works</span>
                <span className="nav__link-ja">作品紹介</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link href="/process" className="nav__link">
                <span className="nav__link-en">Process</span>
                <span className="nav__link-ja">制作の様子</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link href="/interview" className="nav__link">
                <span className="nav__link-en">Interview</span>
                <span className="nav__link-ja">インタビュー</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link href="/artist" className="nav__link">
                <span className="nav__link-en">Artist</span>
                <span className="nav__link-ja">作家紹介</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
