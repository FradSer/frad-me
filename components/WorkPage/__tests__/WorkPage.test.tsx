import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';

import WorkPageClient from '@/app/works/[slug]/work-page-client';
import Topography from '@/components/WorkPage/BearyChat/Topography';
import { WorkBeforeAfterImages } from '@/components/WorkPage/WorkImage';

describe('Case study reading', () => {
  it('separates the title and summary, names the role, and provides both navigation paths', () => {
    render(
      <WorkPageClient
        metadata={{
          title: 'A project',
          description: 'A clear summary.',
          platforms: ['Web'],
          contributors: ['Product Manager'],
          nextWork: 'pachino',
        }}
      >
        <h2>Context and decisions</h2>
        <p>The project narrative.</p>
      </WorkPageClient>,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^A project$/);
    expect(screen.getByText('A clear summary.')).toBeVisible();
    expect(screen.getByText('My role')).toBeVisible();
    expect(screen.getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/#work');
    expect(screen.getByRole('link', { name: 'Next: Pachino' })).toHaveAttribute(
      'href',
      '/works/pachino',
    );
  });

  it('distinguishes before and after evidence with figure captions and image descriptions', () => {
    const { container } = render(
      <WorkBeforeAfterImages
        beforeSrc="/before.png"
        afterSrc="/after.png"
        width={320}
        height={200}
        description="A reading interface."
      />,
    );
    expect(screen.getByAltText('Before: A reading interface.')).toBeVisible();
    expect(screen.getByAltText('After: A reading interface.')).toBeVisible();
    expect(container.querySelector('figcaption')).toBeInTheDocument();
  });

  it('shows the complete diagram and hides separated layers with reduced motion', () => {
    const motion = require('motion/react') as { useReducedMotion: () => boolean };
    const reducedMotion = jest.spyOn(motion, 'useReducedMotion').mockReturnValue(true);
    try {
      render(<Topography />);
      const complete = screen.getByAltText(
        'BearyChat workspace before separating its interface layers.',
      );
      expect(complete).toBeVisible();
      expect(complete.parentElement).toHaveStyle({ display: 'block' });
      const layers = screen.getAllByAltText(/BearyChat workspace layer/);
      expect(layers).toHaveLength(3);
      for (const layer of layers) expect(layer.parentElement).toHaveStyle({ display: 'none' });
    } finally {
      reducedMotion.mockRestore();
    }
  });

  it.each(['bearychat', 'eye-protection-design-handbook', 'pachino'])(
    'keeps %s below the route title and retains valid media',
    (slug) => {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'markdown/works', `${slug}.mdx`),
        'utf8',
      );
      const routeSource = fs.readFileSync(
        path.join(process.cwd(), 'app/works/[slug]/page.tsx'),
        'utf8',
      );
      expect(routeSource).toMatch(new RegExp(`from ['"]@/markdown/works/${slug}\\.mdx['"]`));
      expect(routeSource).not.toContain('await import(');
      expect(source).not.toMatch(/^#\s+/m);
      expect(source.match(/^##\s+/gm)?.length).toBeGreaterThan(2);
      const media = Array.from(source.matchAll(/(?:src|beforeSrc|afterSrc)="(\/works\/[^"]+)"/g));
      expect(media.length).toBeGreaterThan(0);
      for (const [, file] of media)
        expect(fs.existsSync(path.join(process.cwd(), 'public', file))).toBe(true);
    },
  );
});
