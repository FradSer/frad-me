import { render, screen } from '@testing-library/react';

import Hero from '@/components/Landing/Hero';

describe('Hero speech control placement', () => {
  it('mounts the speech control outside the hero heading', async () => {
    window.speechSynthesis = {
      cancel: jest.fn(),
      speak: jest.fn(),
    } as unknown as SpeechSynthesis;

    render(<Hero />);

    const control = await screen.findByLabelText('Speak text');
    expect(control.closest('h1')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Frad LEE');

    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
  });
});
