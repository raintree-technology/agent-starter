import Link from "next/link";
import { Github, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubStats } from "@/components/github-stats";

const REPO = "https://github.com/raintree-technology/claude-starter";
const DOCPULL = "https://docpull.raintree.technology";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Inside />
        <Skills />
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
          <span className="font-mono text-sm font-semibold tracking-tight">claude-starter</span>
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
    " ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗",
    "██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝",
    "██║     ██║     ███████║██║   ██║██║  ██║█████╗  ",
    "██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ",
    "╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗",
    " ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝",
  ].join("\n");
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
      <div className="mb-10 hidden justify-center sm:flex" aria-hidden="true">
        <pre className="w-max whitespace-pre bg-gradient-to-b from-foreground/80 to-foreground/20 bg-clip-text text-left font-mono text-[8px] leading-[1.1] text-transparent sm:text-[10px] md:text-[12px]">
{wordmark}
        </pre>
      </div>
      <h1 className="font-mono text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        Drop in skills.<br />
        <span className="text-muted-foreground">Ship with Claude.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
        A <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.claude/</code>{" "}
        starter for Claude Code, Codex, and opencode.
      </p>

      <div className="mt-10 inline-flex items-center gap-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 font-mono text-sm">
        <span className="select-none border-r border-border/60 px-3 py-2.5 text-muted-foreground">$</span>
        <code className="px-4 py-2.5">git clone github.com/raintree-technology/claude-starter</code>
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

/* ---------------- Inside .claude/ ---------------- */

function Inside() {
  const rows: Array<{ path: string; note?: string; dim?: boolean }> = [
    { path: ".claude/" },
    { path: "├── skills/",       note: "auto-invoked experts" },
    { path: "│   ├── anthropic/", dim: true },
    { path: "│   ├── stripe/",    dim: true },
    { path: "│   ├── supabase/",  dim: true },
    { path: "│   └── …",          dim: true },
    { path: "├── commands/",     note: "slash commands" },
    { path: "├── hooks/",        note: "secret-guard, pre/post-tool" },
    { path: "├── utils/toon/",   note: "token-optimized format" },
    { path: "└── settings.json", note: "permissions, env, MCP" },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Inside .claude/</SectionLabel>
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

type Skill = { name: string; slug?: string };

function Skills() {
  const groups: { group: string; items: Skill[] }[] = [
    { group: "AI",         items: [{ name: "anthropic", slug: "anthropic" }, { name: "toon-formatter" }] },
    { group: "Payments",   items: [{ name: "stripe", slug: "stripe" }, { name: "whop" }, { name: "shopify", slug: "shopify" }, { name: "plaid", slug: "plaid" }] },
    { group: "Backend",    items: [{ name: "supabase", slug: "supabase" }, { name: "helius" }] },
    { group: "Mobile",     items: [{ name: "expo", slug: "expo" }, { name: "ios", slug: "apple" }, { name: "HIG Doctor" }] },
    { group: "Blockchain", items: [{ name: "aptos", slug: "aptos" }, { name: "aptos/shelby", slug: "aptos" }, { name: "decibel" }] },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Skills</SectionLabel>
        <div className="mt-8 space-y-6">
          {groups.map((g) => (
            <div key={g.group} className="grid gap-4 md:grid-cols-[140px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {g.group}
              </h3>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <span
                    key={it.name}
                    className="inline-flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 font-mono text-sm"
                  >
                    <SkillLogo item={it} />
                    {it.name}
                  </span>
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
  if (item.slug) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${item.slug}/currentColor`}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        className="h-3.5 w-3.5 opacity-80"
        loading="lazy"
      />
    );
  }
  const letter = item.name.replace(/^aptos\//, "").charAt(0).toUpperCase();
  return (
    <span className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-border/80 font-mono text-[8px] font-bold leading-none">
      {letter}
    </span>
  );
}

/* ---------------- Install ---------------- */

function Install() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Install</SectionLabel>
        <ol className="mt-8 space-y-5 font-mono text-sm">
          <Snippet step="1" code="git clone https://github.com/raintree-technology/claude-starter" />
          <Snippet step="2" code="cp -r claude-starter/.claude ./" />
          <Snippet step="3" code="docpull https://docs.stripe.com -o .claude/skills/stripe/docs" hint="optional · pull docs" />
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
          <span className="font-mono">claude-starter</span>
          <span>· MIT</span>
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
