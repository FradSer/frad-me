import resumeData from '@/content/resume';

const originalFetch = global.fetch;
let getRecentRepos: typeof import('../githubActivity').getRecentRepos;
const repo = (overrides: Record<string, unknown> = {}) => ({
  name: 'public-project',
  description: 'Public work',
  html_url: 'https://github.com/FradSer/public-project',
  language: 'TypeScript',
  stargazers_count: 7,
  pushed_at: '2026-10-23T10:00:00Z',
  private: false,
  archived: false,
  fork: false,
  ...overrides,
});
const response = (data: unknown) => ({ ok: true, json: async () => data }) as Response;

beforeEach(async () => {
  jest.resetModules();
  global.fetch = jest.fn().mockResolvedValue(response([repo()]));
  ({ getRecentRepos } = await import('../githubActivity'));
});
afterEach(() => {
  jest.useRealTimers();
});
afterAll(() => {
  global.fetch = originalFetch;
});

describe('Public GitHub activity', () => {
  it('replaces stale fallback records with shared public projects and unknown metrics', async () => {
    jest.mocked(global.fetch).mockRejectedValue(new Error('offline'));
    const snapshot = await getRecentRepos();
    expect(snapshot.source).toBe('fallback');
    expect(snapshot).toHaveProperty('note', expect.stringMatching(/curated portfolio/i));
    expect(snapshot.repos).toHaveLength(resumeData.projects.length);
    for (const project of resumeData.projects) {
      expect(snapshot.repos).toContainEqual({
        name: project.name,
        description: project.description,
        url: new URL(project.href, resumeData.contact.website).href,
        language: null,
        stars: null,
        pushedAt: null,
      });
    }
    expect(JSON.stringify(snapshot)).not.toMatch(
      /github\.com\/FradSer\/codeterrier|2026-08-|firmware experiments/,
    );
    await getRecentRepos();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('caches only eligible public activity for ten minutes', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-24T10:00:00Z'));
    jest
      .mocked(global.fetch)
      .mockResolvedValue(
        response([repo(), repo({ private: true }), repo({ fork: true }), repo({ archived: true })]),
      );
    const live = await getRecentRepos();
    expect(live.source).toBe('github');
    expect(live.fetchedAt).toBe('2026-10-24T10:00:00.000Z');
    expect(live.repos).toEqual([
      {
        name: 'public-project',
        description: 'Public work',
        url: 'https://github.com/FradSer/public-project',
        language: 'TypeScript',
        stars: 7,
        pushedAt: '2026-10-23',
      },
    ]);
    expect(await getRecentRepos()).toEqual(live);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(10 * 60000);
    await getRecentRepos();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [url, options] = jest.mocked(global.fetch).mock.calls[0];
    expect(url).toMatch(/^https:\/\/api.github.com\/users\/FradSer\/repos\?/);
    expect(options?.headers).not.toHaveProperty('Authorization');
  });

  it.each([
    { message: 'rate limit' },
    [repo({ stargazers_count: 'many' })],
    [repo({ html_url: 'https://evil.example/project' })],
    [null],
  ])('uses uncached fallback for malformed payload %j', async (payload) => {
    jest.mocked(global.fetch).mockResolvedValueOnce(response(payload));
    expect((await getRecentRepos()).source).toBe('fallback');
    expect((await getRecentRepos()).source).toBe('github');
  });

  it('allows unknown language and push date in an otherwise valid live repository', async () => {
    jest
      .mocked(global.fetch)
      .mockResolvedValue(response([repo({ language: null, pushed_at: null })]));
    const result = await getRecentRepos();
    expect(result.source).toBe('github');
    expect(result.repos[0]).toMatchObject({ language: null, pushedAt: null });
  });
  it('rejects an already cancelled caller even when live data is cached', async () => {
    await getRecentRepos();
    const controller = new AbortController();
    const reason = new Error('caller cancelled');
    controller.abort(reason);
    await expect(getRecentRepos(controller.signal)).rejects.toBe(reason);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('propagates in-flight cancellation without fallback or cache writes', async () => {
    const controller = new AbortController();
    const reason = new Error('navigation cancelled');
    jest.mocked(global.fetch).mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(options.signal?.reason));
        }),
    );
    const pending = getRecentRepos(controller.signal);
    const fetchSignal = jest.mocked(global.fetch).mock.calls[0][1]?.signal;
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    expect(fetchSignal?.aborted).toBe(true);
    expect((await getRecentRepos()).source).toBe('github');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not cache a response that arrives after cancellation', async () => {
    const controller = new AbortController();
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        controller.abort(new Error('cancelled while reading'));
        return [repo()];
      },
    } as Response);
    await expect(getRecentRepos(controller.signal)).rejects.toThrow('cancelled while reading');
    expect((await getRecentRepos()).source).toBe('github');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
