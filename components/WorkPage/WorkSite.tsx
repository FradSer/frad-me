import Link from 'next/link';

export default function WorkSite(props: { href?: string }) {
  if (!props.href) return null;
  return (
    <div className="col-span-3">
      <p className="uppercase">site</p>
      <Link
        href={props.href}
        target="_blank"
        className="flex flex-row items-center justify-start gap-x-1 text-gray-500 dark:text-gray-400">

        {props.href}
        <svg
          viewBox="0 0 14 14"
          className="h-4 w-4 fill-gray-500 dark:fill-gray-400"
        >
          <path d="M11.1465 9.45508V3.58984C11.1465 3.32812 11.0645 3.11523 10.9004 2.95117C10.7402 2.78711 10.5254 2.70508 10.2559 2.70508H4.39062C4.14062 2.70508 3.93164 2.78711 3.76367 2.95117C3.59961 3.11523 3.51758 3.31055 3.51758 3.53711C3.51758 3.75977 3.60156 3.94922 3.76953 4.10547C3.9375 4.26172 4.14062 4.33984 4.37891 4.33984H6.55273L8.48047 4.26953L7.45508 5.17773L2.28125 10.3633C2.08984 10.5586 1.99414 10.7676 1.99414 10.9902C1.99414 11.1387 2.03516 11.2793 2.11719 11.4121C2.19922 11.541 2.30469 11.6465 2.43359 11.7285C2.5625 11.8105 2.70312 11.8516 2.85547 11.8516C3.08203 11.8516 3.29102 11.7559 3.48242 11.5645L8.66797 6.39062L9.58203 5.35938L9.50586 7.22852V9.46094C9.50586 9.70312 9.58203 9.9082 9.73438 10.0762C9.89062 10.2441 10.082 10.3281 10.3086 10.3281C10.5391 10.3281 10.7363 10.2441 10.9004 10.0762C11.0645 9.9082 11.1465 9.70117 11.1465 9.45508Z" />
        </svg>

      </Link>
    </div>
  );
}
