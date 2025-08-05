import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import WorkCard from '../../../components/Landing/Work/WorkCard'

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock mouse context
vi.mock('../../../hooks/useMouseContext', () => ({
  default: () => ({
    cursorChangeHandler: vi.fn(),
  }),
}))

describe('WorkCard', () => {
  const defaultProps = {
    title: 'Test Work',
    subTitle: 'Test Project',
    slug: 'test-work',
    cover: '/test-cover.jpg',
  }

  it('renders work card with title and subtitle', () => {
    render(<WorkCard {...defaultProps} />)
    
    expect(screen.getByText('Test Work')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders cover image with correct alt text', () => {
    render(<WorkCard {...defaultProps} />)
    
    const image = screen.getByAltText('Cover for Test Work')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-cover.jpg')
  })

  it('renders as link when not WIP', () => {
    render(<WorkCard {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/works/test-work')
  })

  it('does not render as link when WIP', () => {
    render(<WorkCard {...defaultProps} isWIP />)
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})