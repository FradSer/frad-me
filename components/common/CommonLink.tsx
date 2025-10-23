'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { clsx } from 'clsx';

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

  const titleClass = clsx(
    'text-black dark:text-white dark:mix-blend-difference hover:decoration-4 hover:underline hover:delay-1000 hover:cursor-pointer',
  );

  let link;
  if (destinationType === DestinationType.link) {
    link = (
      <Link href={href} className={titleClass}>
        {title}
      </Link>
    );
  } else if (destinationType === DestinationType.section) {
    if (pathname === '/') {
      link = <ScrollLink destination={href}><span className={titleClass}>{title}</span></ScrollLink>;
    } else {
      link = (
        <Link href={'/#' + href} className={titleClass}>
          {title}
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
