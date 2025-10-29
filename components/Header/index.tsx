import Link from 'next/link';
import { CommonLink } from '@/components/common/CommonLink';
import FLogo from '@/components/Header/FLogo';
import ThemeSwitcher from '@/components/Header/ThemeSwitcher';

import headerLinks from '@/content/headerLinks';

function Header() {
  return (
    <>
      {/* Light mode 毛玻璃背景层 - 使用mask-image实现自然边缘过渡 */}
      <div
        className="fixed inset-x-0 top-0 h-24 backdrop-blur-lg pointer-events-none z-50 dark:hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
        }}
      />

      {/* Dark mode 毛玻璃背景层 */}
      <div
        className="fixed inset-x-0 top-0 h-24 backdrop-blur-lg pointer-events-none z-50 hidden dark:block"
        style={{
          background: 'rgba(0,0,0,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
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
