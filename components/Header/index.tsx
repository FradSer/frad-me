import classNames from 'classnames';
import Link from 'next/link';

import FLogo from './FLogo';
import HeaderLink from './HeaderLink';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  // * Reader
  return (
    <nav className="sticky top-0 flex items-center justify-between px-40 h-24 z-50">
      <div className="flex h-full items-center fill-black dark:fill-white">
        <Link href="/">
          <a className="hover:cursor-none">
            <FLogo />
          </a>
        </Link>
      </div>
      <ul className="hidden sm:flex flex-row items-center h-full text-2xl space-x-8 ">
        <li>
          <HeaderLink title="work" href="/work" />
        </li>
        <li>
          <HeaderLink title="blog" href="/blog" />
        </li>
        <li>
          <HeaderLink title="side" href="/side" />
        </li>
        <li className="flex justify-end">
          <HeaderLink title="resume" href="/resume" />
        </li>
        <li>
          <ThemeSwitcher />
        </li>
      </ul>
    </nav>
  );
}
