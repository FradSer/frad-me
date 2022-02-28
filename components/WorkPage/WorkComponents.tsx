import { ReactNode } from 'react';

type ICommonProps = {
  children?: ReactNode;
};

function H1(props: ICommonProps) {
  return (
    <h1 className="col-span-16 col-start-1 text-2xl font-bold">
      {props.children}
    </h1>
  );
}

function H2(props: ICommonProps) {
  return (
    <h2 className="col-span-10 col-start-7 -mb-2 text-xl font-bold">
      {props.children}
    </h2>
  );
}

function P(props: ICommonProps) {
  return <p className="col-span-10 col-start-7 text-lg">{props.children}</p>;
}

function HR() {
  return <hr className="col-span-16 h-1 bg-black dark:bg-white"></hr>;
}

export { H1, H2, HR, P };
