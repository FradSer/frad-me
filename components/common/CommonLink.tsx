'use client';

import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

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

  const titleClass = useMemo(
    () =>
      clsx(
        'text-black dark:text-white dark:mix-blend-difference hover:decoration-4 hover:underline hover:delay-1000 hover:cursor-pointer',
      ),
    [],
  );

  const link = useMemo(() => {
    if (destinationType === DestinationType.link) {
      return (
        <Link href={href} className={titleClass}>
          {title}
        </Link>
      );
    }
    if (destinationType === DestinationType.section) {
      if (pathname === '/') {
        return (
          <ScrollLink destination={href}>
            <span className={titleClass}>{title}</span>
          </ScrollLink>
        );
      }
      return (
        <Link href={`/#${href}`} className={titleClass}>
          {title}
        </Link>
      );
    }
    return null;
  }, [destinationType, href, pathname, title, titleClass]);

  // * Render
  return <CursorProvider targetCursorType={CursorType.headerLinkHovered}>{link}</CursorProvider>;
}

export { CommonLink, DestinationType };
