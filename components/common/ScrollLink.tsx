import React from 'react'
import { Link } from 'react-scroll'

type IScrollLinkProps = {
  destination: string
  children: React.ReactNode
}

export default function ScrollLink(props: Readonly<IScrollLinkProps>) {
  return (
    <Link to={props.destination} spy={true} smooth={true} duration={500}>
      {props.children}
    </Link>
  )
}
