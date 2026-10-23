import { z } from 'zod';
import resumeData from '@/content/resume';

interface RepoSummary {
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number | null;
  pushedAt: string | null;
}

interface ActivitySnapshot {
  source: 'github' | 'fallback';
  fetchedAt: string;
  note: string;
  repos: RepoSummary[];
}

const GITHUB_USER = 'FradSer';
const CACHE_TTL_MS = 10 * 60_000;
const repositorySchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  html_url: z.url().regex(/^https:\/\/github\.com\/FradSer\/[^/?#]+$/i),
  language: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
  pushed_at: z.iso.datetime().nullable(),
  private: z.boolean(),
  fork: z.boolean(),
  archived: z.boolean(),
});

let cache: { data: ActivitySnapshot; expiresAt: number } | null = null;

function portfolioFallback(fetchedAt: string): ActivitySnapshot {
  return {
    source: 'fallback',
    fetchedAt,
    note: 'Curated portfolio, not live GitHub activity. fetchedAt is the lookup attempt time; repository metrics and activity dates are unknown.',
    repos: resumeData.projects.map((project) => ({
      name: project.name,
      description: project.description,
      url: new URL(project.href, resumeData.contact.website).href,
      language: null,
      stars: null,
      pushedAt: null,
    })),
  };
}

function mapRepo(raw: z.infer<typeof repositorySchema>): RepoSummary {
  return {
    name: raw.name,
    description: raw.description ?? '',
    url: raw.html_url,
    language: raw.language,
    stars: raw.stargazers_count,
    pushedAt: raw.pushed_at?.slice(0, 10) ?? null,
  };
}

export async function getRecentRepos(signal?: AbortSignal): Promise<ActivitySnapshot> {
  signal?.throwIfAborted();
  if (cache && Date.now() < cache.expiresAt) return cache.data;

  const fetchedAt = new Date().toISOString();
  try {
    const timeout = AbortSignal.timeout(8000);
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=30&type=owner`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      },
    );
    if (!res.ok) throw new Error('GitHub activity is unavailable');
    const json: unknown = await res.json();
    signal?.throwIfAborted();
    const repos = z
      .array(repositorySchema)
      .parse(json)
      .filter((repo) => !repo.private && !repo.fork && !repo.archived)
      .slice(0, 12)
      .map(mapRepo);
    const data: ActivitySnapshot = {
      source: 'github',
      fetchedAt,
      repos,
      note: 'Public GitHub repositories sorted by push time. This is a partial view of public activity, not a complete account of current work or priorities.',
    };
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    signal?.throwIfAborted();
    // Only successful live lookups enter the cache, so failures can recover.
    return portfolioFallback(fetchedAt);
  }
}
