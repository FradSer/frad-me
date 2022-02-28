import Link from 'next/link';

export default function WorkSite(props: { href?: string }) {
  if (!props.href) return null;
  return (
    <div className="col-span-3">
      <p className="uppercase">site</p>
      <Link href={props.href}>
        <a className="text-gray-500 dark:text-gray-700">{props.href}</a>
      </Link>
    </div>
  );
}
