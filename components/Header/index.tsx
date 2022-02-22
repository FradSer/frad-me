import Link from 'next/link';

import headerLinks from '../../content/headerLinks';
import FLogo from './FLogo';
import HeaderLink from './HeaderLink';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  // * Reader
  return (
    <nav className="fixed top-0 w-full flex items-center justify-between px-40 h-24 z-50">
      <div className="flex h-full items-center ">
        <Link href="/">
          <a className="hover:cursor-none">
            <FLogo />
          </a>
        </Link>
      </div>
      <ul className="hidden sm:flex flex-row items-center h-full text-2xl space-x-8">
        {headerLinks.map((headerLink) => (
          <li key={headerLink.title}>
            <HeaderLink title={headerLink.title} href={headerLink.href} />
          </li>
        ))}
        <li>
          <ThemeSwitcher />
        </li>
      </ul>
    </nav>
  );
}
