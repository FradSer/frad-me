import { CommonLink } from '@/components/common/CommonLink';

import footerLinks from '@/content/footerLinks';

// The copyright year bakes into the prerender at build time instead of
// reading the clock on every request or during hydration.
async function Copyright() {
  'use cache';

  return (
    <span className="text-gray-400 hover:cursor-default">
      Made by Frad © {new Date().getFullYear()}
    </span>
  );
}

function Footer() {
  return (
    <footer className="layout-wrapper my-12 flex h-24 flex-col items-center justify-between text-xl md:flex-row">
      <ul className="flex h-full flex-row items-center space-x-8">
        {footerLinks.map((footerLink) => (
          <li key={footerLink.title}>
            <CommonLink title={footerLink.title} href={footerLink.href} />
          </li>
        ))}
      </ul>
      <Copyright />
    </footer>
  );
}

export default Footer;
