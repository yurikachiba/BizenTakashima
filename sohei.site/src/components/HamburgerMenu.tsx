'use client';

import Link from 'next/link';

export default function HamburgerMenu() {
  return (
    <div className="hamburger-menu">
      <input type="checkbox" id="menu-btn-check" />
      <label htmlFor="menu-btn-check" className="menu-btn">
        <span></span>
      </label>
      <div className="menu-content">
        <ul>
          <li>
            <Link href="/">トップページ</Link>
          </li>
          <li>
            <Link href="/work">作品紹介</Link>
          </li>
          <li>
            <Link href="/process">制作の様子</Link>
          </li>
          <li>
            <Link href="/interview">インタビュー</Link>
          </li>
          <li>
            <Link href="/artist">作家紹介</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
