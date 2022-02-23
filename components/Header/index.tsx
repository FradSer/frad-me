import Link from 'next/link';

import headerLinks from '../../content/headerLinks';
import FLogo from './FLogo';
import { HeaderLink } from './HeaderLink';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  // * Reader
  return (
    <nav className="fixed top-0 z-50 flex h-24 w-full items-center justify-between px-40">
      <div className="flex h-full items-center ">
        <Link href="/">
          <a className="hover:cursor-none">
            <FLogo />
          </a>
        </Link>
      </div>
      <ul className="hidden h-full flex-row items-center space-x-8 text-2xl sm:flex">
        {headerLinks.map((headerLink) => (
          <li key={headerLink.title}>
            <HeaderLink
              title={headerLink.title}
              href={headerLink.href}
              destinationType={headerLink.destinationType}
            />
          </li>
        ))}
        <li>
          <ThemeSwitcher />
        </li>
      </ul>
    </nav>
  );
}
