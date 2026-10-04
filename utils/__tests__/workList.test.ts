import fs from 'node:fs';

import { getAllWorkSlugs } from '@/utils/workList';

jest.mock('node:fs', () => ({
  __esModule: true,
  default: {
    readdirSync: jest.fn(() => [
      'bearychat.mdx',
      'unloadable.md',
      'pachino.mdx',
      'notes.txt',
      'old.mdx.bak',
    ]),
  },
}));

describe('Loadable case study slugs', () => {
  it('only lists files supported by the MDX work route', () => {
    expect(getAllWorkSlugs()).toEqual(['bearychat', 'pachino']);
  });

  it('retains the built-in fallback when the work directory is unavailable', () => {
    jest.mocked(fs.readdirSync).mockImplementationOnce(() => {
      throw new Error('Work directory unavailable');
    });

    expect(getAllWorkSlugs()).toEqual(['bearychat', 'eye-protection-design-handbook', 'pachino']);
  });
});
