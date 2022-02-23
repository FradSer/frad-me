import Link from 'next/link';
import ScrollLink from '../common/ScrollLink';
import classNames from 'classnames';

import { CursorProvider, CursorType } from '../common/CursorProvider';

type IHeaderLinkProps = {
  title: string;
  href: string;
  destinationType?: DestinationType;
};

enum DestinationType {
  link = 'link',
  section = 'section',
}

function HeaderLink<T extends IHeaderLinkProps>(props: T) {
  const destinationType = props.destinationType || DestinationType.link;

  const titleClass = classNames(
    'hover:ecoration-4 hover:underline hover:delay-1000 hover:cursor-pointer'
  );

  const title = <a className={titleClass}>{props.title}</a>;

  let link;
  if (destinationType === DestinationType.link) {
    link = <Link href={props.href}>{title}</Link>;
  } else if (destinationType === DestinationType.section) {
    link = <ScrollLink destination={props.href}>{title}</ScrollLink>;
  }

  // * Reander
  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      {link}
    </CursorProvider>
  );
}

export { HeaderLink, DestinationType };
