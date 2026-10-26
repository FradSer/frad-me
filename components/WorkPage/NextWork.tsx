import Link from 'next/link';
import { findWork } from '@/utils/workCatalog';

function NextWork(props: Readonly<{ href?: string }>) {
  const next = props.href ? findWork(props.href) : null;
  const linkClass =
    'underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4';
  return (
    <nav
      aria-label="Case study navigation"
      className="flex flex-wrap items-center justify-between gap-6 border-t border-gray-200 pt-8 text-lg dark:border-neutral-800 md:text-2xl"
    >
      <Link href="/#work" className={linkClass}>
        All work
      </Link>
      {next && (
        <Link href={`/works/${next.slug}`} className={linkClass}>
          Next: {next.title}
        </Link>
      )}
    </nav>
  );
}

export default NextWork;
