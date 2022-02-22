import Link from 'next/link';

import CursorProvider from '../common/CursorProvider';

type IHeaderLinkProps = {
  title: string;
  href: string;
};

export default function HeaderLink<T extends IHeaderLinkProps>(props: T) {
  // * Reander
  return (
    <CursorProvider>
      <Link href={props.href}>
        <a className="hover:ecoration-4 hover:underline hover:delay-1000">
          {props.title}
        </a>
      </Link>
    </CursorProvider>
  );
}
