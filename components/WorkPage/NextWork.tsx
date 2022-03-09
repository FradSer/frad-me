import classNames from 'classnames';
import Link from 'next/link';

function NextWork(props: { href?: [string] }) {
  const linkClass = classNames(
    'col-span-16 col-start-1 text-center text-black dark:text-white text-5xl my-16 font-bold'
  );

  if (!props.href) {
    return (
      <Link href="/#work">
        <a className={linkClass}>back to all works</a>
      </Link>
    );
  } else {
    return (
      <Link href="/work/[slug]" as={`/work/${props.href}`}>
        <a className={linkClass}>next work</a>
      </Link>
    );
  }
}

export default NextWork;
