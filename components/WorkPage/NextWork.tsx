import Link from 'next/link'

import classNames from 'classnames'

function NextWork(props: { href?: string }) {
  const linkClass = classNames(
    'col-span-16 col-start-1 text-center text-black dark:text-white text-4xl my-8 font-bold'
  )

  if (!props.href) {
    return (
      <Link href="/#work" className={linkClass}>
        back to all works
      </Link>
    )
  } else {
    return (
      <Link
        href="/work/[slug]"
        as={`/work/${props.href}`}
        className={linkClass}
      >
        next work
      </Link>
    )
  }
}

export default NextWork
