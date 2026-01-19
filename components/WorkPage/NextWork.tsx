import { clsx } from 'clsx';
import Link from 'next/link';

import { GRID_CLASSES } from '@/utils/constants';

function NextWork(props: Readonly<{ href?: string }>) {
  const linkClass = clsx(
    GRID_CLASSES.fullWidthCentered,
    'text-black dark:text-white text-4xl my-8 font-bold',
  );

  if (!props.href) {
    return (
      <Link href="/#work" className={linkClass}>
        back to all works
      </Link>
    );
  } else {
    return (
      <Link href="/work/[slug]" as={`/work/${props.href}`} className={linkClass}>
        next work
      </Link>
    );
  }
}

export default NextWork;
