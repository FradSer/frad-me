import type { ReactNode } from 'react';

type IScrollLinkProps = {
  destination: string;
  children: ReactNode;
  onClick?: () => void;
};

export default function ScrollLink(props: Readonly<IScrollLinkProps>) {
  const handleClick = () => {
    const element = document.getElementById(props.destination);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    props.onClick?.();
  };

  return (
    <button type="button" onClick={handleClick} style={{ all: 'unset', cursor: 'pointer' }}>
      {props.children}
    </button>
  );
}
