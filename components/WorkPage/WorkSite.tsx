import Link from 'next/link'

import { ExternalLinkIcon } from '@/components/common/Icons'

export default function WorkSite(props: Readonly<{ href?: string }>) {
  if (!props.href) return null
  return (
    <div className="col-span-3">
      <p className="uppercase">site</p>
      <Link
        href={props.href}
        target="_blank"
        className="flex flex-row items-center justify-start gap-x-1 text-gray-500 dark:text-gray-400"
      >
        {props.href}
        <ExternalLinkIcon className="h-4 w-4 fill-gray-500 dark:fill-gray-400" />
      </Link>
    </div>
  )
}
