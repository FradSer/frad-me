import Link from 'next/link';

import headerLinks from '../../content/headerLinks';
import { CommonLink } from '../common/CommonLink';
import FLogo from './FLogo';
import ThemeSwitcher from './ThemeSwitcher';

function Header() {
  return (
    <nav className="flex h-24 flex-row items-center justify-between">
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
