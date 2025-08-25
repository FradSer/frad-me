'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import classNames from 'classnames';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';

const ScrollLink = dynamic(() => import('./ScrollLink'), { ssr: false });

interface ICommonLinkProps {
  title: string;
  href: string;
  destinationType?: DestinationType;
}

enum DestinationType {
  link = 'link',
  section = 'section',
}

function CommonLink({
  title,
  href,
  destinationType = DestinationType.link,
}: Readonly<ICommonLinkProps>) {
  const pathname = usePathname();

  const titleClass = classNames(
    'hover:ecoration-4 hover:underline hover:delay-1000 hover:cursor-pointer',
  );

  const titleAnchor = <a className={titleClass}>{title}</a>;

  let link;
  if (destinationType === DestinationType.link) {
    link = (
      <Link href={href} legacyBehavior>
        {titleAnchor}
      </Link>
    );
  } else if (destinationType === DestinationType.section) {
    if (pathname === '/') {
      link = <ScrollLink destination={href}>{titleAnchor}</ScrollLink>;
    } else {
      link = (
        <Link href={'/#' + href} legacyBehavior>
          {titleAnchor}
        </Link>
      );
    }
  }

  // * Render
  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      {link}
    </CursorProvider>
  );
}

export { CommonLink, DestinationType };
