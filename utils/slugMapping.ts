import workLinks from '@/content/workLinks';

/**
 * Normalize a project name or slug to the canonical slug used in workLinks.
 * Handles case variations, spacing, and common formatting differences.
 *
 * Examples:
 * - "BearyChat" → "bearychat"
 * - "vivo Vision" → "vivo-vision"
 * - "Pachino" → "pachino"
 * - "bearychat" → "bearychat" (unchanged)
 */
export function normalizeSlug(input: string): string | null {
  if (!input) return null;

  // Lowercase and replace various separators with single hyphens.
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');

  if (workLinks.some((work) => work.slug === normalized)) return normalized;

  // Fall back to fuzzy matching against title, subtitle, and slug.
  const query = input.toLowerCase();
  for (const work of workLinks) {
    const matches =
      work.title.toLowerCase().includes(query) ||
      work.subTitle.toLowerCase().includes(query) ||
      work.slug.includes(normalized) ||
      normalized.includes(work.slug);

    if (matches) return work.slug;
  }

  return null;
}
