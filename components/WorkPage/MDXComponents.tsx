import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { GRID_CLASSES } from '@/utils/constants';

type ICommonProps = {
  children?: ReactNode;
};

const wrapperClass = clsx(GRID_CLASSES.contentWrapper, 'w-full max-w-[65ch] min-w-0');

function H2(props: Readonly<ICommonProps>) {
  const h2Class = clsx('mt-10 text-3xl font-bold leading-tight md:mt-16 md:text-4xl', wrapperClass);
  return <h2 className={h2Class}>{props.children}</h2>;
}

function H3(props: Readonly<ICommonProps>) {
  const h3Class = clsx('mt-4 text-xl font-bold leading-snug md:mt-6 md:text-2xl', wrapperClass);
  return <h3 className={h3Class}>{props.children}</h3>;
}

const listWrapperClass = GRID_CLASSES.listWrapper;

function OL(props: Readonly<ICommonProps>) {
  const olClass = clsx(
    'max-w-[65ch] list-decimal space-y-2 pl-6 marker:text-gray-500',
    listWrapperClass,
  );
  return <ol className={olClass}>{props.children}</ol>;
}

function UL(props: Readonly<ICommonProps>) {
  const ulClass = clsx(
    'max-w-[65ch] list-disc space-y-2 pl-6 marker:text-gray-500',
    listWrapperClass,
  );
  return <ul className={ulClass}>{props.children}</ul>;
}

function P(props: Readonly<ICommonProps>) {
  const pClass = clsx('leading-relaxed', wrapperClass);
  return <p className={pClass}>{props.children}</p>;
}

function Blockquote(props: Readonly<ICommonProps>) {
  return (
    <blockquote
      className={clsx(
        wrapperClass,
        'my-4 text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-300',
      )}
    >
      {props.children}
    </blockquote>
  );
}

function Line() {
  return (
    <hr className={clsx(GRID_CLASSES.fullWidth, 'my-8 border-gray-200 dark:border-neutral-800')} />
  );
}

function A({ href, ...props }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      {...props}
      href={href}
      {...(/^https?:\/\//.test(href ?? '') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4"
    />
  );
}

export { A, Blockquote, H2, H3, Line, OL, P, UL };
