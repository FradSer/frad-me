import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { CursorProvider, CursorType } from './CursorProvider';
import ScrollLink from './ScrollLink';

interface ICommonLinkProps {
  title: string;
  href: string;
  destinationType?: DestinationType;
}

enum DestinationType {
  link = 'link',
  section = 'section',
}

function CommonLink({ title, href, destinationType }: ICommonLinkProps) {
  const { pathname } = useRouter();

  const titleClass = classNames(
    'hover:ecoration-4 hover:underline hover:delay-1000 hover:cursor-pointer'
  );

  const titleAnchor = <a className={titleClass}>{title}</a>;

  let link;
  if (destinationType === DestinationType.link) {
    link = <Link href={href}>{titleAnchor}</Link>;
  } else if (destinationType === DestinationType.section) {
    if (pathname === '/') {
      link = <ScrollLink destination={href}>{titleAnchor}</ScrollLink>;
    } else {
      link = <Link href={'/#' + href}>{titleAnchor}</Link>;
    }
  }

  // * Reander
  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      {link}
    </CursorProvider>
  );
}

CommonLink.defaultProps = {
  destinationType: DestinationType.link,
};

export { CommonLink, DestinationType };
