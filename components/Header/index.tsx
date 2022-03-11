import Link from 'next/link';

import headerLinks from '../../content/headerLinks';
import FLogo from './FLogo';
import { CommonLink } from '../common/CommonLink';
import ThemeSwitcher from './ThemeSwitcher';

function Header() {
  return (
    <nav className="fixed top-0 z-50 flex h-24 w-full max-w-wrapper flex-row items-center justify-between px-4 md:px-8 xl:px-0">
      <div className="flex items-center justify-center ">
        <Link href="/">
          <a className="hover:cursor-none">
            <FLogo />
          </a>
        </Link>
      </div>
      <ul className="hidden h-full flex-row items-center space-x-8 text-2xl sm:flex">
        {headerLinks.map((headerLink) => (
          <li key={headerLink.title}>
            <CommonLink
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

export default Header;
