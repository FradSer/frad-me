import type { ReactNode } from 'react';

import classNames from 'classnames';

import { GRID_CLASSES } from '@/utils/constants';

type ICommonProps = {
  children?: ReactNode;
};

const wrapperClass = GRID_CLASSES.contentWrapper;

function H1(props: Readonly<ICommonProps>) {
  return (
    <h1 className="col-span-16 col-start-1 mb-2 mt-4 text-4xl font-bold md:col-span-10 md:mb-4 md:mt-8">
      {props.children}
    </h1>
  );
}

function H2(props: Readonly<ICommonProps>) {
  const h2Class = classNames('text-3xl font-bold my-1 md:my-2', wrapperClass);
  return <h2 className={h2Class}>{props.children}</h2>;
}

function H3(props: Readonly<ICommonProps>) {
  const h3Class = classNames('text-2xl font-bold', wrapperClass);
  return <h3 className={h3Class}>{props.children}</h3>;
}

const listWrapperClass = GRID_CLASSES.listWrapper;

function OL(props: Readonly<ICommonProps>) {
  const olClass = classNames('list-decimal', listWrapperClass);
  return <ol className={olClass}>{props.children}</ol>;
}

function UL(props: Readonly<ICommonProps>) {
  const ulClass = classNames('list-disc', listWrapperClass);
  return <ul className={ulClass}>{props.children}</ul>;
}

function P(props: Readonly<ICommonProps>) {
  const pClass = classNames('inline', wrapperClass);
  return <p className={pClass}>{props.children}</p>;
}

function Blockquote(props: Readonly<ICommonProps>) {
  return (
    <blockquote className="col-span-16 items-center justify-center text-center text-3xl font-bold">
      “{props.children}”
    </blockquote>
  );
}

function Line() {
  return <hr className="col-span-16 my-4 h-1 bg-black dark:bg-white"></hr>;
}

export { Blockquote, H1, H2, H3, Line, P, OL, UL, wrapperClass };
