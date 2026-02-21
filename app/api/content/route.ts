import { type NextRequest, NextResponse } from 'next/server';
import resumeData from '@/content/resume';
import workLinks from '@/content/workLinks';
import { normalizeSlug } from '@/utils/slugMapping';
import { getWorkSummary } from '@/utils/workContent';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'read_work') {
    const slugParam = searchParams.get('slug');
    if (!slugParam) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 },
      );
    }

    // First try exact match (for backward compatibility)
    let work = workLinks.find((w) => w.slug === slugParam);

    // If not found, try normalized slug
    if (!work) {
      const normalized = normalizeSlug(slugParam);
      if (normalized) {
        work = workLinks.find((w) => w.slug === normalized);
      }
    }

    if (!work) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const summary = getWorkSummary(work.slug);

    return NextResponse.json({
      success: true,
      work: {
        title: work.title,
        subtitle: work.subTitle,
        slug: work.slug,
        isWIP: work.isWIP ?? false,
        link: work.externalLink || `/works/${work.slug}`,
        summary: summary || work.subTitle,
      },
    });
  }

  if (action === 'search_works') {
    const query = searchParams.get('query')?.toLowerCase() || '';
    const results = workLinks
      .filter((w) => {
        const text = `${w.title} ${w.subTitle} ${w.slug}`.toLowerCase();
        return text.includes(query);
      })
      .map((w) => ({
        title: w.title,
        subtitle: w.subTitle,
        slug: w.slug,
        link: w.externalLink || `/works/${w.slug}`,
        isWIP: w.isWIP ?? false,
      }));

    return NextResponse.json({ success: true, query, count: results.length, results });
  }

  if (action === 'get_resume') {
    return NextResponse.json({ success: true, resume: resumeData });
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: read_work, search_works, or get_resume' },
    { status: 400 },
  );
}
