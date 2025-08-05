import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeSwitcher from '../../../components/Header/ThemeSwitcher'

// Mock next-themes
const mockSetTheme = vi.fn()
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
}))

// Mock CursorProvider
vi.mock('../../../components/common/CursorProvider', () => ({
  CursorProvider: ({ children }: { children: React.ReactNode }) => children,
  CursorType: { headerLinkHovered: 'headerLinkHovered' },
}))

// Mock spring transitions
vi.mock('../../../utils/motion/springTransitions', () => ({
  primaryTransition: { duration: 0.3 },
  secondaryTransition: { duration: 0.2 },
}))

describe('ThemeSwitcher', () => {
  it('renders theme switcher button', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('calls setTheme when clicked', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('has proper accessibility attributes', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toHaveAttribute('aria-label', 'Toggle Dark Mode')
    expect(button).toHaveAttribute('type', 'button')
  })
})