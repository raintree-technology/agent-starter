import { GitFork, Star } from "lucide-react"

type RepoStats = { stars: number; forks: number }
type RepoStatsResult = { ok: true; data: RepoStats } | { ok: false; reason: string }

const GITHUB_REPO_URL = "https://api.github.com/repos/raintree-technology/claude-starter"
const GITHUB_REVALIDATE_SECONDS = 60
const GITHUB_FETCH_TIMEOUT_MS = 3_000
const GITHUB_FETCH_ATTEMPTS = 2
const GITHUB_RETRY_DELAY_MS = 250

function isRepoPayload(value: unknown): value is { stargazers_count: number; forks_count: number } {
  if (!value || typeof value !== "object") {
    return false
  }

  const payload = value as Record<string, unknown>
  return (
    typeof payload.stargazers_count === "number" &&
    Number.isFinite(payload.stargazers_count) &&
    payload.stargazers_count >= 0 &&
    typeof payload.forks_count === "number" &&
    Number.isFinite(payload.forks_count) &&
    payload.forks_count >= 0
  )
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchStatsAttempt(): Promise<RepoStats> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GITHUB_FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(GITHUB_REPO_URL, {
      next: { revalidate: GITHUB_REVALIDATE_SECONDS },
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`)
    }

    const payload: unknown = await res.json()
    if (!isRepoPayload(payload)) {
      throw new Error("GitHub API response schema changed")
    }

    return {
      stars: payload.stargazers_count,
      forks: payload.forks_count,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchStats(): Promise<RepoStatsResult> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= GITHUB_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const data = await fetchStatsAttempt()
      return { ok: true, data }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < GITHUB_FETCH_ATTEMPTS) {
        await delay(GITHUB_RETRY_DELAY_MS * attempt)
      }
    }
  }

  return {
    ok: false,
    reason: lastError?.message ?? "GitHub API request failed",
  }
}

export async function GitHubStats({ className = "" }: { className?: string }) {
  const result = await fetchStats()
  if (!result.ok) {
    return (
      <span
        className={`font-mono text-xs text-muted-foreground ${className}`}
        title={`GitHub stats unavailable: ${result.reason}`}
      >
        GitHub
      </span>
    )
  }

  const { stars, forks } = result.data
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
  )
}
