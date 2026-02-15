import { fireEvent, render, screen } from '@testing-library/react';
import { ContactForm } from '../ContactForm';

const mockSetMessageSent = jest.fn();

jest.mock('@/contexts/WebMCP/WebMCPContext', () => ({
  useWebMCPContext: () => ({
    isReady: true,
    logs: [],
    messageSent: false,
    setMessageSent: mockSetMessageSent,
  }),
}));

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render email input, message textarea, and submit button', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('should have required fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/your email/i)).toBeRequired();
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });

  it('should have WebMCP tool attributes on the form', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form');

    expect(form).toHaveAttribute('toolname', 'contact_me');
    expect(form).toHaveAttribute('tooldescription');
    expect(form?.getAttribute('tooldescription')).toContain('demo');
  });

  it('should have toolparamdescription on inputs', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/your email/i)).toHaveAttribute('toolparamdescription');
    expect(screen.getByLabelText(/message/i)).toHaveAttribute('toolparamdescription');
  });

  it('should call setMessageSent(true) on submit', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    fireEvent.submit(form as Element);

    expect(mockSetMessageSent).toHaveBeenCalledWith(true);
  });

  it('should call respondWith when event has agentInvoked', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    const mockRespondWith = jest.fn();

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(submitEvent, 'agentInvoked', { value: true });
    Object.defineProperty(submitEvent, 'respondWith', {
      value: mockRespondWith,
    });

    fireEvent(form as Element, submitEvent);

    expect(mockSetMessageSent).toHaveBeenCalledWith(true);
    expect(mockRespondWith).toHaveBeenCalledWith(expect.any(Promise));
  });

  it('should not call respondWith for regular form submissions', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    fireEvent.submit(form as Element);

    expect(mockSetMessageSent).toHaveBeenCalledWith(true);
    // No respondWith should be called since agentInvoked is undefined
  });
});
