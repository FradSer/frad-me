import { Link } from 'react-scroll';
import type { ReactNode } from 'react';

type IScrollLinkProps = {
  destination: string;
  children: ReactNode;
};

export default function ScrollLink(props: Readonly<IScrollLinkProps>) {
  return (
    <Link to={props.destination} spy={true} smooth={true} duration={500}>
      {props.children}
    </Link>
  );
}
