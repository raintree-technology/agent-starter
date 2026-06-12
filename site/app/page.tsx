import { ArrowRight, Github } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { connection } from "next/server"
import { GitHubStats } from "@/components/github-stats"
import { ThemeToggle } from "@/components/theme-toggle"
import { absoluteUrl, siteConfig } from "@/lib/site"

const REPO = siteConfig.repoUrl
const DOCPULL = siteConfig.docpullUrl

export default async function Home() {
  await connection()
  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <div className="min-h-screen bg-background">
      <Link
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-background px-4 py-2 font-mono text-sm opacity-0 shadow-lg ring-1 ring-border transition focus:translate-y-0 focus:opacity-100"
      >
        Skip to main content
      </Link>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <StructuredData nonce={nonce} />
        <Hero />
        <Manifest />
        <Inside />
        <Profiles />
        <Skills />
        <Benchmarks />
        <Install />
      </main>
      <Footer />
    </div>
  )
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
          <nav
            className="hidden items-center gap-3 font-mono text-xs text-muted-foreground md:flex"
            aria-label="Sections"
          >
            <Link href="#manifest" className="hover:text-foreground">
              agent.json
            </Link>
            <Link href="#profiles" className="hover:text-foreground">
              Profiles
            </Link>
            <Link href="#skills" className="hover:text-foreground">
              Skills
            </Link>
            <Link href="#benchmarks" className="hover:text-foreground">
              Benchmarks
            </Link>
            <Link href="#install" className="hover:text-foreground">
              Install
            </Link>
          </nav>
          <Link
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View agent-starter on GitHub"
            className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 hover:border-border hover:bg-muted/60"
          >
            <Github className="h-3.5 w-3.5" />
            <GitHubStats />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
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
  )
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
  ].join("\n")
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
      <div className="mb-10 hidden justify-center sm:flex" aria-hidden="true">
        <pre className="w-max whitespace-pre bg-gradient-to-b from-foreground/80 to-foreground/20 bg-clip-text text-left font-mono text-[8px] leading-[1.1] text-transparent sm:text-[10px] md:text-[12px]">
          {wordmark}
        </pre>
      </div>
      <h1 className="font-mono text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        One agent.json.
        <br />
        <span className="text-muted-foreground">Three agent targets.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
        The package.json for agent environments. Declare skills, MCP servers, and a stack profile in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">agent.json</code>;{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">sync</code> writes
        native config for{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.claude/</code>,{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.codex/</code>, and{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground">.cursor/</code>.
      </p>

      <div className="mt-10 inline-flex items-center gap-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 font-mono text-sm">
        <span className="select-none border-r border-border/60 px-3 py-2.5 text-muted-foreground">$</span>
        <code className="px-4 py-2.5">npx create-agent-starter@latest --agent all</code>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          View on GitHub
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}

/* ---------------- agent.json manifest ---------------- */

function Manifest() {
  const manifest = [
    `{`,
    `  "version": 1,`,
    `  "profile": "next-saas",`,
    `  "targets": ["claude", "codex", "cursor"],`,
    `  "skills": ["finish-setup", "cleanup-unused", "copywriting-frameworks"],`,
    `  "mcps": [`,
    `    { "name": "neon",   "command": "npx", "args": ["-y", "@neondatabase/mcp-server-neon"] },`,
    `    { "name": "stripe", "command": "npx", "args": ["-y", "@stripe/mcp"] }`,
    `  ]`,
    `}`,
  ].join("\n")
  const commands = [
    { code: "npx agent-starter sync", note: "agent.json → native config for every target" },
    { code: "npx agent-starter status", note: "diff manifest vs configs; exits 1 on drift" },
    { code: "npx agent-starter add mcp neon", note: "catalog: github, neon, stripe, resend, posthog" },
    { code: "npx agent-starter add skill cleanup-types", note: "add a shipped skill and re-sync" },
  ]
  return (
    <section id="manifest" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>agent.json</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          One declarative manifest for the whole agent environment. Check it into git; every contributor runs{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">npx agent-starter sync</code> and
          gets identical skills and MCP servers in whichever agent they use. Sync is idempotent — generated sections are
          fenced with markers, manual edits outside them survive, and MCP entries agent-starter didn&apos;t write are
          never touched. Secrets stay{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">{"${VAR}"}</code> references,
          resolved by each agent at runtime.
        </p>
        <pre className="mt-8 overflow-x-auto rounded-md border border-border/60 bg-muted/40 px-4 py-3.5 font-mono text-[13px] leading-[1.7]">
          {manifest}
        </pre>
        <ul className="mt-6 space-y-3 font-mono text-sm">
          {commands.map((c) => (
            <li key={c.code} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <code className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 px-4 py-2.5">
                <span className="select-none text-muted-foreground">$ </span>
                {c.code}
              </code>
              <span className="text-xs text-muted-foreground">{c.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- Agent targets ---------------- */

function Inside() {
  const rows: Array<{ path: string; note?: string; dim?: boolean }> = [
    { path: "agent.json", note: "the manifest — profile, targets, skills, MCPs" },
    { path: ".claude/ + .mcp.json", note: "Claude Code skills, commands, settings, MCP servers" },
    { path: ".codex/ + AGENTS.md", note: "Codex skill files, config.toml MCPs, project guidance" },
    { path: ".cursor/rules/ + .cursor/mcp.json", note: "Cursor project rules and MCP servers" },
    { path: "├── agent-starter.mdc", dim: true },
    { path: "├── hig-foundations.mdc", dim: true },
    { path: "├── copywriting-frameworks.mdc", dim: true },
    { path: "└── ...", dim: true },
  ]
  return (
    <section id="agent-targets" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Agent targets</SectionLabel>
        <pre className="mt-8 overflow-x-auto font-mono text-[13px] leading-[1.9]">
          {rows.map((r) => (
            <div key={r.path} className="flex items-center justify-between gap-6">
              <span className={r.dim ? "text-muted-foreground" : "text-foreground"}>{r.path}</span>
              {r.note && <span className="hidden whitespace-nowrap text-muted-foreground sm:inline">{r.note}</span>}
            </div>
          ))}
        </pre>
      </div>
    </section>
  )
}

/* ---------------- Profiles ---------------- */

function Profiles() {
  const stacks = [
    {
      name: "next-saas",
      stack: "Next.js SaaS (next-starter)",
      skills: "finish-setup, cleanup, copywriting",
      mcps: "neon, stripe, resend, posthog, github",
    },
    {
      name: "next",
      stack: "Generic Next.js",
      skills: "cleanup-unused, cleanup-types",
      mcps: "github",
    },
    {
      name: "node",
      stack: "Generic Node.js",
      skills: "cleanup-unused, cleanup-types",
      mcps: "github",
    },
    {
      name: "base",
      stack: "Anything else",
      skills: "cleanup-unused",
      mcps: "none",
    },
  ]
  return (
    <section id="profiles" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Stack profiles</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          A stack profile bundles the skills <em>and</em> MCP servers a project type needs, so setup is one command
          instead of a scavenger hunt for server packages.{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">init</code> auto-detects the right
          one from <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">package.json</code>.
          Skill-set profiles (<code className="font-mono">all</code>, <code className="font-mono">apple-hig</code>,{" "}
          <code className="font-mono">design-hci</code>, <code className="font-mono">minimal</code>) still exist for
          picking skills without MCPs.
        </p>
        <div className="mt-8 overflow-x-auto rounded-md border border-border/60">
          <table className="w-full font-mono text-sm">
            <caption className="sr-only">Stack profiles with bundled skills and MCP servers</caption>
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-normal">Profile</th>
                <th className="px-4 py-2.5 font-normal">Stack</th>
                <th className="px-4 py-2.5 font-normal">Skills</th>
                <th className="px-4 py-2.5 font-normal">MCP servers</th>
              </tr>
            </thead>
            <tbody>
              {stacks.map((p) => (
                <tr key={p.name} className="border-t border-border/60">
                  <td className="px-4 py-2.5 font-semibold">{p.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.stack}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.skills}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.mcps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">next-saas</code> is the flagship. It
          ships the <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">finish-setup</code> skill:
          after scaffolding, open your agent and say &ldquo;finish setup&rdquo; — it creates Stripe products matching
          your billing plans, verifies database migrations, and walks email-domain DNS through the wired MCPs.
        </p>
      </div>
    </section>
  )
}

/* ---------------- Skills ---------------- */

type Skill = { name: string; blurb: string }

function Skills() {
  const groups: { group: string; items: Skill[] }[] = [
    {
      group: "Design / HCI",
      items: [
        {
          name: "human-processor-model",
          blurb:
            "Models perceptual, cognitive, motor, and memory costs to estimate task time and reveal usability bottlenecks.",
        },
        {
          name: "goms-klm-analysis",
          blurb:
            "Compares task flows with GOMS/KLM operators, waits, selection rules, and expert-user interaction cost.",
        },
      ],
    },
    {
      group: "Apple HIG",
      items: [
        {
          name: "hig-doctor-audit",
          blurb:
            "Runs HIG Doctor audits with npx hig-doctor, exported reports, severity gates, and category-to-skill routing.",
        },
        {
          name: "hig-project-context",
          blurb:
            "Creates shared Apple design context so other HIG skills can tailor guidance without repeated setup questions.",
        },
        {
          name: "hig-foundations",
          blurb:
            "Color, typography, SF Symbols, dark mode, accessibility, layout, materials, motion, privacy, and writing.",
        },
        {
          name: "hig-platforms",
          blurb: "Platform-specific design guidance for iOS, iPadOS, macOS, tvOS, visionOS, watchOS, and games.",
        },
        {
          name: "hig-patterns",
          blurb:
            "UX patterns for onboarding, launch, loading, permissions, feedback, undo, settings, sharing, and collaboration.",
        },
        {
          name: "hig-inputs",
          blurb:
            "Gestures, keyboards, pointers, Apple Pencil, Digital Crown, focus, remotes, eye tracking, and spatial input.",
        },
        {
          name: "hig-technologies",
          blurb:
            "Siri, Apple Pay, HealthKit, ARKit, iCloud, Sign in with Apple, SharePlay, Wallet, VoiceOver, and more.",
        },
        {
          name: "hig-components-content",
          blurb: "Charts, collections, image views, web views, color wells, image wells, lockups, and share sheets.",
        },
        {
          name: "hig-components-layout",
          blurb: "Sidebars, split views, tab bars, scroll views, windows, panels, lists, tables, and ornaments.",
        },
        {
          name: "hig-components-menus",
          blurb: "Buttons, context menus, toolbars, the menu bar, pop-up buttons, pull-downs, and disclosure controls.",
        },
        {
          name: "hig-components-search",
          blurb: "Search fields, page controls, path controls, search scopes, suggestions, and pagination.",
        },
        {
          name: "hig-components-dialogs",
          blurb: "Alerts, action sheets, popovers, sheets, destructive confirmations, and digit entry views.",
        },
        {
          name: "hig-components-controls",
          blurb: "Pickers, toggles, sliders, steppers, segmented controls, text fields, labels, and validation.",
        },
        {
          name: "hig-components-status",
          blurb: "Progress indicators, loading states, status bars, determinate progress, and activity rings.",
        },
        {
          name: "hig-components-system",
          blurb: "Widgets, Live Activities, notifications, complications, App Clips, shortcuts, and watch faces.",
        },
      ],
    },
    {
      group: "Growth",
      items: [
        {
          name: "copywriting-frameworks",
          blurb:
            "Direct-response workflows for headlines, ads, landing pages, emails, CTAs, objections, and critiques.",
        },
      ],
    },
    {
      group: "Workflow",
      items: [
        {
          name: "finish-setup",
          blurb:
            "Provisions a freshly scaffolded SaaS project through the wired MCPs: Stripe products, database migrations, email DNS, analytics, GitHub.",
        },
      ],
    },
    {
      group: "Utilities",
      items: [{ name: "toon-formatter", blurb: "When to reach for TOON, when not. Wraps @toon-format/toon." }],
    },
    {
      group: "Cleanup",
      items: [
        {
          name: "cleanup-all",
          blurb:
            "Runs the ordered cleanup pipeline across unused code, cycles, dedupe, types, defensive code, legacy paths, and comments.",
        },
        {
          name: "cleanup-unused",
          blurb: "Finds high-confidence dead code, exports, files, and dependencies before applying verified removals.",
        },
        {
          name: "cleanup-cycles",
          blurb: "Finds circular dependencies, traces import paths, and plans low-risk untangling work.",
        },
        {
          name: "cleanup-dedupe",
          blurb: "Identifies duplicated logic and extracts shared helpers only when the reuse is clear.",
        },
        {
          name: "cleanup-types",
          blurb: "Consolidates duplicated or fragmented type definitions into maintainable shared shapes.",
        },
        {
          name: "cleanup-weak-types",
          blurb: "Replaces weak types with stronger inferred, validated, or locally appropriate types.",
        },
        {
          name: "cleanup-defensive",
          blurb: "Removes pointless guards and catch blocks that hide errors instead of handling them.",
        },
        {
          name: "cleanup-legacy",
          blurb: "Removes zero-caller deprecated paths, fallbacks, and compatibility code after verification.",
        },
        {
          name: "cleanup-slop",
          blurb: "Removes AI narration and restated-code comments while preserving useful WHY comments.",
        },
      ],
    },
  ]
  const skillCount = groups.reduce((total, group) => total + group.items.length, 0)
  return (
    <section id="skills" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Skills</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {skillCount} hand-maintained skills generated into each agent&apos;s native project shape. Claude gets skills
          and slash commands, Codex gets `AGENTS.md` plus local `SKILL.md` files, and Cursor gets `.mdc` project rules.
        </p>
        <div className="mt-8 space-y-6">
          {groups.map((g) => (
            <div key={g.group} className="grid gap-4 md:grid-cols-[160px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{g.group}</h3>
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
  )
}

function SkillLogo({ item }: { item: Skill }) {
  const letter = item.name.charAt(0).toUpperCase()
  return (
    <span className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-border/80 font-mono text-[8px] font-bold leading-none">
      {letter}
    </span>
  )
}

/* ---------------- Benchmarks ---------------- */

type Row = { workload: string; jsonTokens: number; toonTokens: number; savings: string }

function Benchmarks() {
  const rows: Row[] = [
    { workload: "API response (50 users)", jsonTokens: 4133, toonTokens: 2128, savings: "48.5%" },
    { workload: "DB transactions (100 rows)", jsonTokens: 5708, toonTokens: 2252, savings: "60.5%" },
    { workload: "Logs (200 events)", jsonTokens: 13052, toonTokens: 6266, savings: "52.0%" },
    { workload: "Metrics (288 points)", jsonTokens: 13537, toonTokens: 4622, savings: "65.9%" },
    { workload: "Irregular nested", jsonTokens: 135, toonTokens: 80, savings: "40.7%" },
    { workload: "Small array (3 items)", jsonTokens: 62, toonTokens: 27, savings: "56.5%" },
  ]
  return (
    <section id="benchmarks" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Measured savings</SectionLabel>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Real token counts from <code className="rounded bg-muted px-1 py-0.5 font-mono">gpt-tokenizer</code> (OpenAI
          BPE — directional proxy for Claude&apos;s tokenizer). Run{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">node bench/run.mjs</code> locally to reproduce.
          Workloads are seeded and deterministic.
        </p>
        <div className="mt-8 overflow-x-auto rounded-md border border-border/60">
          <table className="w-full font-mono text-sm">
            <caption className="sr-only">TOON token savings benchmark results</caption>
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
          <Link
            href={`${REPO}/blob/main/bench/RESULTS.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            bench/RESULTS.md
          </Link>
          . For exact Claude token counts, use Claude&apos;s{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">/v1/messages/count_tokens</code> endpoint.
        </p>
      </div>
    </section>
  )
}

/* ---------------- Install ---------------- */

function Install() {
  return (
    <section id="install" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <SectionLabel>Install</SectionLabel>
        <ol className="mt-8 space-y-5 font-mono text-sm">
          <Snippet
            step="1"
            code="npx create-agent-starter@latest --agent all"
            hint="init: detect stack, write agent.json, sync"
          />
          <Snippet step="2" code="npx agent-starter sync" hint="teammates: agent.json → native config" />
          <Snippet
            step="3"
            code="npx create-agent-starter@latest --agent codex,cursor --profile apple-hig"
            hint="HIG Doctor profile"
          />
          <Snippet
            step="4"
            code="npx create-agent-starter@latest --agent codex,cursor --skills copywriting-frameworks,cleanup-unused"
            hint="targeted install"
          />
          <Snippet step="5" code="npm i @toon-format/toon gpt-tokenizer" hint="for Claude /toon-* commands" />
        </ol>
      </div>
    </section>
  )
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
  )
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
          <Link href={REPO} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            GitHub
          </Link>
          <Link href={DOCPULL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            docpull
          </Link>
          <Link href={siteConfig.llmsPath} className="hover:text-foreground">
            llms.txt
          </Link>
          <Link href={siteConfig.securityPath} className="hover:text-foreground">
            security.txt
          </Link>
          <Link
            href="https://github.com/raintree-technology"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Raintree
          </Link>
        </div>
      </div>
    </footer>
  )
}

/* ---------------- primitives ---------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span className="h-px w-6 bg-border" />
      {children}
    </h2>
  )
}

function StructuredData({ nonce }: { nonce?: string }) {
  const pageUrl = absoluteUrl("/")
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.organization.name,
        url: siteConfig.organization.url,
        logo: absoluteUrl("/logo.svg"),
        sameAs: [siteConfig.repoUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en-US",
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: siteConfig.title,
        url: pageUrl,
        description: siteConfig.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${pageUrl}#software` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${pageUrl}#software`,
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        description: siteConfig.description,
        url: pageUrl,
        codeRepository: siteConfig.repoUrl,
        license: `${siteConfig.repoUrl}/blob/main/LICENSE`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: pageUrl,
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  )
}
