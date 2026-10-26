import { getAllWorkSlugs } from '@/utils/workList';

const mockWork = (title: string) => ({
  __esModule: true,
  default: () => null,
  metadata: { title, description: `${title} case study`, cover: `/works/${title}.png` },
});

jest.mock('@/markdown/works/bearychat.mdx', () => mockWork('BearyChat'));
jest.mock('@/markdown/works/eye-protection-design-handbook.mdx', () => mockWork('Eye Protection'));
jest.mock('@/markdown/works/pachino.mdx', () => mockWork('Pachino'));
jest.mock('@/app/works/[slug]/work-page-client', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('Not Found');
  },
}));

describe('Published case-study routes', () => {
  it('renders and resolves metadata for every case found in the content directory', async () => {
    const { default: Page, generateMetadata, generateStaticParams } = await import('../page');
    const slugs = getAllWorkSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(generateStaticParams()).toEqual(slugs.map((slug) => ({ slug })));
    for (const slug of slugs) {
      const props = { params: Promise.resolve({ slug }) };
      const page = await Page(props);
      const metadata = await generateMetadata(props);
      expect(page.props.children.type).toEqual(expect.any(Function));
      expect(page.props.metadata.title).toBe(metadata.title);
      expect(metadata.title).not.toBe('Work Not Found');
      expect(metadata.description).toBe(page.props.metadata.description);
      expect(metadata.openGraph?.images).toEqual([{ url: page.props.metadata.cover }]);
    }
  });

  it.each(['missing-case', '__proto__', 'constructor'])(
    'preserves not-found behavior for an unregistered slug: %s',
    async (slug) => {
      const { default: Page, generateMetadata } = await import('../page');
      const props = { params: Promise.resolve({ slug }) };
      await expect(Page(props)).rejects.toThrow('Not Found');
      expect(await generateMetadata(props)).toEqual({ title: 'Work Not Found' });
    },
  );
});
