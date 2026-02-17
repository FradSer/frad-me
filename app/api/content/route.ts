import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { type NextRequest, NextResponse } from 'next/server';
import resumeData from '@/content/resume';
import workLinks from '@/content/workLinks';

const WORKS_PATH = path.join(process.cwd(), 'content', 'works');
const MAX_SUMMARY_LENGTH = 500;

function stripMdx(content: string): string {
  return content
    .replace(/<[^>]+\/>/g, '') // self-closing JSX tags
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '') // paired JSX tags
    .replace(/^---[\s\S]*?---/m, '') // frontmatter
    .replace(/^#+\s+.*/gm, '') // headings
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[*_~`]/g, '') // inline formatting
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/^[-*]\s+/gm, '') // list items
    .replace(/^\d+\.\s+/gm, '') // numbered lists
    .replace(/\n{3,}/g, '\n\n') // collapse blank lines
    .trim();
}

function getWorkSummary(slug: string): string | null {
  try {
    const filePath = path.join(WORKS_PATH, `${slug}.mdx`);
    const source = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(source);
    const plain = stripMdx(content);
    if (plain.length <= MAX_SUMMARY_LENGTH) return plain;
    const truncated = plain.slice(0, MAX_SUMMARY_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : MAX_SUMMARY_LENGTH)}...`;
  } catch {
    return null;
  }
}

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

    const work = workLinks.find((w) => w.slug === slug);
    if (!work) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const summary = getWorkSummary(slug);

    return NextResponse.json({
      success: true,
      work: {
        title: work.title,
        subtitle: work.subTitle,
        slug: work.slug,
        isWIP: work.isWIP ?? false,
        link: work.externalLink || `/works/${slug}`,
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
