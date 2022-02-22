import classNames from 'classnames';
import { motion } from 'framer-motion';
import Link from 'next/link';

import CursorProvider from '../common/CursorProvider';

type IHeaderLinkProps = {
  title: string;
  href: string;
};

export default function HeaderLink<T extends IHeaderLinkProps>(props: T) {
  // * Styles
  const headerLinkClass = classNames(
    'hover:underline hover:ecoration-4 hover:delay-1000'
  );

  // * Reander
  return (
    <CursorProvider>
      <Link href={props.href}>
        <a className={headerLinkClass}>{props.title}</a>
      </Link>
    </CursorProvider>
  );
}
