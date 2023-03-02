import { Link } from 'react-scroll'

type IScrollLinkProps = {
  destination: string
  children: React.ReactNode
}

export default function ScrollLink<T extends IScrollLinkProps>(props: T) {
  return (
    <Link to={props.destination} spy={true} smooth={true} duration={500}>
      {props.children}
    </Link>
  )
}
