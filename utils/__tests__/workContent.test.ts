import fs from 'node:fs';
import { getWorkSummary } from '@/utils/workContent';

describe('Case study summaries', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['bearychat', 'eye-protection-design-handbook', 'pachino'])(
    'extracts the %s narrative without internal metadata',
    (slug) => {
      const summary = getWorkSummary(slug);
      expect(summary).not.toBeNull();
      expect(summary).not.toMatch(/cover:|contributors:|nextWork:|\/works\/[^ ]+\.png/);
      expect(summary?.length).toBeLessThanOrEqual(500);
    },
  );

  it('preserves prose separated by thematic breaks', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('First paragraph.\n\n---\n\nSecond paragraph.\n\n---\n\nThird paragraph.');
    expect(getWorkSummary('example')).toContain('Second paragraph.');
  });

  it('truncates long narratives at a word boundary within the summary budget', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('A complete thought. '.repeat(60));
    const summary = getWorkSummary('example');
    expect(summary?.length).toBeLessThanOrEqual(500);
    expect(summary).toMatch(/\S\.\.\.$/);
  });
});
