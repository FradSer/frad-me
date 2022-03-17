import classNames from 'classnames';
import { ReactNode } from 'react';

type ICommonProps = {
  children?: ReactNode;
};

const wrapperClass = classNames(
  'col-span-16 col-start-1 md:col-span-10 md:col-start-7'
);

function H1(props: ICommonProps) {
  return (
    <h1 className="col-span-16 col-start-1 mt-4 mb-2 text-4xl font-bold md:col-span-10 md:mt-8 md:mb-4">
      {props.children}
    </h1>
  );
}

function H2(props: ICommonProps) {
  const h2Class = classNames('text-3xl font-bold my-1 md:my-2', wrapperClass);
  return <h2 className={h2Class}>{props.children}</h2>;
}

function H3(props: ICommonProps) {
  const h3Class = classNames('text-2xl font-bold', wrapperClass);
  return <h3 className={h3Class}>{props.children}</h3>;
}

const listWrapperClass = classNames(
  'col-span-15 col-start-2 md:col-span-10 md:col-start-7 -mt-3 md:-mt-4'
);

function OL(props: ICommonProps) {
  const olClass = classNames('list-decimal', listWrapperClass);
  return <ol className={olClass}>{props.children}</ol>;
}

function UL(props: ICommonProps) {
  const ulClass = classNames('list-disc', listWrapperClass);
  return <ul className={ulClass}>{props.children}</ul>;
}

function P(props: ICommonProps) {
  const pClass = classNames('inline', wrapperClass);
  return <p className={pClass}>{props.children}</p>;
}

function Blockquote(props: ICommonProps) {
  return (
    <blockquote className="col-span-16 items-center justify-center text-center text-3xl font-bold">
      “{props.children}”
    </blockquote>
  );
}

function HR() {
  return <hr className="col-span-16 my-4 h-1 bg-black dark:bg-white"></hr>;
}

export { Blockquote, H1, H2, H3, HR, P, OL, UL, wrapperClass };
