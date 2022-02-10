import classNames from 'classnames';
import { motion } from 'framer-motion';
import Link from 'next/link';

import useMouseContext from '../../hooks/useMouseContext';

type IHeaderLinkProps = {
  title: string;
  href: string;
};

export default function HeaderLink<T extends IHeaderLinkProps>(props: T) {
  // * Hooks
  const mouseContext = useMouseContext();

  // * Styles
  const headerLinkClass = classNames(
    'hover:cursor-none hover:underline hover:ecoration-4 hover:delay-1000'
  );

  // * Reander
  return (
    <motion.div
      onHoverStart={() => {
        mouseContext.cursorChangeHandler('header-link-hovered');
      }}
      onHoverEnd={() => {
        mouseContext.cursorChangeHandler('default');
      }}
    >
      <Link href={props.href}>
        <a className={headerLinkClass}>{props.title}</a>
      </Link>
    </motion.div>
  );
}
