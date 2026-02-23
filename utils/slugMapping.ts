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

  // First, check if it's already a valid slug
  const exactMatch = workLinks.find((w) => w.slug === input);
  if (exactMatch) return input;

  // Normalize input: lowercase and replace various separators with hyphens
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/[\s-]+/g, '-'); // Replace spaces/hyphens with single hyphen

  // Try direct match with normalized version
  const directMatch = workLinks.find((w) => w.slug === normalized);
  if (directMatch) return normalized;

  // Try fuzzy matching by checking if any work title/subtitle contains the input
  for (const work of workLinks) {
    const titleMatch = work.title.toLowerCase().includes(input.toLowerCase());
    const subtitleMatch = work.subTitle.toLowerCase().includes(input.toLowerCase());
    const partialSlugMatch = work.slug.includes(normalized) || normalized.includes(work.slug);

    if (titleMatch || subtitleMatch || partialSlugMatch) {
      return work.slug;
    }
  }

  // If we can't find a match, return null
  return null;
}
