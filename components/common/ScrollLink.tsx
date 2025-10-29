import type { MouseEvent, ReactNode } from 'react';

type IScrollLinkProps = {
  destination: string;
  children: ReactNode;
};

export default function ScrollLink(props: Readonly<IScrollLinkProps>) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById(props.destination);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer appearance-none border-none bg-transparent p-0"
      style={{ all: 'unset', cursor: 'pointer' }}
    >
      {props.children}
    </button>
  );
}
