import Link from 'next/link';

import { ExternalLinkIcon } from '@/components/common/Icons';
import { SITE_CONFIG } from '@/utils/constants';

export default function WorkSite(props: Readonly<{ href?: string }>) {
  if (!props.href) return null;
  const hostname = new URL(props.href, SITE_CONFIG.domain).hostname.replace(/^www\./, '');
  return (
    <div className="min-w-0 space-y-2">
      <dt className="text-sm text-gray-500 dark:text-gray-400">Website</dt>
      <dd>
        <Link
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 underline underline-offset-4 focus-visible:outline-2"
        >
          <span className="break-all">
            {hostname === 'apps.apple.com' ? 'App Store' : hostname}
          </span>
          <ExternalLinkIcon className="h-4 w-4 shrink-0 fill-current" />
        </Link>
      </dd>
    </div>
  );
}
