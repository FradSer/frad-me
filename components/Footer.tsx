import footerLinks from '../content/footerLinks';
import { CommonLink } from './common/CommonLink';

function Footer() {
  return (
    <footer className="my-12 flex h-24 w-full max-w-wrapper flex-col items-center justify-between px-4 text-2xl md:flex-row md:px-8 xl:px-0">
      <ul className="flex h-full flex-row items-center space-x-8">
        {footerLinks.map((footerLink) => (
          <li key={footerLink.title}>
            <CommonLink title={footerLink.title} href={footerLink.href} />
          </li>
        ))}
      </ul>
      <span className="text-gray-400">Made by Frad © 2022</span>
    </footer>
  );
}

export default Footer;
