import Link from 'next/link';

import headerLinks from '../../content/headerLinks';
import FLogo from '../Header/FLogo';
import { HeaderLink } from '../Header/HeaderLink';
import ThemeSwitcher from '../Header/ThemeSwitcher';

type ILayoutWrapperProps = {
  children: React.ReactNode;
};

function LayoutWrapper({ children }: ILayoutWrapperProps) {
  return (
    <div className="justify-cente flex flex-col items-center">
      <div className="max-w-wrapper px-4 md:px-8 xl:px-0">
        <nav className="fixed top-0 left-0 right-0 z-50 flex w-screen items-center justify-center">
          <div className="flex h-24 w-full max-w-wrapper flex-row items-center justify-between px-4 md:px-8 xl:px-0">
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
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}

export default LayoutWrapper;
