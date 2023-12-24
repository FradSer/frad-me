import { Link } from 'react-scroll'

type IScrollLinkProps = {
  destination: string
  children: any
}

export default function ScrollLink(props: IScrollLinkProps) {
  return (
    <Link to={props.destination} spy={true} smooth={true} duration={500}>
      {props.children}
    </Link>
  )
}
