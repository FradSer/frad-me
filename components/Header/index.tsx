import Link from 'next/link';
import { CommonLink } from '@/components/common/CommonLink';
import FLogo from '@/components/Header/FLogo';
import ThemeSwitcher from '@/components/Header/ThemeSwitcher';

import headerLinks from '@/content/headerLinks';

function Header() {
  return (
    // Blur layers are intentionally in LayoutWrapper (outside motion.header) to avoid
    // backdrop-filter being broken by Framer Motion's transform on the parent element.
    <nav className="flex h-[calc(6rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex-row items-center justify-between text-black dark:text-white relative z-55">
        <div className="flex items-center justify-center">
          <Link href="/" className="hover:cursor-none">
            <FLogo />
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
