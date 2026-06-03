import Link from "next/link";
import { connection } from "next/server";
import { Github, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubStats } from "@/components/github-stats";

const REPO = "https://github.com/raintree-technology/claude-starter";
const DOCPULL = "https://docpull.raintree.technology";

export default async function Home() {
  await connection();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Inside />
        <Skills />
        <Benchmarks />
        <Install />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Header ---------------- */

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-mono text-sm font-semibold tracking-tight">agent-starter</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 hover:border-border hover:bg-muted/60"
          >
            <Github className="h-3.5 w-3.5" />
            <GitHubStats />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-6 w-6 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M24 9a10 10 0 1 0 0 14" />
      <path d="M12.5 13l3 3-3 3" />
      <path d="M17.5 19h3.5" />
    </svg>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const wordmark = [
    " █████╗  ██████╗ ███████╗███╗   ██╗████████╗",
    "██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝",
    "███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ",
    "██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ",
    "██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ",
    "╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ",
  ].join("\n");
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
      <div className="mb-10 hidden justify-center sm:flex" aria-hidden="true">
        <pre className="w-max whitespace-pre bg-gradient-to-b from-foreground/80 to-foreground/20 bg-clip-text text-left font-mono text-[8px] leading-[1.1] text-transparent sm:text-[10px] md:text-[12px]">
{wordmark}
        </pre>
      </div>
      <h1 className="font-mono text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        One skill pack.<br />
        <span className="text-muted-foreground">Three agent targets.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
        Opinionated skill templates for Claude Code, Codex, and Cursor. Install the same shipped skills into{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.claude/</code>,{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.codex/</code>, and{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.cursor/rules/</code>.
      </p>

      <div className="mt-10 inline-flex items-center gap-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 font-mono text-sm">
        <span className="select-none border-r border-border/60 px-3 py-2.5 text-muted-foreground">$</span>
        <code className="px-4 py-2.5">npx create-agent-starter@3.0.1 --agent all</code>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          View on GitHub
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Agent targets ---------------- */

function Inside() {
  const rows: Array<{ path: string; note?: string; dim?: boolean }> = [
    { path: ".claude/",               note: "Claude Code skills, commands, settings" },
    { path: ".codex/",                note: "Codex local skill files" },
    { path: "AGENTS.md",              note: "Codex project guidance" },
    { path: ".cursor/rules/",         note: "Cursor project rules" },
    { path: "├── agent-starter.mdc",  dim: true },
    { path: "├── stripe.mdc",         dim: true },
    { path: "├── copywriting-frameworks.mdc", dim: true },
    { path: "└── ...",                dim: true },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Agent targets</SectionLabel>
        <pre className="mt-8 overflow-x-auto font-mono text-[13px] leading-[1.9]">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className={r.dim ? "text-muted-foreground" : "text-foreground"}>{r.path}</span>
              {r.note && (
                <span className="hidden whitespace-nowrap text-muted-foreground sm:inline">
                  {r.note}
                </span>
              )}
            </div>
          ))}
        </pre>
      </div>
    </section>
  );
}

/* ---------------- Skills ---------------- */

type Skill = { name: string; blurb: string };

function Skills() {
  const groups: { group: string; items: Skill[] }[] = [
    {
      group: "Fintech",
      items: [
        { name: "stripe", blurb: "Checkout, Payment Intents, subscriptions, Connect, Terminal, Radar, Treasury, webhooks, with detailed references." },
        { name: "plaid", blurb: "Link flow, Auth (ACH), Transactions sync, Identity (KYC), Accounts. One consolidated skill." },
      ],
    },
    {
      group: "Backend",
      items: [
        { name: "supabase", blurb: "Postgres + RLS, Auth with SSR cookies, Realtime, Storage, Edge Functions, pgvector." },
      ],
    },
    {
      group: "Mobile",
      items: [
        { name: "expo", blurb: "EAS Build (eas.json, credentials, CI), EAS Update (OTA, channels, staged rollouts), Expo Router." },
      ],
    },
    {
      group: "Growth",
      items: [
        { name: "copywriting-frameworks", blurb: "Direct-response workflows for headlines, ads, landing pages, emails, CTAs, objections, and critiques." },
      ],
    },
    {
      group: "Agent tooling",
      items: [
        { name: "anthropic", blurb: "Claude API + 6 agent meta-tooling sub-skills: skill/command/hook/MCP/settings builders." },
        { name: "toon-formatter", blurb: "When to reach for TOON, when not. Wraps @toon-format/toon." },
      ],
    },
    {
      group: "Cleanup",
      items: [
        { name: "cleanup-all", blurb: "Runs the ordered cleanup pipeline across unused code, cycles, dedupe, types, defensive code, legacy paths, and comments." },
        { name: "cleanup-unused", blurb: "Finds high-confidence dead code, exports, files, and dependencies before applying verified removals." },
        { name: "cleanup-slop", blurb: "Removes AI narration and restated-code comments while preserving useful WHY comments." },
      ],
    },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Skills</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Sixteen hand-maintained skills generated into each agent&apos;s native project shape. Claude gets skills and slash commands, Codex gets `AGENTS.md` plus local `SKILL.md` files, and Cursor gets `.mdc` project rules.
        </p>
        <div className="mt-8 space-y-6">
          {groups.map((g) => (
            <div key={g.group} className="grid gap-4 md:grid-cols-[160px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {g.group}
              </h3>
              <div className="space-y-3">
                {g.items.map((it) => (
                  <div key={it.name} className="rounded-md border border-border/60 px-3 py-2.5">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <SkillLogo item={it} />
                      {it.name}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{it.blurb}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillLogo({ item }: { item: Skill }) {
  const letter = item.name.charAt(0).toUpperCase();
  return (
    <span className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-border/80 font-mono text-[8px] font-bold leading-none">
      {letter}
    </span>
  );
}

/* ---------------- Benchmarks ---------------- */

type Row = { workload: string; jsonTokens: number; toonTokens: number; savings: string };

function Benchmarks() {
  const rows: Row[] = [
    { workload: "API response (50 users)",    jsonTokens: 4133,  toonTokens: 2128, savings: "48.5%" },
    { workload: "DB transactions (100 rows)", jsonTokens: 5708,  toonTokens: 2252, savings: "60.5%" },
    { workload: "Logs (200 events)",          jsonTokens: 13052, toonTokens: 6266, savings: "52.0%" },
    { workload: "Metrics (288 points)",       jsonTokens: 13537, toonTokens: 4622, savings: "65.9%" },
    { workload: "Irregular nested",           jsonTokens: 135,   toonTokens: 80,   savings: "40.7%" },
    { workload: "Small array (3 items)",      jsonTokens: 62,    toonTokens: 27,   savings: "56.5%" },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Measured savings</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Real token counts from{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">gpt-tokenizer</code>{" "}
          (OpenAI BPE — directional proxy for Claude&apos;s tokenizer). Run{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">node bench/run.mjs</code>{" "}
          locally to reproduce. Workloads are seeded and deterministic.
        </p>
        <div className="mt-8 overflow-x-auto rounded-md border border-border/60">
          <table className="w-full font-mono text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-normal">Workload</th>
                <th className="px-4 py-2.5 text-right font-normal">JSON tokens</th>
                <th className="px-4 py-2.5 text-right font-normal">TOON tokens</th>
                <th className="px-4 py-2.5 text-right font-normal">Savings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.workload} className="border-t border-border/60">
                  <td className="px-4 py-2.5">{r.workload}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.jsonTokens.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">{r.toonTokens.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{r.savings}</td>
                </tr>
              ))}
              <tr className="border-t border-border/60 bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">Aggregate</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">36,627</td>
                <td className="px-4 py-2.5 text-right">15,375</td>
                <td className="px-4 py-2.5 text-right font-semibold">58.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Full methodology + raw data:{" "}
          <Link href={`${REPO}/blob/main/bench/RESULTS.md`} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            bench/RESULTS.md
          </Link>
          . For exact Claude token counts, use Anthropic&apos;s{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">/v1/messages/count_tokens</code>{" "}
          endpoint.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Install ---------------- */

function Install() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Install</SectionLabel>
        <ol className="mt-8 space-y-5 font-mono text-sm">
          <Snippet step="1" code="npx create-agent-starter@3.0.1 --agent all" hint="all supported agents" />
          <Snippet step="2" code="npx create-agent-starter@3.0.1 --agent codex,cursor --skills stripe,copywriting-frameworks" hint="targeted install" />
          <Snippet step="3" code="npm i @toon-format/toon gpt-tokenizer" hint="for Claude /toon-* commands" />
        </ol>
      </div>
    </section>
  );
}

function Snippet({ step, code, hint }: { step: string; code: string; hint?: string }) {
  return (
    <li className="grid gap-3 sm:grid-cols-[32px_1fr_auto] sm:items-center">
      <span className="font-mono text-xs text-muted-foreground">{step}</span>
      <code className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="select-none text-muted-foreground">$ </span>
        {code}
      </code>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </li>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-mono">agent-starter</span>
          <span>- MIT</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href={REPO} target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </Link>
          <Link href={DOCPULL} target="_blank" rel="noreferrer" className="hover:text-foreground">
            docpull
          </Link>
          <Link href="https://github.com/raintree-technology" target="_blank" rel="noreferrer" className="hover:text-foreground">
            Raintree
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- primitives ---------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span className="h-px w-6 bg-border" />
      {children}
    </div>
  );
}
