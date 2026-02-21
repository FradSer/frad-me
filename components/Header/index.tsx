'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CommonLink } from '@/components/common/CommonLink';
import FLogo from '@/components/Header/FLogo';
import MobileMenuButton from '@/components/Header/MobileMenuButton';
import ThemeSwitcher from '@/components/Header/ThemeSwitcher';

import headerLinks from '@/content/headerLinks';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setMobileMenuOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Main nav bar */}
      <nav className="flex h-[calc(3rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] sm:h-[calc(6rem+env(safe-area-inset-top))] flex-row items-center justify-between text-black dark:text-white relative z-55">
        <div className="flex items-center justify-center">
          <Link href="/" className="hover:cursor-none" onClick={closeMenu}>
            <FLogo />
          </Link>
        </div>

        {/* Desktop links */}
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

        {/* Mobile menu button + theme switcher */}
        <div className="flex items-center gap-4 sm:hidden">
          <ThemeSwitcher />
          <MobileMenuButton isOpen={mobileMenuOpen} onToggle={toggleMenu} />
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden sm:hidden"
          >
            <ul className="flex flex-col pb-6 pt-2">
              {headerLinks.map((headerLink) => (
                <li key={headerLink.title} className="py-3">
                  <CommonLink
                    title={headerLink.title}
                    href={headerLink.href}
                    destinationType={headerLink.destinationType}
                    className="text-3xl font-medium"
                    onNavigate={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
