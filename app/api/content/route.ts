import { type NextRequest, NextResponse } from 'next/server';
import resumeData from '@/content/resume';
import { searchWorks } from '@/utils/workCatalog';
import { readWork } from '@/utils/workQueries';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'read_work') {
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 },
      );
    }

    const work = readWork(slug);
    if (!work) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, work });
  }

  if (action === 'search_works') {
    const query = searchParams.get('query') || '';
    const results = searchWorks(query);

    return NextResponse.json({
      success: true,
      query: query.toLowerCase(),
      count: results.length,
      results,
    });
  }

  if (action === 'get_resume') {
    return NextResponse.json({ success: true, resume: resumeData });
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: read_work, search_works, or get_resume' },
    { status: 400 },
  );
}
