import { ReactNode } from 'react';
import classNames from 'classnames';

type ICommonProps = {
  children?: ReactNode;
};

const wrapperClass = classNames(
  'col-span-16 col-start-1 md:col-span-10 md:col-start-7'
);

function H1(props: ICommonProps) {
  return (
    <h1 className="col-span-16 col-start-1 mt-4 mb-2 text-5xl font-bold md:col-span-10 md:mt-8 md:mb-4">
      {props.children}
    </h1>
  );
}

function H2(props: ICommonProps) {
  const h2Class = classNames('text-2xl font-bold my-1 md:my-2', wrapperClass);
  return <h2 className={h2Class}>{props.children}</h2>;
}

function P(props: ICommonProps) {
  const pClass = classNames('text-lg', wrapperClass);
  return <p className={pClass}>{props.children}</p>;
}

function HR() {
  return <hr className="col-span-16 my-4 h-1 bg-black dark:bg-white"></hr>;
}

export { H1, H2, HR, P, wrapperClass };
