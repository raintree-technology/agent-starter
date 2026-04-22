import { Star, GitFork } from "lucide-react";

type Repo = { stargazers_count: number; forks_count: number };

async function fetchStats(): Promise<Repo | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/raintree-technology/claude-starter",
      {
        next: { revalidate: 60 },
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as Repo;
  } catch {
    return null;
  }
}

export async function GitHubStats({
  fallbackStars = 74,
  fallbackForks = 8,
  className = "",
}: {
  fallbackStars?: number;
  fallbackForks?: number;
  className?: string;
}) {
  const data = await fetchStats();
  const stars = data?.stargazers_count ?? fallbackStars;
  const forks = data?.forks_count ?? fallbackForks;
  return (
    <span className={`inline-flex items-center gap-3 font-mono text-xs text-muted-foreground ${className}`}>
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5" />
        {stars.toLocaleString()}
      </span>
      <span className="inline-flex items-center gap-1">
        <GitFork className="h-3.5 w-3.5" />
        {forks.toLocaleString()}
      </span>
    </span>
  );
}
