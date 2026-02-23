import fs from 'node:fs';
import path from 'node:path';

export const WORKS_PATH = path.join(process.cwd(), 'markdown', 'works');
export const MAX_SUMMARY_LENGTH = 500;

/** Strip MDX/Markdown syntax to produce plain text. */
export function stripMdx(content: string): string {
  return content
    .replace(/<[^>]+\/>/g, '') // self-closing JSX tags
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '') // paired JSX tags
    .replace(/^export\s+(const|function|class|let|var)\s+\w+.*$/gm, '') // export statements
    .replace(/^---[\s\S]*?---/m, '') // frontmatter (backward compatibility)
    .replace(/^#+\s+.*/gm, '') // headings
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[*_~`]/g, '') // inline formatting
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/^[-*]\s+/gm, '') // list items
    .replace(/^\d+\.\s+/gm, '') // numbered lists
    .replace(/\n{3,}/g, '\n\n') // collapse blank lines
    .trim();
}

/** Read an MDX work file and return a plain-text summary. */
export function getWorkSummary(slug: string): string | null {
  try {
    const filePath = path.join(WORKS_PATH, `${slug}.mdx`);
    const source = fs.readFileSync(filePath, 'utf8');
    const plain = stripMdx(source);
    if (plain.length <= MAX_SUMMARY_LENGTH) return plain;
    const truncated = plain.slice(0, MAX_SUMMARY_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : MAX_SUMMARY_LENGTH)}...`;
  } catch {
    return null;
  }
}
