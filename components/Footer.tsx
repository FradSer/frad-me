import footerLinks from '../content/footerLinks';
import { CommonLink } from './common/CommonLink';

function Footer() {
  return (
    <footer className="layout-wrapper my-12 flex h-24 flex-col items-center justify-between text-2xl md:flex-row">
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
