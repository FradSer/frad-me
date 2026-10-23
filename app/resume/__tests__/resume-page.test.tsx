import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';

import resumeData from '@/content/resume';
import { metadata } from '../page';
import ResumePageClient from '../resume-page-client';

const clientSource = readFileSync(join(process.cwd(), 'app/resume/resume-page-client.tsx'), 'utf8');

describe('Current resume profile', () => {
  it('introduces the shared headline and summary near the name', () => {
    render(<ResumePageClient />);

    const introduction = screen
      .getByRole('heading', { level: 1, name: resumeData.name })
      .closest('section');
    expect(introduction).not.toBeNull();
    expect(within(introduction as HTMLElement).getByText(resumeData.headline)).toBeVisible();
    expect(within(introduction as HTMLElement).getByText(resumeData.summary)).toBeVisible();
    expect(clientSource).toContain('{resumeData.summary}');
    expect(metadata.description).toBe(resumeData.summary);
    expect(metadata.openGraph?.description).toBe(resumeData.summary);
  });

  it('presents every selected project before employment history', () => {
    render(<ResumePageClient />);

    const projectsHeading = screen.getByRole('heading', { name: 'Selected Projects' });
    const experienceHeading = screen.getByRole('heading', { name: 'Experience' });
    expect(
      projectsHeading.compareDocumentPosition(experienceHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const projects = projectsHeading.closest('section');
    expect(projects).not.toBeNull();
    expect(resumeData.projects.length).toBeGreaterThan(0);
    for (const project of resumeData.projects) {
      const section = within(projects as HTMLElement);
      const links = section.getAllByRole('link');
      const projectLink = links.find((link) => link.textContent?.includes(project.name));
      expect(projectLink).toHaveAttribute('href', project.href);
      expect(section.getAllByText(project.role)[0]).toBeVisible();
      expect(section.getByText(project.description)).toBeVisible();
    }
  });

  it('keeps all profile contact destinations reachable', () => {
    render(<ResumePageClient />);

    const links = screen.getAllByRole('link');
    for (const [key, value] of Object.entries(resumeData.contact)) {
      const href = key === 'email' ? `mailto:${value}` : value;
      expect(links.some((link) => link.getAttribute('href') === href)).toBe(true);
    }
  });

  it('renders semantic UTC dates without a clock-dependent duration', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-10-23T12:00:00Z'));
      const { container, rerender } = render(<ResumePageClient />);
      const expectedDates = resumeData.experience.flatMap((item) =>
        item.endDate ? [item.startDate, item.endDate] : [item.startDate],
      );
      const dates = Array.from(container.querySelectorAll('time'));
      for (const date of expectedDates) {
        const label = new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        });
        expect(dates.some((node) => node.dateTime === date && node.textContent === label)).toBe(
          true,
        );
      }
      expect(screen.getAllByText(/\bPresent$/).length).toBe(
        resumeData.experience.filter((item) => !item.endDate).length,
      );
      expect(clientSource).toMatch(/timeZone:\s*['"]UTC['"]/);
      const firstRender = container.textContent;
      jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
      rerender(<ResumePageClient />);
      expect(container.textContent).toBe(firstRender);
      expect(container.textContent).not.toMatch(/\b\d+ (?:yrs?|mos?)\b/);
    } finally {
      jest.useRealTimers();
    }
  });

  it('links patent records without claiming that publications are grants', () => {
    const { container } = render(<ResumePageClient />);

    for (const patent of resumeData.patents) {
      expect(screen.getByRole('link', { name: patent.number })).toHaveAttribute('href', patent.url);
    }
    expect(container.textContent).toMatch(/patent publications|published patent/i);
    expect(container.textContent).not.toMatch(/granted patents|secured multiple patents/i);
  });
});
