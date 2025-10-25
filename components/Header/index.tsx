import Link from 'next/link';

import FLogo from '@/components/Header/FLogo';
import ThemeSwitcher from '@/components/Header/ThemeSwitcher';
import { CommonLink } from '@/components/common/CommonLink';

import headerLinks from '@/content/headerLinks';

function Header() {
  return (
    <>
      {/* Frosted glass inverted color background layer - gradient from top to bottom: 100% -> 100% -> 60% -> 0% */}
      <div
        className="fixed inset-x-0 top-0 h-24 bg-white/10 dark:bg-black/30 backdrop-blur-lg mix-blend-difference pointer-events-none z-50"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
        }}
      />

      <nav className="flex h-24 flex-row items-center justify-between text-black dark:text-white relative z-55">
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
    </>
  );
}

export default Header;
