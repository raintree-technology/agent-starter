# claude.raintree.technology

Raintree Technology landing page for [agent-starter](https://github.com/raintree-technology/agent-starter).

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Bun package manager
- Tailwind CSS + shadcn/ui primitives
- next-themes for dark mode
- lucide-react icons

## Develop

```bash
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000.

## Scripts

```bash
bun run check
bun run lint
bun run typecheck
bun run build
```

## Environment

Copy `site/.env.example` for local development when needed. It only contains `NEXT_PUBLIC_APP_URL`.

## Deploy

Deploy to Vercel and point `claude.raintree.technology` at the project via CNAME.

## License

The site is part of the MIT-licensed `agent-starter` repository.
