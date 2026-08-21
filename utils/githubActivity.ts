export interface RepoSummary {
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface ActivitySnapshot {
  source: 'github' | 'fallback';
  fetchedAt: string;
  repos: RepoSummary[];
}

const GITHUB_USER = 'FradSer';
const CACHE_TTL_MS = 10 * 60_000;

// Curated fallback used when the GitHub API is unreachable or rate-limited.
const FALLBACK_REPOS: RepoSummary[] = [
  {
    name: 'codeterrier',
    description: 'Active development project with device activation/login flows',
    url: 'https://github.com/FradSer/codeterrier',
    language: 'TypeScript',
    stars: 0,
    pushedAt: '2026-08-21',
  },
  {
    name: 'hud-playground',
    description: 'Interactive HUD scenario gallery',
    url: 'https://github.com/FradSer/hud-playground',
    language: 'TypeScript',
    stars: 0,
    pushedAt: '2026-08-21',
  },
  {
    name: 'pi-packages',
    description: 'Packages for the pi coding agent ecosystem',
    url: 'https://github.com/FradSer/pi-packages',
    language: 'TypeScript',
    stars: 2,
    pushedAt: '2026-08-21',
  },
  {
    name: 'dotclaude',
    description:
      'Comprehensive development environment with specialized AI agents for code review, security analysis, and technical leadership',
    url: 'https://github.com/FradSer/dotclaude',
    language: 'JavaScript',
    stars: 582,
    pushedAt: '2026-08-21',
  },
  {
    name: 'mcp-server-apple-events',
    description: 'MCP server providing native macOS integration with Apple Reminders and Calendar via EventKit',
    url: 'https://github.com/FradSer/mcp-server-apple-events',
    language: 'TypeScript',
    stars: 183,
    pushedAt: '2026-08-19',
  },
  {
    name: 'open-deskos',
    description: 'Open desktop OS firmware experiments with ESP32-S3 board support',
    url: 'https://github.com/FradSer/open-deskos',
    language: 'C',
    stars: 0,
    pushedAt: '2026-08-20',
  },
  {
    name: 'skills',
    description: 'Managing Claude skills (specialized workflows and domain knowledge)',
    url: 'https://github.com/FradSer/skills',
    language: 'Python',
    stars: 4,
    pushedAt: '2026-08-21',
  },
  {
    name: 'agentmesh',
    description: 'Open registry for A2A-compliant agents running entirely on Cloudflare',
    url: 'https://github.com/FradSer/agentmesh',
    language: 'TypeScript',
    stars: 0,
    pushedAt: '2026-08-07',
  },
];

let cache: { data: ActivitySnapshot; expiresAt: number } | null = null;

function mapRepo(raw: {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
}): RepoSummary {
  return {
    name: raw.name,
    description: raw.description ?? '',
    url: raw.html_url,
    language: raw.language,
    stars: raw.stargazers_count,
    pushedAt: raw.pushed_at.slice(0, 10),
  };
}

export async function getRecentRepos(): Promise<ActivitySnapshot> {
  if (cache && Date.now() < cache.expiresAt) return cache.data;

  const fetchedAt = new Date().toISOString();
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=30&type=owner`,
      { headers, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);

    const json = (await res.json()) as Parameters<typeof mapRepo>[0][];
    const repos = json
      .filter((r) => !(r as unknown as { fork: boolean }).fork)
      .slice(0, 12)
      .map(mapRepo);

    const data: ActivitySnapshot = { source: 'github', fetchedAt, repos };
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    // Serve the curated snapshot; do not cache failures so we retry next request.
    return { source: 'fallback', fetchedAt, repos: FALLBACK_REPOS };
  }
}
